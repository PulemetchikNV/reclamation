#!/bin/bash

# Остановить все запущенные контейнеры если они есть
docker compose -f docker-compose.dev.yml down

# Запустить контейнеры в режиме разработки
docker compose -f docker-compose.dev.yml up --build 