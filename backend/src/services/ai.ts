import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import FormData from 'form-data';
import fetch from 'node-fetch';
import axios, { AxiosError } from 'axios';
import type { Prisma } from '../generated/prisma/index.js';

type Role = 'user' | 'model';

const isProxyApiEnabled = process.env.IS_PROXY_API_ENABLED === 'true';
const isImageGenerationEnabled = process.env.IS_IMAGE_GENERATION_ENABLED === 'true';
const apiKey = isProxyApiEnabled ? process.env.PROXY_API_KEY : process.env.GEMINI_API_KEY;
const ragApiUrl = process.env.RAG_API_URL || 'http://localhost:5001';

console.log('ENV IS =====', process.env)

export const aiService = {
    async communicateWithGemini(messages: { role: Role, content: string }[]) {
        try {
            const baseUrlText = isProxyApiEnabled ? 'https://api.proxyapi.ru/google' : 'https://generativelanguage.googleapis.com';
            const url = `${baseUrlText}/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            console.log("COMMUNICATE WITH GEMINI", url, messages)
            
            // Преобразование формата сообщений из истории в формат, требуемый Gemini API
            const content = messages.map(message => ({
                role: message.role === 'model' ? 'model' : 'user',
                parts: [{ text: message.content }],
            }));
            const body = {
                contents: content,
                generationConfig: {
                    temperature: 1.2
                }
            }
            console.log('body', body)

            
            const response = await fetch(`${url}`, {
                method: 'POST',
                headers: !isProxyApiEnabled ? {
                    'Content-Type': 'application/json',
                } : {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Ошибка Gemini API: ${response.status} ${JSON.stringify(errorData)}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка при общении с Gemini API:', error);
            throw error;
        }
    },
    async setupCharacter(characterData: Prisma.JsonValue, context?: string) {
        const formData = new FormData();
        const characterJson = JSON.stringify({ characterData });
        // Отправляем JSON как обычное текстовое поле
        formData.append('character_json', characterJson);

        if (context) {
            // Файл с контекстом по-прежнему отправляется как файл
            formData.append('context_file', Buffer.from(context), {
                contentType: 'text/plain',
                filename: 'context.txt'
            });
        }

        try {
            const response = await axios.post(`${ragApiUrl}/setup_character`, formData, {
                headers: {
                    ...formData.getHeaders()
                }
            });

            if (response.status !== 200) {
                throw new Error(`Ошибка настройки персонажа: ${response.status} ${JSON.stringify(response.data)}`);
            }
            
            return response.data; // { session_id: number }
        } catch (error: any) {
            if('response' in error) {
                console.error('Ошибка при настройке персонажа в RAG:', JSON.stringify(error?.response?.data));
            } else {
                console.error('Ошибка при настройке персонажа в RAG:', JSON.stringify(error));
            }
            throw error;
        }
    },
    async communicateWithRag(sessionId: string, message: string) {
        try {
            const response = await fetch(`${ragApiUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    user_message: message,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Ошибка RAG API: ${response.status} ${JSON.stringify(errorData)}`);
            }
            
            const data = await response.json();
            return data; // { response: string }
        } catch (error) {
            console.error('Ошибка при общении с RAG API:', error);
            throw error;
        }
    },
    async getGeminiPhoto(prompt: string, model: 'gemini' | 'openai' = isProxyApiEnabled ? 'openai' : 'gemini' ) {
        if(isProxyApiEnabled || !isImageGenerationEnabled) {
            return {
                imageUrl: `/static/images/placeholders/400x400.svg`,
                data: null,
            }
        }

        try {
            const url = model === 'gemini' ? 
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}` : 
                `https://api.proxyapi.ru/openai/v1/images/generations?quality=low&size=512x512`;

            console.log('fetching url', url)

            const body = model === 'gemini' ? {
                contents: [{ 
                    parts: [{ text: prompt }] 
                }],
                "generationConfig":{"responseModalities":["TEXT","IMAGE"]}
            } : {
                "model": "gpt-image-1",
                prompt,
                // response_format: 'b64_json'
            }


            const response = await fetch(url, {
                method: 'POST',
                headers: !isProxyApiEnabled ? {
                    'Content-Type': 'application/json',
                } : {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Ошибка генерации изображения ${model === 'gemini' ? 'Gemini' : 'OpenAI'} Api: ${response.status} ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            
            let imageBase64 = null;
            if(model === 'gemini') {
                imageBase64 = data.candidates[0].content.parts.find((part: any) => part.inlineData?.mimeType === 'image/png')?.inlineData?.data;
            } else {
                imageBase64 = data.data[0].b64_json;
            }
            // Получаем данные изображения
            if (!imageBase64) {
                throw new Error('Изображение не получено от API');
            }
            
            // Создаем уникальное имя файла
            const filename = `${crypto.randomUUID()}.png`;
            
            // Правильные пути с учетом структуры проекта при разработке и в продакшене
            const isProduction = process.env.NODE_ENV === 'production';
            let publicDir;
            
            if (isProduction) {
                // В продакшене используем путь относительно скомпилированных файлов
                publicDir = path.join(__dirname, '../public/images/generated');
            } else {
                // В разработке используем путь от корня проекта
                publicDir = path.join(process.cwd(), 'src/public/images/generated');
            }
            
            // Создаем директорию, если она не существует
            if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
            }
            
            // Сохраняем изображение
            const imagePath = path.join(publicDir, filename);
            const imageData = Buffer.from(imageBase64, 'base64');
            fs.writeFileSync(imagePath, imageData);
            
            // Формируем URL для клиента
            const imageUrl = `/static/images/generated/${filename}`;
            
            return { 
                imageUrl,
                data // Возвращаем исходные данные для совместимости
            };
        } catch (error) {
            console.error('Ошибка при получении изображения от Gemini API:', error);
            throw error;
        }
    },
    async getAiAudio(text: string, seed: number = 42) {
        try {
            // URL для синтеза речи
            const url = 'http://83.151.2.86:7533/synthesize/';
            
            // Отправляем запрос на синтез речи
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text, seed }),
            });
            
            if (!response.ok) {
                throw new Error(`Ошибка синтеза речи: ${response.status}`);
            }
            
            // Получаем аудио данные
            const audioData = await response.arrayBuffer();
            
            // Создаем уникальное имя файла
            const filename = `${crypto.randomUUID()}.wav`;
            
            // Определяем путь для сохранения файла
            const isProduction = process.env.NODE_ENV === 'production';
            let publicDir;
            
            if (isProduction) {
                // В продакшене используем путь относительно скомпилированных файлов
                publicDir = path.join(__dirname, '../public/audio/generated');
            } else {
                // В разработке используем путь от корня проекта
                publicDir = path.join(process.cwd(), 'backend/src/public/audio/generated');
            }
            
            // Создаем директорию, если она не существует
            if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
            }
            
            // Сохраняем аудиофайл
            const audioPath = path.join(publicDir, filename);
            fs.writeFileSync(audioPath, Buffer.from(audioData));
            
            // Формируем URL для клиента
            const audioUrl = `/static/audio/generated/${filename}`;
            
            return {
                audioUrl,
                filename
            };
        } catch (error) {
            console.error('Ошибка при получении аудио:', error);
            throw error;
        }
    }
}
