#!/usr/bin/env bash
set -e

# Переходим в директорию, где находится скрипт
cd "$(dirname "$0")"

# Создаем venv, если его нет
if [ ! -d "venv" ]; then
    echo "Создание виртуального окружения venv..."
    python3 -m venv venv
fi

# Активируем venv, обновляем pip и устанавливаем зависимости
source venv/bin/activate
echo "Обновление pip и установка зависимостей из requirements.txt..."
pip install --upgrade pip
pip install -r requirements.txt

# Запускаем сервер с небуферизованным выводом
echo "Запуск ML сервера на http://localhost:5000..."
python3 -u rag_server.py
