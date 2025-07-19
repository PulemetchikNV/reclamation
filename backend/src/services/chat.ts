import { CHAT_END_INDICATOR } from 'src/__data__/const/chat';
import { Message, PrismaClient } from '../generated/prisma/index.js';
import { chatAnalysisService } from './chat-analysis';

const prisma = new PrismaClient();

export const chatService = {
  async getAllChats() {
    return prisma.chat.findMany({
      include: {
        messages: {
          where: {
            hidden: false
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        scenario: {
          include: {
            group: true
          }
        },
        counterparty: true,
        apartment: true,
        analysis: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        }
      }
    });
  },

  async getUserChats(userId: string) {
    return prisma.chat.findMany({
      where: {
        userId
      },
      include: {
        messages: {
          where: {
            hidden: false
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        scenario: {
          include: {
            group: true
          }
        },
        counterparty: true,
        apartment: true,
        analysis: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async createChat(data: {
    title?: string;
    scenarioId?: string;
    counterpartyId: string;
    apartmentId?: string;
    userId: string;
    ragSessionId: string;
  }) {
    return prisma.chat.create({
      data: {
        title: data.title || 'Новый чат',
        scenarioId: data.scenarioId,
        counterpartyId: data.counterpartyId,
        apartmentId: data.apartmentId,
        userId: data.userId,
        ragSessionId: data.ragSessionId
      },
      include: {
        messages: {
          where: {
            hidden: false
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        scenario: {
          include: {
            group: true
          }
        },
        counterparty: true,
        apartment: true,
        analysis: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  },

  async getChatById(id: string) {
    return prisma.chat.findUnique({
      where: { id },
      include: {
        messages: {
          where: {
            hidden: false
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        scenario: {
          include: {
            group: true
          }
        },
        counterparty: true,
        apartment: true,
        analysis: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        }
      }
    });
  },

  async updateChatTitle(id: string, title: string) {
    return prisma.chat.update({
      where: { id },
      data: { title },
      include: {
        messages: {
          where: {
            hidden: false
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        scenario: {
          include: {
            group: true
          }
        },
        counterparty: true,
        apartment: true,
        analysis: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  },

  async deleteChat(id: string) {
    return prisma.chat.delete({
      where: { id }
    });
  },

  async addMessage(chatId: string, content: string, role: 'user' | 'model', hidden: boolean = false) {
    const msg = await prisma.message.create({
      data: {
        content,
        role,
        chatId,
        hidden
      }
    });

    if (content.includes(CHAT_END_INDICATOR) && role !== 'user') {
      await this.finishChat(chatId);
    }
 
    return msg;
  },

  async getChatMessages(chatId: string, includeHidden: boolean = false) {
    return prisma.message.findMany({
      where: { 
        chatId,
        // hidden: includeHidden
      },
      orderBy: { createdAt: 'asc' }
    });
  },

  async finishChat(chatId: string) {
    console.log("FINISH CHAT", chatId)
    await prisma.chat.update({
      where: { id: chatId },
      data: { isFinished: true }
    });

    await chatAnalysisService.analyzeChatById(chatId)

    const updatedChat = await this.getChatById(chatId)

    return updatedChat
  },

  async isUserChatOwner(chatId: string, userId: string): Promise<boolean> {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { userId: true }
    });

    return chat?.userId === userId;
  },
}; 