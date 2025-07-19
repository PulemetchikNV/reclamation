import { Request, Response } from 'express';
import { voiceService } from '../services/voice.service.js';
import { counterpartyService } from '../services/counterparty.js';

export const voiceController = {
  async synthesizeSpeech(req: Request, res: Response) {
    try {
      const { text, characterId } = req.body;

      if (!text || !characterId) {
        return res.status(400).json({ error: 'Необходимы text и characterId' });
      }

      const character = await counterpartyService.getCounterpartyById(characterId);
      if (!character || !character.minimaxVoiceId) {
        return res.status(404).json({ error: 'Персонаж не найден или у него нет голоса' });
      }

      const audioBuffer = await voiceService.textToSpeech(text, character.minimaxVoiceId);

      if (audioBuffer) {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(audioBuffer);
      } else {
        res.status(500).json({ error: 'Не удалось синтезировать речь' });
      }
    } catch (error) {
      console.error('Ошибка при синтезе речи:', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  },
}; 