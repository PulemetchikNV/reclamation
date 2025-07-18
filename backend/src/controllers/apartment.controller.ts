import { Request, Response } from 'express';
import { apartmentService } from '../services/apartment';
import { aiService } from '../services/ai';
import { APPARTAMENT_GENERATION_PROMPT, APPARTAMENT_PHOTO_GENERATION_PROMPT, GET_APPARTAMENT_BY_URL_PROMPT } from 'src/__data__/const/prompts';
import { removeJsonBraces } from 'src/utils';
import { getRandomApartament } from 'src/__data__/const/apartaments';

export const apartmentController = {
  // Получение всех апартаментов
  async getAllApartments(_req: Request, res: Response) {
    try {
      const apartments = await apartmentService.getAllApartments();
      res.json(apartments);
    } catch (error) {
      console.error('Ошибка при получении апартаментов:', error);
      res.status(500).json({ error: 'Не удалось получить апартаменты' });
    }
  },

  // Создание новых апартаментов
  async createApartment(req: Request, res: Response) {
    try {
      const { title, description, photos } = req.body;
      const apartment = await apartmentService.createApartment({
        title,
        description,
        photos
      });
      res.status(201).json(apartment);
    } catch (error) {
      console.error('Ошибка при создании апартаментов:', error);
      res.status(500).json({ error: 'Не удалось создать апартаменты' });
    }
  },

  // Генерация апартаментов с использованием AI
  async generateApartment(req: Request, res: Response) {
    try {
      const { scenarioInfo, clientType, url } = req.body;
      const { sources, year } = getRandomApartament(clientType)
      let apartmentResponse = null;
      
      apartmentResponse = url ? await aiService.communicateWithGemini([
        { role: 'user', content: GET_APPARTAMENT_BY_URL_PROMPT(url) }
      ]) : await aiService.communicateWithGemini([
        { role: 'user', content: APPARTAMENT_GENERATION_PROMPT({scenarioInfo: scenarioInfo || '', year, type: clientType}) }
      ])
      // Генерация описания апартаментов

      const description = apartmentResponse.candidates[0].content.parts[0].text;
      
      // Генерация фотографии апартаментов
      const photoResponse = await aiService.getGeminiPhoto(
        APPARTAMENT_PHOTO_GENERATION_PROMPT(description)
      );

      // Получение URL изображения
      const photoUrl = photoResponse.imageUrl;
      
      // Создание апартаментов в базе данных
      const apartment = await apartmentService.createApartment({
        title: `Апартаменты ${new Date().toLocaleString('ru')}`,
        description,
        photos: [photoUrl],
        sources,
      });
      
      res.status(201).json(apartment);
    } catch (error) {
      console.error('Ошибка при генерации апартаментов:', error);
      res.status(500).json({ error: 'Не удалось сгенерировать апартаменты' });
    }
  },

  // Получение апартаментов по ID
  async getApartmentById(req: Request, res: Response) {
    try {
      const apartment = await apartmentService.getApartmentById(req.params.id);
      if (!apartment) {
        return res.status(404).json({ error: 'Апартаменты не найдены' });
      }
      res.json(apartment);
    } catch (error) {
      console.error('Ошибка при получении апартаментов:', error);
      res.status(500).json({ error: 'Не удалось получить апартаменты' });
    }
  },

  // Обновление апартаментов
  async updateApartment(req: Request, res: Response) {
    try {
      const { title, description, photos } = req.body;
      const apartment = await apartmentService.updateApartment(req.params.id, {
        title,
        description,
        photos
      });
      res.json(apartment);
    } catch (error) {
      console.error('Ошибка при обновлении апартаментов:', error);
      res.status(500).json({ error: 'Не удалось обновить апартаменты' });
    }
  },

  // Удаление апартаментов
  async deleteApartment(req: Request, res: Response) {
    try {
      await apartmentService.deleteApartment(req.params.id);
      res.status(204).end();
    } catch (error) {
      console.error('Ошибка при удалении апартаментов:', error);
      res.status(500).json({ error: 'Не удалось удалить апартаменты' });
    }
  }
}; 