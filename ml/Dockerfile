FROM python:3.11-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файл с зависимостями
COPY requirements.txt ./

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем все остальные файлы проекта
COPY . .

# Открываем порт, на котором будет работать сервер
EXPOSE 5001

# Команда для запуска сервера
CMD ["python3", "-u", "rag_server.py"] 