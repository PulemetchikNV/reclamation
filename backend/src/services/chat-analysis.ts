import { PrismaClient } from '../generated/prisma';
import { ANALYZE_CHAT_PROMPT, ChatAnalysisResult } from 'src/__data__/const/prompts';
import { aiService } from './ai';
import { chatService } from './chat';
import { removeJsonBraces } from 'src/utils';
import { scenarioService } from './scenario.js';

const prisma = new PrismaClient();

export const chatAnalysisService = {
  async analyzeChatById(chatId: string): Promise<ChatAnalysisResult> {
    // Получение чата с сообщениями
    const chat = await chatService.getChatById(chatId);

    if (!chat) {
      throw new Error(`Чат с ID ${chatId} не найден`);
    }

    // Проверка, что чат завершен
    if (!chat.isFinished) {
      throw new Error(`Чат с ID ${chatId} не завершен`);
    }

    // Получение всех сообщений чата, включая скрытые
    const messages = await chatService.getChatMessages(chatId, true);

    // Форматирование сообщений для анализа
    const formattedChat = messages
      .filter(msg => !msg.hidden) // Игнорируем скрытые сообщения
      .map(msg => `${msg.role === 'user' ? 'Риелтор' : 'Клиент'}: ${msg.content}`)
      .join('\n');

    const scenario = await scenarioService.getScenarioById(chat.scenarioId);
    if (!scenario) {
      throw new Error(`Сценарий с ID ${chat.scenarioId} не найден`);
    }
    const scenarioInfo = JSON.stringify(scenario);

    // Создание промпта для анализа
    const prompt = ANALYZE_CHAT_PROMPT(formattedChat, scenarioInfo);

    // Отправка запроса к AI
    const aiResponse = await aiService.communicateWithGemini([
      { role: 'user', content: prompt }
    ]);

    // Извлечение ответа AI
    const responseText = removeJsonBraces(aiResponse.candidates[0].content.parts[0].text);

    // Парсинг JSON из ответа
    let analysis: ChatAnalysisResult;
    try {
      analysis = JSON.parse(responseText);
    } catch (error) {
      throw new Error(`Не удалось распарсить ответ AI: ${responseText}`);
    }

    if (!analysis.goodSides) {
      analysis.goodSides = ['Ошибка при выявлении положительных сторон']
    }
    if (!analysis.badSides) {
      analysis.badSides = ['Ошибка при выявлении отрицательных сторон']
    }
    if (typeof analysis.rating !== 'number') {
      analysis.rating = 0
    }

    // Проверка структуры полученного анализа
    if (!analysis.userCharacteristics || typeof analysis.userCharacteristics !== 'object') {
      analysis.userCharacteristics = {
        communicative: {},
        professional: {},
        technical: {}
      }
    }

    // Сохранение анализа в базе данных
    const savedAnalysis = await this.saveAnalysis(chatId, analysis);

    return analysis;
  },

  async saveAnalysis(chatId: string, analysis: ChatAnalysisResult) {
    // Проверка существующего анализа
    const existingAnalysis = await prisma.chatAnalysis.findUnique({
      where: { chatId }
    });

    if (existingAnalysis) {
      // Если анализ уже существует, обновляем его
      return prisma.chatAnalysis.update({
        where: { chatId },
        data: {
          goodSides: analysis.goodSides,
          badSides: analysis.badSides,
          rating: analysis.rating,
          userCharacteristics: analysis.userCharacteristics
        }
      });
    } else {
      // Если анализа нет, создаем новый
      return prisma.chatAnalysis.create({
        data: {
          chatId,
          goodSides: analysis.goodSides,
          badSides: analysis.badSides,
          rating: analysis.rating,
          userCharacteristics: analysis.userCharacteristics
        }
      });
    }
  },

  async getAnalysisByChatId(chatId: string) {
    return prisma.chatAnalysis.findUnique({
      where: { chatId }
    });
  },

  async deleteAnalysis(chatId: string) {
    return prisma.chatAnalysis.delete({
      where: { chatId }
    });
  }

}; 