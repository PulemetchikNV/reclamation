import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { counterpartyController } from '../controllers/counterparty.controller';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Настройка Multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/context_files');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Маршруты
router.get('/', counterpartyController.getAllCounterparties);
router.get('/:id', counterpartyController.getCounterpartyById);
router.post('/', upload.single('contextFile'), counterpartyController.createCounterparty);
router.patch('/:id', upload.single('contextFile'), counterpartyController.updateCounterparty);
router.delete('/:id', counterpartyController.deleteCounterparty);
export default router; 