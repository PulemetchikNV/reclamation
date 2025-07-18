import { Request, Response } from 'express';
import { counterpartyService } from '../services/counterparty';
import { aiService } from '../services/ai';
import { GEN_COUNTERPARTY_PHOTO_PROMPT_BUYER, GEN_COUNTERPARTY_PHOTO_PROMPT_SELLER, GEN_COUNTERPARTY_PROMPT } from 'src/__data__/const/prompts';
import { removeJsonBraces } from 'src/utils';
import { getRandomCounterparty } from 'src/__data__/const/counterparties';
export const counterpartyController = {
  // Получение всех контрагентов
  async getAllCounterparties(_req: Request, res: Response) {
    try {
      const counterparties = await counterpartyService.getAllCounterparties();
      res.json(counterparties);
    } catch (error) {
      console.error('Ошибка при получении контрагентов:', error);
      res.status(500).json({ error: 'Не удалось получить контрагентов' });
    }
  },

  // Создание нового контрагента
  async createCounterparty(req: Request, res: Response) {
    try {
      const { name, type, character, goal, description, photos, difficulty } = req.body;
      const counterparty = await counterpartyService.createCounterparty({
        name,
        type,
        character,
        goal,
        description,
        photos,
        difficulty
      });
      res.status(201).json(counterparty);
    } catch (error) {
      console.error('Ошибка при создании контрагента:', error);
      res.status(500).json({ error: 'Не удалось создать контрагента' });
    }
  },

  async generateCounterparty(req: Request, res: Response) {
    try {
      const { type } = req.body || 'buyer';
      const { name, lastName, gender, goal, age, role, characterShort } = getRandomCounterparty(type)
      const counterpartyJSON = await aiService.communicateWithGemini([
        { role: 'user', content: `
          ${GEN_COUNTERPARTY_PROMPT({ name, type, gender, role, age, characterShort })}
        `}
      ]);
      const photoResponse = await aiService.getGeminiPhoto(
        GEN_COUNTERPARTY_PHOTO_PROMPT_BUYER(gender, counterpartyJSON.candidates[0].content.parts[0].text)
      );

      const rawJson = counterpartyJSON.candidates[0].content.parts[0].text
      const parsedJson = removeJsonBraces(rawJson)

      const counterpartyData = JSON.parse(parsedJson);
      
      // Используем URL изображения вместо base64
      const photoUrl = photoResponse.imageUrl;
      const counterparty = await counterpartyService.createCounterparty({
        ...counterpartyData,
        photos: [photoUrl],
        name: `${name} ${lastName}`,
        type,
        goal,
      });
      res.status(201).json(counterparty);
    } catch (error) {
      console.error('Ошибка при генерации контрагента:', error);
      res.status(500).json({ error: 'Не удалось сгенерировать контрагента' });
    }
  },

  // Получение контрагента по ID
  async getCounterpartyById(req: Request, res: Response) {
    try {
      const counterparty = await counterpartyService.getCounterpartyById(req.params.id);
      if (!counterparty) {
        return res.status(404).json({ error: 'Контрагент не найден' });
      }
      res.json(counterparty);
    } catch (error) {
      console.error('Ошибка при получении контрагента:', error);
      res.status(500).json({ error: 'Не удалось получить контрагента' });
    }
  },

  // Обновление контрагента
  async updateCounterparty(req: Request, res: Response) {
    try {
      const { name, type, character, goal, description, photos, difficulty } = req.body;
      const counterparty = await counterpartyService.updateCounterparty(req.params.id, {
        name,
        type,
        character,
        goal,
        description,
        photos,
        difficulty
      });
      res.json(counterparty);
    } catch (error) {
      console.error('Ошибка при обновлении контрагента:', error);
      res.status(500).json({ error: 'Не удалось обновить контрагента' });
    }
  },

  // Удаление контрагента
  async deleteCounterparty(req: Request, res: Response) {
    try {
      await counterpartyService.deleteCounterparty(req.params.id);
      res.status(204).end();
    } catch (error) {
      console.error('Ошибка при удалении контрагента:', error);
      res.status(500).json({ error: 'Не удалось удалить контрагента' });
    }
  }
}; 