import os
import uuid
import pathlib
import requests
from flask import Flask, request, jsonify
from pydantic import ValidationError
from validate import CharacterModel
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Импорты для RAG
import nltk
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.retrievers import BM25Retriever
from langchain.retrievers import EnsembleRetriever
from langchain.docstore.document import Document
from sentence_transformers.cross_encoder import CrossEncoder

# --- Конфигурация и загрузка моделей ---
# NLTK больше не требуется для разделения, но может быть полезен для других задач.
# Оставим проверку на всякий случай, если он понадобится в будущем.
try:
    nltk.data.find('tokenizers/punkt/russian.pickle')
    print("NLTK 'punkt' для русского языка уже загружен.")
except LookupError:
    print("Загрузка пакета 'punkt' для NLTK...")
    nltk.download('punkt', quiet=True)
    print("Загрузка 'punkt' завершена.")

# --- Конфигурация и загрузка моделей ---
api_key = os.getenv("GEMINI_API_KEY")
proxy_api_url = os.getenv("PROXY_API_URL")
proxy_api_key = os.getenv("PROXY_API_KEY")

if not api_key:
    raise ValueError("Необходимо установить переменную окружения GEMINI_API_KEY.")
if not proxy_api_url or not proxy_api_key:
    raise ValueError("Необходимо установить переменные окружения PROXY_API_URL и PROXY_API_KEY.")

# Оставляем genai для embeddings, но основная модель будет работать через прокси
genai.configure(api_key=api_key)
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=api_key)
rerank_model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

app = Flask(__name__)
SESSIONS = {}

# --- УЛУЧШЕНИЕ: Функции для продвинутого RAG ---

def get_text_splitter(chunk_size: int = 1000, chunk_overlap: int = 200) -> RecursiveCharacterTextSplitter:
    """
    Создает и настраивает продвинутый разделитель текста.
    """
    return RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=False,
        # Основные разделители для сохранения контекста
        separators=[
            "\n\n",  # Двойной перенос строки (разделение параграфов)
            "\n",    # Одиночный перенос строки (новые строки, списки)
            ". ",    # Конец предложения
            " ",     # Разделение по словам
            "",      # Разделение по символам (в крайнем случае)
        ],
    )

def generate_via_proxy(prompt: str) -> str:
    """
    Отправляет запрос к модели Gemini через указанный прокси-сервер.
    """
    print(f"Отправка запроса через прокси: {proxy_api_url}")
    headers = {
        'Authorization': f'Bearer {proxy_api_key}',
        'Content-Type': 'application/json',
    }
    data = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    
    response = requests.post(proxy_api_url, headers=headers, json=data)
    response.raise_for_status() # Вызовет исключение для кодов 4xx/5xx
    
    # Исправленный парсинг ответа
    json_response = response.json()
    if 'candidates' in json_response and len(json_response['candidates']) > 0:
        content = json_response['candidates'][0].get('content', {})
        if 'parts' in content and len(content['parts']) > 0:
            return content['parts'][0].get('text', '')
    return "" # Возвращаем пустую строку, если ответ не содержит ожидаемых данных


def generate_multiple_queries(query: str) -> list[str]:
    """
    Использует Gemini через прокси для генерации нескольких вариантов поискового запроса.
    """
    print(f"Генерация нескольких запросов для: '{query}'")
    prompt = f"""Проанализируй следующий пользовательский вопрос и сгенерируй 3-5 альтернативных поисковых запросов, которые охватывают разные аспекты этого вопроса.
    Это поможет найти более полную информацию в базе знаний. Выведи каждый запрос на новой строке, без нумерации.

    Пример:
    Вопрос: Расскажи про двигатель и главного инженера проекта 'Восход'.
    Результат:
    Технические характеристики двигателя проекта 'Восход'
    Биография главного инженера проекта 'Восход'
    История создания проекта 'Восход'

    Вопрос: {query}
    Результат:"""
    try:
        response_text = generate_via_proxy(prompt)
        queries = [q.strip() for q in response_text.strip().split('\n') if q.strip()]
        print(f"Сгенерированные запросы: {queries}")
        return queries if queries else [query]
    except Exception as e:
        print(f"Ошибка при генерации запросов через прокси: {e}. Используется исходный запрос.")
        return [query]

def create_character_prompt(character_data, rag_context, user_message):
    # Эта функция остается почти без изменений
    prompt = f"""
Ты — актер, который должен идеально сыграть роль персонажа. Вживись в роль, используя следующие данные.

### ПАСПОРТ ПЕРСОНАЖА (СТРОГИЕ ДАННЫЕ) ###
{character_data.model_dump_json(indent=2)}

"""
    if rag_context:
        prompt += f"""
### ДОПОЛНИТЕЛЬНЫЙ КОНТЕКСТ ИЗ БАЗЫ ЗНАНИЙ (используй эту информацию для ответа) ###
{rag_context}

"""
    
    prompt += f"""
### ЗАДАЧА ###
Ответь на сообщение пользователя, полностью соответствуя образу персонажа, его манере речи и ИСПОЛЬЗУЯ предоставленный контекст из базы знаний.

Сообщение пользователя: "{user_message}"

Твой ответ:
"""
    return prompt

# --- РОУТ 1: Настройка персонажа и создание векторной базы ---
@app.route('/setup_character', methods=['POST'])
def setup_character():
    session_id = str(uuid.uuid4())
    print(f"[{session_id}] Начало обработки запроса /setup_character")

    if 'character_json' not in request.form:
        print(f"[{session_id}] Ошибка: отсутствует 'character_json'.")
        return jsonify({"error": "Отсутствует обязательная часть 'character_json' в form-data."}), 400
    
    json_data_str = request.form['character_json']

    try:
        character_data = CharacterModel.model_validate_json(json_data_str)
        print(f"[{session_id}] JSON персонажа успешно валидирован.")
    except ValidationError as e:
        print(f"[{session_id}] Ошибка валидации JSON: {e.errors()}")
        return jsonify({"status": "error", "message": "JSON данные невалидны.", "errors": e.errors()}), 400

    session_data = {"character_data": character_data}

    if 'context_file' in request.files:
        file = request.files['context_file']
        if file and file.filename:
            print(f"[{session_id}] Найден файл контекста: {file.filename}")
            try:
                file_content = file.read().decode('utf-8')
                print(f"Содержимое файла: {file_content}")
                
                if not file_content.strip():
                    print(f"[{session_id}] Предупреждение: Файл контекста пуст. RAG не будет создан.")
                else:
                    print(f"[{session_id}] Файл прочитан, {len(file_content)} символов. Начинаю создание RAG.")
                    # 1. Продвинутое разделение на чанки
                    text_splitter = get_text_splitter()
                    documents = text_splitter.create_documents([file_content])
                    
                    if not documents:
                        raise ValueError("Не удалось разделить текст на документы. Возможно, файл пуст или имеет неподдерживаемую структуру.")
                    
                    print(f"Текст разделен на {len(documents)} документов (чанков).")

                    # 2. Создание гибридного ретривера
                    print(f"[{session_id}] Создание BM25 ретривера...")
                    bm25_retriever = BM25Retriever.from_documents(documents)
                    bm25_retriever.k = 10

                    print(f"[{session_id}] Создание FAISS векторного хранилища...")
                    vector_store = FAISS.from_documents(documents, embeddings)
                    faiss_retriever = vector_store.as_retriever(search_kwargs={"k": 10})

                    print(f"[{session_id}] Создание гибридного Ensemble ретривера...")
                    session_data["retriever"] = EnsembleRetriever(
                        retrievers=[bm25_retriever, faiss_retriever],
                        weights=[0.5, 0.5]
                    )
                    print(f"[{session_id}] RAG успешно создан.")
                
            except UnicodeDecodeError:
                print(f"[{session_id}] Ошибка декодирования файла. Убедитесь, что файл в кодировке UTF-8.")
                return jsonify({"error": "Ошибка декодирования файла. Файл должен быть в кодировке UTF-8."}), 400
            except Exception as e:
                print(f"[{session_id}] КРИТИЧЕСКАЯ ОШИБКА при обработке файла и создании RAG: {e}")
                # Возвращаем более подробную ошибку для отладки
                import traceback
                return jsonify({"error": f"Ошибка при обработке файла и создании RAG: {str(e)}", "trace": traceback.format_exc()}), 500
        else:
            print(f"[{session_id}] Файл 'context_file' был предоставлен, но он пустой или без имени.")

    SESSIONS[session_id] = session_data
    print(f"[{session_id}] Персонаж '{character_data.characterData.general.name}' успешно настроен.")
    return jsonify({"status": "success", "session_id": session_id})

# --- РОУТ 2: Общение с персонажем с использованием RAG ---
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    if not data or 'session_id' not in data or 'user_message' not in data:
        return jsonify({"error": "Требуются 'session_id' и 'user_message' в JSON-теле запроса."}), 400

    session_id = data['session_id']
    user_message = data['user_message']

    if session_id not in SESSIONS:
        return jsonify({"error": "Указанный session_id не найден."}), 404

    session_data = SESSIONS[session_id]
    rag_context = ""

    if "retriever" in session_data:
        try:
            # 1. Генерация нескольких запросов
            queries = generate_multiple_queries(user_message)

            # 2. Гибридный поиск по всем запросам
            all_candidate_docs = []
            for query in queries:
                print(f"Выполнение гибридного поиска по запросу: '{query}'")
                all_candidate_docs.extend(session_data["retriever"].invoke(query))
            
            # Удаление дубликатов
            unique_docs = {doc.page_content: doc for doc in all_candidate_docs}
            candidate_docs = list(unique_docs.values())
            print(f"Найдено {len(candidate_docs)} уникальных кандидатов.")

            # 3. Переранжирование для выбора лучших 4
            if candidate_docs:
                print("Выполнение переранжирования...")
                pairs = [[user_message, doc.page_content] for doc in candidate_docs]
                scores = rerank_model.predict(pairs)
                
                for i in range(len(scores)):
                    candidate_docs[i].metadata['relevance_score'] = scores[i]
                
                reranked_docs = sorted(candidate_docs, key=lambda x: x.metadata['relevance_score'], reverse=True)
                
                final_docs = reranked_docs[:4]
                rag_context = "\n\n---\n\n".join([doc.page_content for doc in final_docs])
                print(f"Найден релевантный контекст после переранжирования:\n{rag_context}")
            
        except Exception as e:
            print(f"Ошибка при работе с RAG: {e}")
    
    try:
        full_prompt = create_character_prompt(
            session_data["character_data"], 
            rag_context, 
            user_message
        )
        
        print(f"--- ИТОГОВЫЙ ПРОМПТ ДЛЯ СЕССИИ {session_id} ---")
        print(full_prompt)
        print("------------------------------------")
        
        character_response = generate_via_proxy(full_prompt)
        
        return jsonify({"status": "success", "response": character_response})

    except Exception as e:
        return jsonify({"error": f"Ошибка при обращении к прокси Gemini: {e}"}), 500

if __name__ == '__main__':
    port = int(os.getenv('RAG_PORT', 5000))
    host = '0.0.0.0'
    print(f"Сервер запускается на http://{host}:{port}")
    app.run(host=host, port=port, debug=True)
