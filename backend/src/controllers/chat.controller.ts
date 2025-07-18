import { Request, Response } from 'express';
import { chatService } from '../services/chat';
import { aiService } from '../services/ai';
import 'dotenv/config';
import { INITIAL_DIALOG_PROMPT } from 'src/__data__/const/prompts';
import { counterpartyService } from 'src/services/counterparty';
import { scenarioService } from 'src/services/scenario';
import { apartmentService } from 'src/services/apartment';
import authService from '../services/auth';
import { HINT_PROMPT } from 'src/__data__/const/prompts.js';
import { getFormattedMessages, getGeminiText } from 'src/utils.js';

// Интерфейс для определения структуры сообщения
interface MessageWithRole {
  role: 'user' | 'model';
  content: string;
}

export const chatController = {
  // Получение всех чатов
  async getAllChats(req: Request, res: Response) {
    try {
      const accessToken = req.headers.authorization?.split(' ')[1];
      const currentUser = await authService.getUserByAccessToken(accessToken!);

      if (!currentUser) {
        return res.status(401).json({ error: 'Пользователь не авторизован' });
      }

      const chats = await chatService.getUserChats(currentUser.id);
      const transformedChats = chats.map((el: any) => ({
        id: el.id,
        title: el.title,
        createdAt: el.createdAt,
        scenario: el.scenario,
        counterparty: el.counterparty,
        apartment: el.apartment
      }));
      res.json(transformedChats);
    } catch (error) {
      console.error('Ошибка при получении чатов:', error);
      res.status(500).json({ error: 'Не удалось получить чаты' });
    }
  },

  // Получение чатов текущего пользователя
  async getUserChats(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Пользователь не авторизован' });
      }

      const userId = req.user.userId;
      const chats = await chatService.getUserChats(userId);

      const transformedChats = chats.map((el) => ({
        id: el.id,
        title: el.title,
        createdAt: el.createdAt,
        scenario: el.scenario,
        counterparty: el.counterparty,
        isFinished: el.isFinished,
        analysis: el.analysis
      }));

      res.json(transformedChats);
    } catch (error) {
      console.error('Ошибка при получении чатов пользователя:', error);
      res.status(500).json({ error: 'Не удалось получить чаты пользователя' });
    }
  },

  // Создание нового чата
  async createChat(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Пользователь не авторизован' });
      }

      let { title, scenarioId, counterpartyId, apartmentId } = req.body;
      const userId = req.user.userId;
      const fullUser = await authService.getUserById(userId);

      if (!counterpartyId) {
        return res.status(400).json({ error: 'Необходимо указать контрагента' });
      }

      const counterparty = await counterpartyService.getCounterpartyById(counterpartyId);
      const scenario = await scenarioService.getScenarioById(scenarioId);
      const apartment = await apartmentService.getApartmentById(apartmentId);

      if (!scenario) {
        return res.status(400).json({ error: 'Необходимо указать сценарий' });
      }
      if (!counterparty) {
        return res.status(400).json({ error: 'Необходимо указать контрагента' });
      }
      if (!title) {
        title = `${scenario.title} с ${counterparty.name}`;
      }

      const chat = await chatService.createChat({
        title,
        scenarioId,
        counterpartyId,
        apartmentId,
        userId
      });

      const initialMessage = await chatService.addMessage(
        chat.id,
        INITIAL_DIALOG_PROMPT({
          character: counterparty!.character,
          name: counterparty!.name,
          scenario: `${scenario?.aiPrompt} ${scenario?.difficultyMeta?.[counterparty.difficulty] ?? ''}`,
          difficulty: counterparty.difficulty,
          goal: counterparty.goal,
          characterType: counterparty.type,
          apartmentSources: apartment?.sources || '',
          apartmentDescription: apartment?.description || '',
          userName: (fullUser?.firstName ? (fullUser?.firstName + ' ' + fullUser?.lastName) : '') || ''
        }),
        'user',
        true
      );


      if (process.env.ENABLE_AI_RESPONSE === 'true') {
        // Получаем ответ от AI
        const aiResponse = await aiService.communicateWithGemini([
          initialMessage
        ]);

        // Извлекаем текст ответа
        const modelResponse = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || 'Извините, не удалось получить ответ';

        // Сохраняем ответ модели
        await chatService.addMessage(chat.id, modelResponse, 'model');
      } else {
        await chatService.addMessage(chat.id, 'Алло.', 'model');
      }

      const updatedChat = await chatService.getChatById(chat.id);

      res.status(201).json(updatedChat);
    } catch (error) {
      console.error('Ошибка при создании чата:', error);
      res.status(500).json({ error: 'Не удалось создать чат' });
    }
  },

  // Получение чата по ID
  async getChatById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Пользователь не авторизован' });
      }

      const chatId = req.params.id;
      const userId = req.user.userId;

      // Проверяем, принадлежит ли чат пользователю
      const isOwner = await chatService.isUserChatOwner(chatId, userId);
      if (!isOwner) {
        return res.status(403).json({ error: 'Доступ запрещен. Вы не являетесь владельцем этого чата' });
      }

      const chat = await chatService.getChatById(chatId);
      if (!chat) {
        return res.status(404).json({ error: 'Чат не найден' });
      }

      res.json(chat);
    } catch (error) {
      console.error('Ошибка при получении чата:', error);
      res.status(500).json({ error: 'Не удалось получить чат' });
    }
  },

  // Обновление заголовка чата
  async updateChatTitle(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Пользователь не авторизован' });
      }

      const chatId = req.params.id;
      const userId = req.user.userId;

      // Проверяем, принадлежит ли чат пользователю
      const isOwner = await chatService.isUserChatOwner(chatId, userId);
      if (!isOwner) {
        return res.status(403).json({ error: 'Доступ запрещен. Вы не являетесь владельцем этого чата' });
      }

      const { title } = req.body;
      const chat = await chatService.updateChatTitle(chatId, title);
      res.json(chat);
    } catch (error) {
      console.error('Ошибка при обновлении чата:', error);
      res.status(500).json({ error: 'Не удалось обновить чат' });
    }
  },

  // Удаление чата
  async deleteChat(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Пользователь не авторизован' });
      }

      const chatId = req.params.id;
      const userId = req.user.userId;

      // Проверяем, принадлежит ли чат пользователю
      const isOwner = await chatService.isUserChatOwner(chatId, userId);
      if (!isOwner) {
        return res.status(403).json({ error: 'Доступ запрещен. Вы не являетесь владельцем этого чата' });
      }

      await chatService.deleteChat(chatId);
      res.status(204).end();
    } catch (error) {
      console.error('Ошибка при удалении чата:', error);
      res.status(500).json({ error: 'Не удалось удалить чат' });
    }
  },

  // Отправка сообщения и получение ответа от ИИ
  async sendMessage(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Пользователь не авторизован' });
      }

      const chatId = req.params.id;
      const userId = req.user.userId;

      // Проверяем, принадлежит ли чат пользователю
      const isOwner = await chatService.isUserChatOwner(chatId, userId);
      if (!isOwner) {
        return res.status(403).json({ error: 'Доступ запрещен. Вы не являетесь владельцем этого чата' });
      }

      const { content } = req.body;

      // Проверяем существование чата
      const chat = await chatService.getChatById(chatId);
      if (!chat) {
        return res.status(404).json({ error: 'Чат не найден' });
      }

      // Сохраняем сообщение пользователя
      await chatService.addMessage(chatId, content, 'user');

      // Получаем все сообщения чата для отправки в AI
      const messages = await chatService.getChatMessages(chatId, true);
      const formattedMessages = messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
        // + `${msg.role === 'user' ? '' : '*Говорю как контрагент, соответствую своей роли и характеру, помогаю риелтору отработать свои навыки*'}`
      }));

      if (process.env.ENABLE_AI_RESPONSE === 'true') {
        // Получаем ответ от AI
        const aiResponse = await aiService.communicateWithGemini(formattedMessages);

        // Извлекаем текст ответа
        const modelResponse = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || 'Извините, не удалось получить ответ';

        // Сохраняем ответ модели
        await chatService.addMessage(chatId, modelResponse, 'model');
      } else {
        await chatService.addMessage(chatId, 'TEST TEST TEST', 'model');
      }

      const updatedChat = await chatService.getChatById(chatId);

      res.json(updatedChat);
    } catch (error) {
      console.error('Ошибка при обработке сообщения:', error);
      res.status(500).json({ error: 'Не удалось обработить сообщение' });
    }
  },

  // Завершение чата
  async finishChat(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Пользователь не авторизован' });
      }

      const chatId = req.params.id;
      const userId = req.user.userId;

      // Проверяем, принадлежит ли чат пользователю
      const isOwner = await chatService.isUserChatOwner(chatId, userId);
      if (!isOwner) {
        return res.status(403).json({ error: 'Доступ запрещен. Вы не являетесь владельцем этого чата' });
      }

      const chat = await chatService.finishChat(chatId);
      res.json(chat);
    } catch (error) {
      console.error('Ошибка при завершении чата:', error);
      res.status(500).json({ error: 'Не удалось завершить чат' });
    }
  },
  async getHint(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Пользователь не авторизован' });
      }

      const chatId = req.params.id;
      const userId = req.user.userId;

      // Проверяем, принадлежит ли чат пользователю
      const isOwner = await chatService.isUserChatOwner(chatId, userId);
      if (!isOwner) {
        return res.status(403).json({ error: 'Доступ запрещен. Вы не являетесь владельцем этого чата' });
      }

      const chat = await chatService.getChatById(chatId);
      if (!chat) {
        return res.status(404).json({ error: 'Чат не найден' });
      }

      const hint = await aiService.communicateWithGemini([
        {
          role: 'user', content: HINT_PROMPT({
            messages: getFormattedMessages(chat.messages),
            scenarioInfo: `Название: ${chat.scenario.title} \nОписание: ${chat.scenario.description}`,
            clientType: chat.counterparty.type,
            clientInfo: `характер: ${chat.counterparty.character} \nимя: ${chat.counterparty.name}`,
            apartmentInfo: chat.apartment?.description || ''
          })
        }
      ]);

      res.json({ hint: getGeminiText({ response: hint }) });
    } catch (error) {
      console.error('Ошибка при получении подсказки:', error);
      res.status(500).json({ error: 'Не удалось получить подсказку' });
    }
  }
}; 