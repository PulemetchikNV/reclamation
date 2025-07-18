import { Router } from 'express';
import multer from 'multer';
import { TranscriptionController } from '../controllers/transcription.controller';

const router = Router();
const upload = multer();
const transcriptionController = new TranscriptionController();

router.post(
  '/transcribe',
  upload.array('files'),
  transcriptionController.transcribeAudio
);

export default router; 