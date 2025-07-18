import { Request, Response } from 'express';
import authService, { UserRegisterDTO, UserLoginDTO } from '../services/auth';

/**
 * Контроллер для обработки запросов аутентификации и авторизации
 */
export class AuthController {
  /**
   * Регистрация нового пользователя
   */
  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Проверяем, что необходимые поля присутствуют
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email и пароль обязательны'
        });
      }

      // Проверяем формат email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Неверный формат email'
        });
      }

      // Проверяем длину пароля
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Пароль должен содержать не менее 6 символов'
        });
      }

      const registerData: UserRegisterDTO = {
        email,
        password,
        firstName,
        lastName
      };

      // Регистрируем пользователя
      const user = await authService.register(registerData);
      const { tokens } = await authService.login({email, password});

      return res.status(201).json({
        user, 
        accessToken: tokens.accessToken
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка при регистрации пользователя';
      return res.status(400).json({
        success: false,
        message
      });
    }
  }

  /**
   * Авторизация пользователя
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Проверяем, что необходимые поля присутствуют
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email и пароль обязательны'
        });
      }

      const loginData: UserLoginDTO = {
        email,
        password
      };

      // Авторизуем пользователя
      const { user, tokens } = await authService.login(loginData);

      // Устанавливаем refresh токен в httpOnly cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return res.status(200).json({
        user,
        accessToken: tokens.accessToken
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка при авторизации пользователя';
      return res.status(400).json({
        success: false,
        message
      });
    }
  }

  /**
   * Обновление токенов
   */
  async refreshTokens(req: Request, res: Response) {
    try {
      // Получаем refresh токен из cookie
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh токен отсутствует'
        });
      }

      // Обновляем токены
      const tokens = await authService.refreshTokens(refreshToken);

      // Устанавливаем новый refresh токен в cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return res.status(200).json({
        accessToken: tokens.accessToken
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка при обновлении токенов';
      return res.status(401).json({
        success: false,
        message
      });
    }
  }

  /**
   * Выход пользователя
   */
  async logout(req: Request, res: Response) {
    try {
      // Получаем refresh токен из cookie
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        // Удаляем refresh токен из базы данных
        await authService.logout(refreshToken);
      }

      // Удаляем cookie с refresh токеном
      res.clearCookie('refreshToken');

      return res.status(200).json({
        success: true,
        message: 'Выход выполнен успешно'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка при выходе из системы';
      return res.status(500).json({
        success: false,
        message
      });
    }
  }

  /**
   * Получение информации о текущем пользователе
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      const accessToken = req.headers.authorization?.split(' ')[1];
      console.log("ACCESS TOKEN", accessToken)
      if (!accessToken) {
        return res.status(401).json({
          success: false,
          message: 'Пользователь не авторизован'
        });
      }

      const user = await authService.getUserByAccessToken(accessToken);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      return res.status(200).json(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка при получении данных пользователя';
      return res.status(500).json({
        success: false,
        message
      });
    }
  }
}

export default new AuthController(); 