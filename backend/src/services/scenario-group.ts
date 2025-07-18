import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export const scenarioGroupService = {
  // Получение всех групп сценариев
  async getAllScenarioGroups() {
    return prisma.scenarioGroup.findMany({
      include: {
        scenarios: true
      }
    });
  },

  // Создание новой группы сценариев
  async createScenarioGroup(data: { title: string; description?: string }) {
    return prisma.scenarioGroup.create({
      data,
      include: {
        scenarios: true
      }
    });
  },

  // Получение группы сценариев по ID
  async getScenarioGroupById(id: string) {
    return prisma.scenarioGroup.findUnique({
      where: { id },
      include: {
        scenarios: true
      }
    });
  },

  // Обновление группы сценариев
  async updateScenarioGroup(id: string, data: { title?: string; description?: string }) {
    return prisma.scenarioGroup.update({
      where: { id },
      data,
      include: {
        scenarios: true
      }
    });
  },

  // Удаление группы сценариев
  async deleteScenarioGroup(id: string) {
    return prisma.scenarioGroup.delete({
      where: { id }
    });
  }
}; 