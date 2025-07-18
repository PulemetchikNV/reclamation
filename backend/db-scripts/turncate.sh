#!/bin/bash

# Скрипт для выполнения TRUNCATE CASCADE для таблицы scenario_groups в Docker-контейнере

# Получаем имя контейнера PostgreSQL из переменной окружения или используем значение по умолчанию
POSTGRES_CONTAINER=${PROJECT_NAME:-the-one-market}-postgres

# Проверяем, что контейнер запущен
if ! docker ps | grep -q "$POSTGRES_CONTAINER"; then
  echo "Ошибка: Контейнер PostgreSQL '$POSTGRES_CONTAINER' не запущен"
  echo "Убедитесь, что Docker контейнер запущен"
  exit 1
fi

echo "Выполняется TRUNCATE CASCADE для таблицы scenario_groups..."

# Выполняем TRUNCATE CASCADE внутри контейнера
docker exec -i $POSTGRES_CONTAINER psql -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-chatdb} -c "TRUNCATE TABLE scenario_groups CASCADE;"

if [ $? -eq 0 ]; then
  echo "TRUNCATE CASCADE успешно выполнен для таблицы scenario_groups"
else
  echo "Ошибка при выполнении TRUNCATE CASCADE"
  exit 2
fi
