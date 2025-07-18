import { PrismaClient } from '../generated/prisma';
import type { UserCharacteristics } from '../__data__/const/prompts';
import { aiService } from './ai';
import { CHARACTERISTICS_ANALYSIS_PROMPT } from '../__data__/const/prompts';
import { getGeminiText } from 'src/utils';

const prisma = new PrismaClient();

/**
 * Вычисляет медиану массива чисел
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sortedValues = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sortedValues.length / 2);
  
  return sortedValues.length % 2 !== 0
    ? sortedValues[mid]
    : (sortedValues[mid - 1] + sortedValues[mid]) / 2;
}

/**
 * Сервис для работы с профилем пользователя
 */
export const profileService = {
  /**
   * Получение медианных характеристик пользователя за последние 5 чатов
   */
  async getUserMedianCharacteristics(userId: string): Promise<Partial<UserCharacteristics>> {
    // Получаем последние 5 чатов пользователя с анализом
    const chats = await prisma.chat.findMany({
      where: {
        userId
      },
      select: {
        id: true,
        analysis: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    if (chats.length === 0) {
      return {
        communicative: {},
        professional: {},
        technical: {}
      };
    }

    // Собираем все значения характеристик
    const characteristicValues: Record<string, Record<string, number[]>> = {
      communicative: {
        friendly: [],
        listener: [],
        confident: [],
        clear: [],
        curious: []
      },
      professional: {
        attentive: [],
        helpful: [],
        knowledge: [],
        ethical: [],
        market: []
      },
      technical: {
        demand: [],
        qualityPresentation: [],
        confrontation: [],
        persuasion: [],
        initiative: [],
        techniques: []
      }
    };

    // Заполняем массивы значениями из анализов чатов
    for (const chat of chats) {
      if (chat.analysis) {
        // Приводим userCharacteristics из анализа к нужному типу
        const userCharacteristics = chat.analysis.userCharacteristics as UserCharacteristics;
        
        // Добавляем значения в соответствующие массивы
        for (const categoryKey of Object.keys(characteristicValues)) {
          const category = categoryKey as keyof UserCharacteristics;
          
          for (const characteristicKey of Object.keys(characteristicValues[categoryKey])) {
            const value = userCharacteristics[category]?.[characteristicKey as keyof typeof userCharacteristics[typeof category]];
            
            if (typeof value === 'number') {
              characteristicValues[categoryKey][characteristicKey].push(value);
            }
          }
        }
      }
    }

    // Вычисляем медианные значения
    const medianCharacteristics: Partial<UserCharacteristics> = {
      communicative: {},
      professional: {},
      technical: {}
    };

    for (const categoryKey of Object.keys(characteristicValues)) {
      const category = categoryKey as keyof UserCharacteristics;
      
      for (const characteristicKey of Object.keys(characteristicValues[categoryKey])) {
        const values = characteristicValues[categoryKey][characteristicKey];
        
        if (values.length > 0) {
          const median = calculateMedian(values);
          
          // Добавляем медианное значение в результат
          (medianCharacteristics[category] as Record<string, number>)[characteristicKey] = median;
        }
      }
    }

    return medianCharacteristics;
  },

  /**
   * Получение истории изменения характеристик пользователя
   */
  async getUserCharacteristicsHistory(userId: string): Promise<Record<string, Record<string, { value: number, date: Date }[]>>> {
    // Получаем все чаты пользователя с анализом
    const chats = await prisma.chat.findMany({
      where: {
        userId
      },
      select: {
        id: true,
        analysis: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (chats.length === 0) {
      return {};
    }

    // Создаем структуру для хранения истории изменения характеристик
    const characteristicsHistory: Record<string, Record<string, { value: number, date: Date }[]>> = {
      communicative: {
        friendly: [],
        listener: [],
        confident: [],
        clear: [],
        curious: []
      },
      professional: {
        attentive: [],
        helpful: [],
        knowledge: [],
        ethical: [],
        market: []
      },
      technical: {
        demand: [],
        qualityPresentation: [],
        confrontation: [],
        persuasion: [],
        initiative: [],
        techniques: []
      }
    };

    // Заполняем историю значениями из анализов чатов
    for (const chat of chats) {
      if (chat.analysis) {
        // Приводим userCharacteristics из анализа к нужному типу
        const userCharacteristics = chat.analysis.userCharacteristics as UserCharacteristics;
        
        // Добавляем значения в соответствующие массивы истории
        for (const categoryKey of Object.keys(characteristicsHistory)) {
          const category = categoryKey as keyof UserCharacteristics;
          
          for (const characteristicKey of Object.keys(characteristicsHistory[categoryKey])) {
            const value = userCharacteristics[category]?.[characteristicKey as keyof typeof userCharacteristics[typeof category]];
            
            if (typeof value === 'number') {
              characteristicsHistory[categoryKey][characteristicKey].push({
                value,
                date: chat.createdAt
              });
            }
          }
        }
      }
    }

    
    return characteristicsHistory;
  },

  async analyzeCharacteristicDynamic(characteristicName: string, characteristicRus: string, characteristicHistory: any[]) {
    const prompt = CHARACTERISTICS_ANALYSIS_PROMPT(characteristicName, characteristicRus, characteristicHistory);
    const response = await aiService.communicateWithGemini([{
      role: 'user',
      content: prompt
    }]);
    const text = getGeminiText({response})


    return text;
  }
}; 