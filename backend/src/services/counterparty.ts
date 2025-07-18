import { PrismaClient, CounterpartyType, Difficulty } from '../generated/prisma';

const prisma = new PrismaClient();

export const counterpartyService = {
  // Получение всех контрагентов
  async getAllCounterparties() {
    return prisma.counterparty.findMany({
      include: {
        chats: true
      }
    });
  },

  // Создание нового контрагента
  async createCounterparty(data: {
    name: string;
    type: CounterpartyType;
    character: string;
    goal: string;
    description: string;
    photos: string[];
    difficulty?: Difficulty;
  }) {
    return prisma.counterparty.create({
      data,
      include: {
        chats: true
      }
    });
  },

  // Получение контрагента по ID
  async getCounterpartyById(id: string) {
    return prisma.counterparty.findUnique({
      where: { id },
      include: {
        chats: true
      }
    });
  },

  // Обновление контрагента
  async updateCounterparty(id: string, data: {
    name?: string;
    type?: CounterpartyType;
    character?: string;
    goal?: string;
    description?: string;
    photos?: string[];
    difficulty?: Difficulty;
  }) {
    return prisma.counterparty.update({
      where: { id },
      data,
      include: {
        chats: true
      }
    });
  },

  // Удаление контрагента
  async deleteCounterparty(id: string) {
    return prisma.counterparty.delete({
      where: { id }
    });
  }
}; 