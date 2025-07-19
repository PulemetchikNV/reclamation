import 'dotenv/config';
import FormData from 'form-data';
import axios from 'axios';
import fs from 'fs';

const MINIMAX_GROUP_ID = process.env.MINIMAX_GROUP_ID;
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;

const minimaxApi = axios.create({
  baseURL: 'https://api.minimax.io/v1',
  headers: {
    'Authorization': `Bearer ${MINIMAX_API_KEY}`,
  },
});

export const voiceService = {
  /**
   * Загружает аудиофайл в Minimax.
   * @param filePath - Путь к локальному mp3 файлу.
   * @returns file_id из системы Minimax.
   */
  async uploadVoiceFile(filePath: string): Promise<number | null> {
    try {
      const formData = new FormData();
      formData.append('purpose', 'voice_clone');
      formData.append('file', fs.createReadStream(filePath));
      
      const response = await minimaxApi.post(`/files/upload?GroupId=${MINIMAX_GROUP_ID}`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${MINIMAX_API_KEY}`,
        },
      });
      
      if (response.data.base_resp.status_code === 0) {
        return response.data.file.file_id;
      }
      console.error('Ошибка при загрузке файла в Minimax:', response.data);
      return null;
    } catch (error) {
      console.error('Критическая ошибка при загрузке файла в Minimax:', error);
      return null;
    }
  },

  /**
   * Создает (клонирует) голос из загруженного файла.
   * @param fileId - ID файла из Minimax.
   * @param voiceName - Уникальное имя для нового голоса.
   * @returns voice_id из системы Minimax.
   */
  async cloneVoice(fileId: number, voiceName: string): Promise<string | null> {
    try {
      const response = await minimaxApi.post(`/voice_clone?GroupId=${MINIMAX_GROUP_ID}`, {
        file_id: fileId,
        voice_id: voiceName,
      });

      if (response.data.base_resp.status_code === 0 && response.data.voice_id) {
        return response.data.voice_id;
      }
      console.error('Ошибка при клонировании голоса в Minimax:', response.data);
      return null;
    } catch (error) {
      console.error('Критическая ошибка при клонировании голоса:', error);
      return null;
    }
  },

  /**
   * Синтезирует речь из текста, используя указанный голос.
   * @param text - Текст для озвучивания.
   * @param voiceId - ID голоса из Minimax.
   * @returns Аудиоданные в виде Buffer.
   */
  async textToSpeech(text: string, voiceId: string): Promise<Buffer | null> {
    try {
      const response = await minimaxApi.post(`/t2a_v2?GroupId=${MINIMAX_GROUP_ID}`, {
        model: "speech-02-hd",
        text,
        stream: false,
        voice_setting: {
          voice_id: voiceId,
          speed: 1.0,
          vol: 1.0,
          pitch: 0
        },
        audio_setting: {
          sample_rate: 32000,
          bitrate: 128000,
          format: "mp3",
          channel: 1
        }
      }, {
        responseType: 'arraybuffer'
      }); // Получаем ответ как бинарные данные

      if (response.data) {
        // Поскольку мы получаем arraybuffer, данные будут напрямую в response.data
        return Buffer.from(response.data);
      }
      return null;
    } catch (error) {
      console.error('Критическая ошибка при синтезе речи:', error);
      return null;
    }
  }
}; 