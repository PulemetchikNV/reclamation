import { Request, Response } from 'express';
import { scenarioService } from '../services/scenario';

export const scenarioController = {
  // Получение всех сценариев
  async getAllScenarios(_req: Request, res: Response) {
    try {
      const scenarios = await scenarioService.getAllScenarios();
      res.json(scenarios);
    } catch (error) {
      console.error('Ошибка при получении сценариев:', error);
      res.status(500).json({ error: 'Не удалось получить сценарии' });
    }
  },

  // Создание нового сценария
  async createScenario(req: Request, res: Response) {
    try {
      const { title, imageUrl, aiPrompt, groupId } = req.body;
      const scenario = await scenarioService.createScenario({
        title,
        imageUrl,
        aiPrompt,
        groupId
      });
      res.status(201).json(scenario);
    } catch (error) {
      console.error('Ошибка при создании сценария:', error);
      res.status(500).json({ error: 'Не удалось создать сценарий' });
    }
  },

  // Получение сценария по ID
  async getScenarioById(req: Request, res: Response) {
    try {
      const scenario = await scenarioService.getScenarioById(req.params.id);
      if (!scenario) {
        return res.status(404).json({ error: 'Сценарий не найден' });
      }
      res.json(scenario);
    } catch (error) {
      console.error('Ошибка при получении сценария:', error);
      res.status(500).json({ error: 'Не удалось получить сценарий' });
    }
  },

  // Обновление сценария
  async updateScenario(req: Request, res: Response) {
    try {
      const { title, imageUrl, aiPrompt, groupId } = req.body;
      const scenario = await scenarioService.updateScenario(req.params.id, {
        title,
        imageUrl,
        aiPrompt,
        groupId
      });
      res.json(scenario);
    } catch (error) {
      console.error('Ошибка при обновлении сценария:', error);
      res.status(500).json({ error: 'Не удалось обновить сценарий' });
    }
  },

  // Удаление сценария
  async deleteScenario(req: Request, res: Response) {
    try {
      await scenarioService.deleteScenario(req.params.id);
      res.status(204).end();
    } catch (error) {
      console.error('Ошибка при удалении сценария:', error);
      res.status(500).json({ error: 'Не удалось удалить сценарий' });
    }
  }
}; 