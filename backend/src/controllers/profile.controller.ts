import { Request, Response } from 'express';
import { profileService } from '../services/profile';
import authService from '../services/auth';

/**
 * Контроллер для обработки запросов профиля пользователя
 */
export class ProfileController {
  /**
   * Получение медианных характеристик пользователя за последние 5 чатов
   */
  async getUserCharacteristics(req: Request, res: Response) {
    try {
      const accessToken = req.headers.authorization?.split(' ')[1];
      
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

      const characteristics = await profileService.getUserMedianCharacteristics(user.id);

      return res.status(200).json(characteristics);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка при получении характеристик пользователя';
      return res.status(500).json({
        success: false,
        message
      });
    }
  }

  /**
   * Получение истории изменения характеристик пользователя
   */
  async getUserCharacteristicsHistory(req: Request, res: Response) {
    try {
      const accessToken = req.headers.authorization?.split(' ')[1];
      
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

      const characteristicsHistory = await profileService.getUserCharacteristicsHistory(user.id);

      return res.status(200).json(characteristicsHistory);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка при получении истории характеристик пользователя';
      return res.status(500).json({
        success: false,
        message
      });
    }
  }

  /**
   * Анализ динамики изменения характеристики
   */
  async analyzeCharacteristicDynamic(req: Request, res: Response) {
    try {
      const accessToken = req.headers.authorization?.split(' ')[1];
      const user = await authService.getUserByAccessToken(accessToken!);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        }); 
      }

      const { characteristicName, characteristicRus, characteristicHistory } = req.body;

      const characteristicDynamicText = await profileService.analyzeCharacteristicDynamic(characteristicName, characteristicRus, characteristicHistory);

      return res.status(200).json(characteristicDynamicText);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка при анализе динамики характеристик пользователя';
      return res.status(500).json({
        success: false,
        message
      });
    }
  }
}

export const profileController = new ProfileController(); 