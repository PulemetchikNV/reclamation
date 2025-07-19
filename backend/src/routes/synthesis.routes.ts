import { Router } from 'express';
import { aiService } from '../services/ai';
import path from 'path';
import fs from 'fs';

const router = Router();

// Универсальный маршрут для синтеза речи
router.post('/', async (req, res) => {
    try {
        const { text, seed } = req.body;
        const acceptHeader = req.get('Accept') || '';
        const responseType = req.query.responseType;
        
        if (!text) {
            return res.status(400).json({ error: 'Текст обязателен для синтеза речи' });
        }

        // Если запрашивается бинарный ответ (для curl)
        if (acceptHeader.includes('application/octet-stream') || responseType === 'binary') {
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
            
            // Отправляем бинарный ответ
            res.setHeader('Content-Type', 'audio/wav');
            res.setHeader('Content-Disposition', 'attachment; filename="speech.wav"');
            return res.send(Buffer.from(audioData));
        }
        
        // Для обычных запросов используем стандартную логику с сохранением файла
        const result = await aiService.getAiAudio(text, seed);
        res.json(result);
    } catch (error: any) {
        console.error('Ошибка синтеза речи:', error);
        res.status(500).json({ error: error.message || 'Внутренняя ошибка сервера' });
    }
});

// Маршрут для скачивания аудиофайла
router.get('/download/:filename', (req, res) => {
    const { filename } = req.params;
    const isProduction = process.env.NODE_ENV === 'production';
    let filePath;
    
    if (isProduction) {
        filePath = path.join(__dirname, '../public/audio/generated', filename);
    } else {
        filePath = path.join(process.cwd(), 'src/public/audio/generated', filename);
    }
    
    res.download(filePath, filename, (err) => {
        if (err) {
            res.status(404).json({ error: 'Файл не найден' });
        }
    });
});

export default router; 

// http://localhost:3000/static/images/characters/characterPhoto-1752894357887-448834309.jpg
// http://localhost:3000/static/images/characters/characterPhoto-1752894918863-204502111.jpg