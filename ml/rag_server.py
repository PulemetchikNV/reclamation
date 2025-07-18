import os
import uuid
import pathlib
from flask import Flask, request, jsonify
from pydantic import ValidationError
from validate import CharacterModel
import google.generativeai as genai

# Импорты для RAG
import nltk
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.retrievers import BM25Retriever, EnsembleRetriever
from langchain.docstore.document import Document
from sentence_transformers.cross_encoder import CrossEncoder

# --- Конфигурация и загрузка моделей ---
# Автоматическая загрузка необходимых данных для NLTK при первом запуске
try:
    nltk.data.find('tokenizers/punkt')
except nltk.downloader.DownloadError:
    print("Загрузка пакета 'punkt' для NLTK (требуется для разделения на предложения)...")
    nltk.download('punkt')
    print("Загрузка 'punkt' завершена.")

API_KEY = "AIzaSyAy817y7DirgpWnMPS6t5ps-6Ui2pFAMys"
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('models/gemini-2.0-flash-lite')
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
rerank_model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

app = Flask(__name__)
SESSIONS = {}

# --- УЛУЧШЕНИЕ: Функции для продвинутого RAG ---

def contextual_chunker(text: str, chunk_target_size: int = 1000) -> list[str]:
    """
    Разделяет текст на предложения, а затем группирует их в чанки,
    стараясь не превышать целевой размер.
    """
    print("Выполнение умного разделения на чанки...")
    sentences = nltk.sent_tokenize(text, language="russian")
    
    chunks = []
    current_chunk = ""
    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= chunk_target_size:
            current_chunk += " " + sentence
        else:
            chunks.append(current_chunk.strip())
            current_chunk = sentence
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    print(f"Текст разделен на {len(chunks)} смысловых чанков.")
    return chunks

def generate_multiple_queries(query: str) -> list[str]:
    """
    Использует Gemini для генерации нескольких вариантов поискового запроса.
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
        response = model.generate_content(prompt)
        queries = [q.strip() for q in response.text.strip().split('\n') if q.strip()]
        print(f"Сгенерированные запросы: {queries}")
        return queries if queries else [query]
    except Exception as e:
        print(f"Ошибка при генерации запросов: {e}. Используется исходный запрос.")
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
    if 'character_json' not in request.form:
        return jsonify({"error": "Отсутствует обязательная часть 'character_json' в form-data."}), 400
    
    json_data_str = request.form['character_json']

    try:
        character_data = CharacterModel.model_validate_json(json_data_str)
    except ValidationError as e:
        return jsonify({"status": "error", "message": "JSON данные невалидны.", "errors": e.errors()}), 400

    session_id = str(uuid.uuid4())
    session_data = {"character_data": character_data}

    if 'context_file' in request.files:
        file = request.files['context_file']
        if file.filename != '':
            try:
                file_content = file.read().decode('utf-8')
                
                # 1. Умное разделение на чанки
                chunks = contextual_chunker(file_content)
                documents = [Document(page_content=chunk) for chunk in chunks]

                # 2. Создание гибридного ретривера
                bm25_retriever = BM25Retriever.from_documents(documents)
                bm25_retriever.k = 10

                vector_store = FAISS.from_documents(documents, embeddings)
                faiss_retriever = vector_store.as_retriever(search_kwargs={"k": 10})

                session_data["retriever"] = EnsembleRetriever(
                    retrievers=[bm25_retriever, faiss_retriever],
                    weights=[0.5, 0.5]
                )
                
            except Exception as e:
                return jsonify({"error": f"Ошибка при обработке файла и создании RAG: {e}"}), 500

    SESSIONS[session_id] = session_data
    print(f"Персонаж '{character_data.characterData.general.name}' настроен. Session ID: {session_id}")
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
        
        response = model.generate_content(full_prompt)
        character_response = response.text
        
        return jsonify({"status": "success", "response": character_response})

    except Exception as e:
        return jsonify({"error": f"Ошибка при обращении к Gemini: {e}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
