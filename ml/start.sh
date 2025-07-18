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

# Копируем .env.example в .env, если .env не существует
if [ ! -f ".env" ]; then
    echo "Файл .env не найден. Копирую .env.example в .env..."
    cp .env.example .env
fi

# Запускаем сервер с небуферизованным выводом
echo "Запуск ML сервера..."
python3 -u rag_server.py
