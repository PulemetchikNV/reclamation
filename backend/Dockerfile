FROM node:20-alpine

WORKDIR /app

# Установка зависимостей
COPY package*.json ./
RUN npm ci -d

# Копирование исходного кода
COPY . .

# Установка netcat для проверки доступности PostgreSQL
RUN apk add --no-cache netcat-openbsd

# Сборка проекта
RUN npm run build

# Настройка entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]

EXPOSE 3000

CMD ["npm", "start"] 