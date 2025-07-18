import { Request, Response } from 'express';
import { scenarioGroupService } from '../services/scenario-group';

export const scenarioGroupController = {
  // Получение всех групп сценариев
  async getAllScenarioGroups(_req: Request, res: Response) {
    try {
      const groups = await scenarioGroupService.getAllScenarioGroups();
      res.json(groups);
    } catch (error) {
      console.error('Ошибка при получении групп сценариев:', error);
      res.status(500).json({ error: 'Не удалось получить группы сценариев' });
    }
  },

  // Создание новой группы сценариев
  async createScenarioGroup(req: Request, res: Response) {
    try {
      const { title, description } = req.body;
      const group = await scenarioGroupService.createScenarioGroup({ title, description });
      res.status(201).json(group);
    } catch (error) {
      console.error('Ошибка при создании группы сценариев:', error);
      res.status(500).json({ error: 'Не удалось создать группу сценариев' });
    }
  },

  // Получение группы сценариев по ID
  async getScenarioGroupById(req: Request, res: Response) {
    try {
      const group = await scenarioGroupService.getScenarioGroupById(req.params.id);
      if (!group) {
        return res.status(404).json({ error: 'Группа сценариев не найдена' });
      }
      res.json(group);
    } catch (error) {
      console.error('Ошибка при получении группы сценариев:', error);
      res.status(500).json({ error: 'Не удалось получить группу сценариев' });
    }
  },

  // Обновление группы сценариев
  async updateScenarioGroup(req: Request, res: Response) {
    try {
      const { title, description } = req.body;
      const group = await scenarioGroupService.updateScenarioGroup(req.params.id, { title, description });
      res.json(group);
    } catch (error) {
      console.error('Ошибка при обновлении группы сценариев:', error);
      res.status(500).json({ error: 'Не удалось обновить группу сценариев' });
    }
  },

  // Удаление группы сценариев
  async deleteScenarioGroup(req: Request, res: Response) {
    try {
      await scenarioGroupService.deleteScenarioGroup(req.params.id);
      res.status(204).end();
    } catch (error) {
      console.error('Ошибка при удалении группы сценариев:', error);
      res.status(500).json({ error: 'Не удалось удалить группу сценариев' });
    }
  }
}; 