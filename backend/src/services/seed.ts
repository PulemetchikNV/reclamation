import { PrismaClient } from '../generated/prisma/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scenariosData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../__data__/mockScenarios.json'), 'utf-8'));

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
              scenarioMeta: scenarioData.scenarioMeta || null,
              groupId: group.id,
              metadata: (scenarioData as any).metadata || {}
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