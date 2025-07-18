import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import authService from '../services/auth';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// Расширяем тип Request, чтобы включить информацию о пользователе
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

// JWT секрет для проверки токенов
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

/**
 * Middleware для защиты маршрутов, требующих авторизации
 */
export const authGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Получаем заголовок Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'Отсутствует токен авторизации' 
      });
    }

    // Проверяем формат заголовка
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        success: false, 
        message: 'Неверный формат токена авторизации' 
      });
    }

    const token = parts[1];

    // Проверяем токен
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    
    // Прикрепляем информацию о пользователе к запросу
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };
    
    // Передаем управление следующему middleware
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Срок действия токена истек' 
      });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Недействительный токен' 
      });
    }
    
    // Другие ошибки
    return res.status(500).json({ 
      success: false, 
      message: 'Ошибка при проверке авторизации' 
    });
  }
};

/**
 * Middleware для проверки, является ли пользователь владельцем ресурса
 */
export const ownerGuard = (resourceType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Проверяем, что пользователь аутентифицирован
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Пользователь не авторизован' 
        });
      }

      const userId = req.user.userId;
      const resourceId = req.params.id;

      if (!resourceId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Не указан ID ресурса' 
        });
      }

      // В зависимости от типа ресурса проверяем права доступа
      let isOwner = false;

      switch (resourceType) {
        case 'chat':
          // Проверяем, владеет ли пользователь чатом
          const chat = await prisma.chat.findUnique({
            where: { id: resourceId },
            select: { userId: true }
          });
          isOwner = chat?.userId === userId;
          break;
        
        // Можно добавить и другие типы ресурсов при необходимости
        default:
          return res.status(400).json({ 
            success: false, 
            message: 'Неизвестный тип ресурса' 
          });
      }

      if (!isOwner) {
        return res.status(403).json({ 
          success: false, 
          message: 'Доступ запрещен. Вы не являетесь владельцем этого ресурса' 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Ошибка при проверке прав доступа' 
      });
    }
  };
};

export default {
  authGuard,
  ownerGuard
}; 