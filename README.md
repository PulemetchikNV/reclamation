# Проект команды "The One Market"

## Запуск с помощью Docker

### Предварительные требования

- Docker
- Docker Compose

### Переменные окружения

Все переменные окружения находятся в файле `.env` в корне проекта:

```bash
# Общие переменные
PROJECT_NAME=reclamaton

# Порты
BACKEND_PORT=3000      # Порт для бэкенда
FRONTEND_PORT=8080     # Порт для фронтенда

# Настройки бэкенда
BACKEND_HOST=0.0.0.0
NODE_ENV=development

# Настройки фронтенда
VITE_API_URL=http://localhost:3000
```

### Запуск приложения

Для запуска всего приложения используйте команду:

```bash
docker-compose up -d
```

Для пересборки контейнеров:

```bash
docker-compose up -d --build
```

### Остановка приложения

```bash
docker-compose down
```

## Разработка без Docker

### Бэкенд

```bash
cd reclamaton-backend
npm install
npm run dev
```

### Фронтенд

```bash
cd reclamaton-front
npm install
npm run dev
```

## Разработка с использованием Docker

Для запуска приложения в режиме разработки с автоматическим обновлением при изменении файлов:

```bash
# Сделать скрипт исполняемым
chmod +x dev.sh

# Запустить режим разработки
./dev.sh
```

Или вручную:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

В режиме разработки:
- Бэкенд будет доступен по адресу: http://localhost:3000
- Фронтенд будет доступен по адресу: http://localhost:8080
- При изменении файлов приложения будут автоматически перезагружаться

## Проверка работоспособности

- Бэкенд: http://localhost:3000/healthcheck
- Фронтенд: http://localhost:8080