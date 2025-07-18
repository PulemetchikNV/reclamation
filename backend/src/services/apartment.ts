import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export const apartmentService = {
  // Получение всех апартаментов
  async getAllApartments() {
    return prisma.apartment.findMany({
      include: {
        chats: true
      }
    });
  },

  // Создание новых апартаментов
  async createApartment(data: {
    title: string;
    description: string;
  }) {
    return prisma.apartment.create({
      data,
      include: {
        chats: true
      }
    });
  },

  // Получение апартаментов по ID
  async getApartmentById(id: string) {
    return prisma.apartment.findUnique({
      where: { id },
      include: {
        chats: true
      }
    });
  },

  // Обновление апартаментов
  async updateApartment(id: string, data: {
    title?: string;
    description?: string;
  }) {
    return prisma.apartment.update({
      where: { id },
      data,
      include: {
        chats: true
      }
    });
  },

  // Удаление апартаментов
  async deleteApartment(id: string) {
    return prisma.apartment.delete({
      where: { id }
    });
  }
}; 