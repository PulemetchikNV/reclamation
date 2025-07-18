#!/bin/sh
set -e

# Ждем доступности PostgreSQL
echo "Ожидание доступности PostgreSQL..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "PostgreSQL доступен!"

# Генерация Prisma клиента
echo "Генерация Prisma клиента..."
npx prisma generate

# Применение миграций
echo "Применение миграций Prisma..."
npx prisma migrate deploy

# Запуск приложения
echo "Запуск приложения..."
exec "$@" 