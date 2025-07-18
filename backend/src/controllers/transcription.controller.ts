import { Request, Response } from 'express';
import { TranscriptionService } from '../services/transcription';

export class TranscriptionController {
  private transcriptionService: TranscriptionService;

  constructor() {
    this.transcriptionService = new TranscriptionService();
  }

  transcribeAudio = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.files) {
        res.status(400).json({ error: 'Файлы не были предоставлены' });
        return;
      }

      const language = req.query.language as string || 'ru';
      const result = await this.transcriptionService.transcribeAudio(req.files, language);
      
      res.json(result);
    } catch (error) {
      console.error('Ошибка в контроллере транскрибации:', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  };
} 