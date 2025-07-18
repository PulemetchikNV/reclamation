import { Router } from 'express';
import authController from '../controllers/auth.controller';

const router = Router();

// Регистрация и авторизация
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshTokens);
router.post('/logout', authController.logout);

// Получение информации о текущем пользователе (защищенный маршрут)
router.get('/me', authController.getCurrentUser);

export default router; 