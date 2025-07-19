import { Router } from 'express';
import { voiceController } from '../controllers/voice.controller.js';

const router = Router();

router.post('/synthesize', voiceController.synthesizeSpeech);

export const voiceRoutes = router; 