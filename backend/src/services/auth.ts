import { PrismaClient, User } from '../generated/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Настройки JWT
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const ACCESS_TOKEN_EXPIRY = '1d'; // 1 день
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 дней
const SALT_ROUNDS = 10;

// Интерфейсы для аутентификации
export interface UserRegisterDTO {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface UserLoginDTO {
  email: string;
  password: string;
}

export interface UserDTO {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Сервис для работы с авторизацией пользователей
 */
export class AuthService {
  /**
   * Регистрация нового пользователя
   */
  async register(data: UserRegisterDTO): Promise<UserDTO> {
    // Проверяем, существует ли пользователь с таким email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
      }
    });

    return this.mapUserToDTO(user);
  }

  /**
   * Авторизация пользователя
   */
  async login(data: UserLoginDTO): Promise<{ user: UserDTO; tokens: TokenPair }> {
    // Ищем пользователя по email
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('Неверный email или пароль');
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new Error('Неверный email или пароль');
    }

    // Генерируем токены
    const tokens = await this.generateTokens(user);

    return {
      user: this.mapUserToDTO(user),
      tokens
    };
  }

  /**
   * Обновление токенов с помощью refresh токена
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    // Проверяем, существует ли такой токен в базе
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!tokenRecord) {
      throw new Error('Недействительный refresh токен');
    }

    // Проверяем, не истек ли срок действия токена
    if (new Date() > tokenRecord.expiresAt) {
      // Удаляем истекший токен
      await prisma.refreshToken.delete({
        where: { id: tokenRecord.id }
      });
      throw new Error('Срок действия refresh токена истек');
    }

    // Удаляем старый refresh токен
    await prisma.refreshToken.delete({
      where: { id: tokenRecord.id }
    });

    // Генерируем новые токены
    return this.generateTokens(tokenRecord.user);
  }

  /**
   * Выход пользователя (удаление refresh токена)
   */
  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    });
  }

  /**
   * Получение информации о пользователе по ID
   */
  async getUserById(userId: string): Promise<UserDTO | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return null;
    }

    return this.mapUserToDTO(user);
  }

  /**
   * Генерация пары токенов access и refresh
   */
  private async generateTokens(user: User): Promise<TokenPair> {
    // Генерируем access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    // Генерируем refresh token
    const refreshToken = uuidv4();
    
    // Сохраняем refresh token в базу
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней
    
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    return {
      accessToken,
      refreshToken
    };
  }

  /**
   * Преобразование модели пользователя в DTO
   */
  private mapUserToDTO(user: User): UserDTO {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl
    };
  }

  public async getUserByAccessToken(accessToken: string): Promise<UserDTO | null> {
    console.log("ACCESS TOKEN", accessToken)
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    const user = await this.getUserById(typeof decoded === 'string' ? decoded : decoded.userId);
    return user;
  }
}

export default new AuthService(); 