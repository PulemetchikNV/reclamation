import express from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import chatRoutes from './routes/chat.routes';
import scenarioRoutes from './routes/scenario.routes';
import scenarioGroupRoutes from './routes/scenario-group.routes';
import counterpartyRoutes from './routes/counterparty.routes';
import apartmentRoutes from './routes/apartment.routes';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import transcriptionRoutes from './routes/transcription.routes';
import synthesisRoutes from './routes/synthesis.routes';
import { authGuard } from './middleware/auth.middleware';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser()); // Для работы с куками


// Статика
app.use('/static', express.static(path.join(__dirname, 'public')));

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/chats', authGuard, chatRoutes);
app.use('/api/scenarios', authGuard, scenarioRoutes);
app.use('/api/scenario-groups', authGuard, scenarioGroupRoutes);
app.use('/api/counterparties', authGuard, counterpartyRoutes);
app.use('/api/apartments', authGuard, apartmentRoutes);
app.use('/api/profile', authGuard, profileRoutes);
app.use('/api/transcription', authGuard, transcriptionRoutes);
app.use('/api/synthesize', authGuard, synthesisRoutes);
app.use('/synthesize', synthesisRoutes); // Прямой маршрут без аутентификации для совместимости с запросом через curl

// Простой запрос для проверки, что сервер работает
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app; 