import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
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
          scenario: `${scenario?.aiPrompt} ${JSON.stringify(scenario?.scenarioMeta) ?? ''}`,
          goal: counterparty.goal,
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

  async createRagChat(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Пользователь не авторизован' });
      }

      let { title, scenarioId, counterpartyId, apartmentId } = req.body;
      const userId = req.user.userId;
      const fullUser = await authService.getUserById(userId);
      
      const counterparty = await counterpartyService.getCounterpartyById(counterpartyId);
      const scenario = await scenarioService.getScenarioById(scenarioId);
      const apartment = await apartmentService.getApartmentById(apartmentId);
      
      if (!scenario || !counterparty) {
        return res.status(400).json({ error: 'Сценарий или контрагент не найдены' });
      }
      if (!title) {
        title = `${scenario.title} с ${counterparty.name}`;
      }

      if (!counterparty) {
        return res.status(400).json({ error: 'Необходимо указать контрагента' });
      }

      // Read context file if it exists
      let contextContent: string | undefined = undefined;
      if (counterparty.contextFilePath) {
          try {
              const fullPath = path.join(__dirname, '..', counterparty.contextFilePath.replace('/static', 'public'));
              contextContent = await fs.readFile(fullPath, 'utf-8');
          } catch(e) {
              console.error(`Could not read context file for counterparty ${counterparty.id}:`, e);
          }
      }

      // 1. Setup character in RAG and get session_id
      const ragSetupResponse = await aiService.setupCharacter(counterparty.characterData, contextContent);
      const ragSessionId = ragSetupResponse.session_id;

      if (!ragSessionId) {
        return res.status(500).json({ error: 'Не удалось создать RAG сессию' });
      }

      // 2. Create chat in our DB with ragSessionId
      const chat = await chatService.createChat({
        title,
        scenarioId,
        counterpartyId,
        apartmentId,
        userId,
        ragSessionId: ragSessionId.toString(),
      });

      // 3. Send initial prompt to RAG to get the first message
      const initialPrompt = INITIAL_DIALOG_PROMPT({
        character: counterparty.character,
        name: counterparty.name,
        scenario: `${scenario?.aiPrompt} ${JSON.stringify(scenario?.scenarioMeta) ?? ''}`,
        goal: counterparty.goal,
        apartmentSources: '', // Deprecated
        apartmentDescription: apartment?.description || '',
        userName: (fullUser?.firstName ? (fullUser.firstName + ' ' + fullUser.lastName) : '') || ''
      });
      
      const ragResponse = await aiService.communicateWithRag(ragSessionId, initialPrompt);
      const modelResponse = ragResponse.response || 'Здравствуйте.';

      // 4. Save model's first message to our DB
      await chatService.addMessage(chat.id, modelResponse, 'model');
      
      const updatedChat = await chatService.getChatById(chat.id);
      res.status(201).json(updatedChat);

    } catch (error) {
      console.error('Ошибка при создании RAG чата:', error);
      res.status(500).json({ error: 'Не удалось создать RAG чат' });
    }
  },

  // Отправка сообщения и получение ответа от ИИ (теперь через RAG)
  async sendMessage(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Пользователь не авторизован' });
      }
      const chatId = req.params.id;
      const { content } = req.body;
      const userId = req.user.userId;

      const isOwner = await chatService.isUserChatOwner(chatId, userId);
      if (!isOwner) {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }
      const chat = await chatService.getChatById(chatId);
      if (!chat || !chat.ragSessionId) {
        return res.status(404).json({ error: 'Чат или RAG сессия не найдены' });
      }

      await chatService.addMessage(chatId, content, 'user');
      
      const ragResponse = await aiService.communicateWithRag(chat.ragSessionId, content);
      const modelResponse = ragResponse.response || 'Извините, не удалось получить ответ.';

      await chatService.addMessage(chatId, modelResponse, 'model');

      const updatedChat = await chatService.getChatById(chatId);
      res.json(updatedChat);
    } catch (error) {
      console.error('Ошибка при обработке сообщения:', error);
      res.status(500).json({ error: 'Не удалось обработать сообщение' });
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