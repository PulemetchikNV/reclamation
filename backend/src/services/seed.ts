import { PrismaClient } from '../generated/prisma';
import scenariosData from '../__data__/mockScenarios.json';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export const seedService = {
  /**
   * Загружает начальные данные в базу данных, если они еще не загружены
   */
  async loadInitialData() {
    try {
      console.log('Проверка наличия данных в базе...');
      
      // Проверяем, есть ли уже группы сценариев в базе
      const existingGroups = await prisma.scenarioGroup.count();
      
      if (existingGroups > 0) {
        console.log('В базе уже есть данные, пропускаем загрузку.');
        return;
      }
      
      console.log('Начинаем загрузку начальных данных...');
      
      // Загружаем группы сценариев и сценарии
      for (const groupData of scenariosData.scenarioGroups) {
        console.log(`Создаем группу сценариев: ${groupData.title}`);
        
        const group = await prisma.scenarioGroup.create({
          data: {
            title: groupData.title,
            description: groupData.description
          }
        });
        
        // Для каждой группы создаем сценарии
        for (const scenarioData of groupData.scenarios) {
          console.log(`Создаем сценарий: ${scenarioData.title}`);
          
          await prisma.scenario.create({
            data: {
              title: scenarioData.title,
              imageUrl: scenarioData.imageUrl,
              aiPrompt: scenarioData.aiPrompt,
              description: scenarioData.description,
              difficultyMeta: scenarioData.difficultyMeta || null,
              groupId: group.id,
              metadata: scenarioData.metadata || {}
            }
          });
        }
      }
      
      console.log('Загрузка начальных данных завершена успешно!');
    } catch (error) {
      console.error('Ошибка при загрузке начальных данных:', error);
    }
  }
}; 