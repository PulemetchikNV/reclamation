import { PrismaClient } from '../generated/prisma/index.js';
import type { Prisma } from '../generated/prisma/index.js';

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
    character?: string;
    goal?: string;
    description?: string;
    photos: string[];
    characterData?: any;
    contextFilePath?: string;
  }) {
    return prisma.counterparty.create({
      data: {
        ...data,
        characterData: data.characterData || Prisma.JsonNull,
      },
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
  async updateCounterparty(
    id: string,
    data: {
    name?: string;
    character?: string;
    goal?: string;
    description?: string;
    photos?: string[];
      characterData?: any;
      contextFilePath?: string;
    }
  ) {
    return prisma.counterparty.update({
      where: { id },
      data: {
        ...data,
        characterData: data.characterData || undefined,
      },
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