import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';

const router = Router();

// Публичные маршруты
router.get('/', chatController.getAllChats);

// Защищенные маршруты (требуют авторизации)
router.get('/my', chatController.getUserChats);
router.post('/', chatController.createRagChat);
router.get('/:id', chatController.getChatById);
router.patch('/:id/title', chatController.updateChatTitle);
router.delete('/:id', chatController.deleteChat);
router.post('/:id/message', chatController.sendMessage);
router.patch('/:id/finish', chatController.finishChat);
router.post('/:id/hint', chatController.getHint);

export default router; 