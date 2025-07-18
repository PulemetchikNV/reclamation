import axios from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';

const TRANSCRIPTION_SERVICE_URL = process.env.TRANSCRIPTION_URL;

export class TranscriptionService {
  async transcribeAudio(files: Express.Multer.File[], language: string = 'ru'): Promise<any> {
    if (!TRANSCRIPTION_SERVICE_URL) {
      throw new Error('TRANSCRIPTION_SERVICE не установлен');
    }

    try {
      const formData = new FormData();
      const file = files[0]
      
      // Создаем поток из буфера файла
      const fileStream = new Readable();
      fileStream.push(file.buffer);
      fileStream.push(null);

      // Добавляем файл в FormData
      formData.append('file', fileStream, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const responseTimeout = 10000
      const response = await axios.post(
        `${TRANSCRIPTION_SERVICE_URL}/?return_timestamps=true&language=${language}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          timeout: responseTimeout,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Ошибка при транскрибации:', error);
      throw new Error('Не удалось выполнить транскрибацию аудио');
    }
  }
} 