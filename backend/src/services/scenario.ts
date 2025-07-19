import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export const scenarioService = {
  // Получение всех сценариев
  async getAllScenarios() {
    return prisma.scenario.findMany({
      include: {
        group: true,
        counterparties: true,
      }
    });
  },

  // Создание нового сценария
  async createScenario(data: {
    title: string;
    imageUrl?: string;
    aiPrompt: string;
    scenarioMeta?: any;
    groupId: string;
  }) {
    return prisma.scenario.create({
      data,
      include: {
        group: true,
        chats: true
      }
    });
  },

  // Получение сценария по ID
  async getScenarioById(id: string) {
    return prisma.scenario.findUnique({
      where: { id },
      include: {
        group: true,
        chats: true
      }
    });
  },

  // Обновление сценария
  async updateScenario(id: string, data: {
    title?: string;
    imageUrl?: string;
    aiPrompt?: string;
    scenarioMeta?: any;
    groupId?: string;
  }) {
    return prisma.scenario.update({
      where: { id },
      data,
      include: {
        group: true,
        chats: true
      }
    });
  },

  // Удаление сценария
  async deleteScenario(id: string) {
    return prisma.scenario.delete({
      where: { id }
    });
  }
}; 