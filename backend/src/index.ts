import 'dotenv/config';
import app from './app';
import { seedService } from './services/seed';
import cors from 'cors';
const PORT = process.env.PORT || 3000;

// Запуск сервера
const startServer = async () => {
  try {
    // Загрузка начальных данных, если они отсутствуют
    await seedService.loadInitialData();
    
    // Запуск сервера
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
      console.log(`Документация API: http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    console.error('Ошибка при запуске сервера:', error);
    process.exit(1);
  }
};

// Обработка неперехваченных исключений
process.on('uncaughtException', (error) => {
  console.error('Неперехваченное исключение:', error);
  process.exit(1);
});

// Запуск сервера
startServer();