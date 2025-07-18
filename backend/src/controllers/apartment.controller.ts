import { Request, Response } from 'express';
import { apartmentService } from '../services/apartment';
import { aiService } from '../services/ai';
import { APPARTAMENT_GENERATION_PROMPT } from 'src/__data__/const/prompts';

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
      const { title, description } = req.body;
      const apartment = await apartmentService.createApartment({
        title,
        description,
      });
      res.status(201).json(apartment);
    } catch (error) {
      console.error('Ошибка при создании апартаментов:', error);
      res.status(500).json({ error: 'Не удалось создать апартаменты' });
    }
  },

  // Генерация апартаментов с использованием AI
  async generateScenarioContext(req: Request, res: Response) {
    try {
      const { scenarioInfo } = req.body;

      let apartmentResponse = null;
      
      apartmentResponse = await aiService.communicateWithGemini([
        { role: 'user', content: APPARTAMENT_GENERATION_PROMPT({scenarioContextPrompt: scenarioInfo?.scenarioMeta?.prompt || ''}) }
      ])
      const description = apartmentResponse.candidates[0].content.parts[0].text;

      const apartment = await apartmentService.createApartment({
        title: `${scenarioInfo?.scenarioMeta?.name || 'Контекст'} ${new Date().toLocaleString('ru')}`,
        description,
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
      const { title, description } = req.body;
      const apartment = await apartmentService.updateApartment(req.params.id, {
        title,
        description,
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