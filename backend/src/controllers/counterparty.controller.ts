import { Request, Response } from 'express';
import { counterpartyService } from '../services/counterparty.js';
import { voiceService } from '../services/voice.service.js';
import { aiService } from '../services/ai';
import { GEN_COUNTERPARTY_PHOTO_PROMPT_BUYER, GEN_COUNTERPARTY_PHOTO_PROMPT_SELLER, GEN_COUNTERPARTY_PROMPT } from 'src/__data__/const/prompts';
import { removeJsonBraces } from 'src/utils';
import { getRandomCounterparty } from 'src/__data__/const/counterparties';
import { Prisma } from '../generated/prisma/index.js';

export const counterpartyController = {
  // Получение всех контрагентов
  async getAllCounterparties(_req: Request, res: Response) {
    try {
      const counterparties = await counterpartyService.getAllCounterparties();
      res.json(counterparties);
    } catch (error) {
      console.error('Ошибка при получении контрагентов:', error);
      res.status(500).json({ error: 'Не удалось получить контрагентов' });
    }
  },

  async createCounterparty(req: Request, res: Response) {
    try {
      const { name, characterData } = req.body;
      const parsedCharacterData = JSON.parse(characterData);

      const description = parsedCharacterData?.general?.role || 'Нет описания';
      const character = parsedCharacterData?.behavior?.personalityType || 'Не указан';
      const goal = parsedCharacterData?.behavior?.attitude || 'Не указана';

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const characterPhoto = files?.characterPhoto?.[0];
      const contextFile = files?.contextFile?.[0];
      const voiceFile = files?.voiceFile?.[0];

      const photoPath = characterPhoto ? `/images/characters/${characterPhoto.filename}` : undefined;
      const contextFilePath = contextFile ? `/context_files/${contextFile.filename}` : undefined;
      const voiceFilePath = voiceFile ? voiceFile.path : undefined;

      let minimaxVoiceId: string | null = null;
      if (voiceFile) {
        const fileId = await voiceService.uploadVoiceFile(voiceFile.path);
        if (fileId) {
          // Генерируем уникальное имя для голоса, можно использовать ID персонажа, но его еще нет
          const voiceName = `char_voice_${Date.now()}`;
          minimaxVoiceId = await voiceService.cloneVoice(fileId, voiceName);
        }
      }
      
      const newCounterparty = await counterpartyService.createCounterparty({
        name,
        character,
        goal,
        description,
        photos: photoPath ? [photoPath] : [],
        characterData: parsedCharacterData,
        contextFilePath,
        voiceFile: voiceFilePath,
        minimaxVoiceId: minimaxVoiceId,
      });

      res.status(201).json(newCounterparty);
    } catch (error) {
      console.error('Ошибка при создании контрагента:', error);
      res.status(500).json({ error: 'Не удалось создать контрагента' });
    }
  },


  // Получение контрагента по ID
  async getCounterpartyById(req: Request, res: Response) {
    try {
      const counterparty = await counterpartyService.getCounterpartyById(req.params.id);
      if (!counterparty) {
        return res.status(404).json({ error: 'Контрагент не найден' });
      }
      res.json(counterparty);
    } catch (error) {
      console.error('Ошибка при получении контрагента:', error);
      res.status(500).json({ error: 'Не удалось получить контрагента' });
    }
  },

  async updateCounterparty(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, characterData, removePhoto, removeContextFile } = req.body;
      const parsedCharacterData = JSON.parse(characterData);

      const description = parsedCharacterData?.general?.role || 'Нет описания';
      const character = parsedCharacterData?.behavior?.personalityType || 'Не указан';
      const goal = parsedCharacterData?.behavior?.attitude || 'Не указана';
      
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const characterPhoto = files?.characterPhoto?.[0];
      const contextFile = files?.contextFile?.[0];
      const voiceFile = files?.voiceFile?.[0];
      
      const photoPath = characterPhoto ? `/images/characters/${characterPhoto.filename}` : undefined;
      const contextFilePath = contextFile ? `/context_files/${contextFile.filename}` : undefined;
      const voiceFilePath = voiceFile ? voiceFile.path : undefined;

      const updateData: any = {
        name,
        character,
        goal,
        description,
        characterData: parsedCharacterData,
      };

      if (photoPath) {
        updateData.photos = [photoPath];
      } else if (removePhoto === 'true') {
        updateData.photos = [];
      }

      if (contextFilePath) {
        updateData.contextFilePath = contextFilePath;
      } else if (removeContextFile === 'true') {
        updateData.contextFilePath = null;
      }

      if (voiceFile) {
        const fileId = await voiceService.uploadVoiceFile(voiceFile.path);
        if (fileId) {
          const voiceName = `char_voice_${id}_${Date.now()}`;
          const newMinimaxId = await voiceService.cloneVoice(fileId, voiceName);
          if (newMinimaxId) {
            updateData.minimaxVoiceId = newMinimaxId;
            updateData.voiceFile = voiceFilePath;
          }
        }
      }

      const updatedCounterparty = await counterpartyService.updateCounterparty(id, updateData);
      res.status(200).json(updatedCounterparty);
    } catch (error) {
      console.error('Ошибка при обновлении контрагента:', error);
      res.status(500).json({ error: 'Не удалось обновить контрагента' });
    }
  },

  // Удаление контрагента
  async deleteCounterparty(req: Request, res: Response) {
    try {
      await counterpartyService.deleteCounterparty(req.params.id);
      res.status(204).end();
    } catch (error) {
      console.error('Ошибка при удалении контрагента:', error);
      res.status(500).json({ error: 'Не удалось удалить контрагента' });
    }
  }
}; 