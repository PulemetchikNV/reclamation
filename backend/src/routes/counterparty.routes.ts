import { Router } from 'express';
import { counterpartyController } from '../controllers/counterparty.controller.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'src/public/'; 
    if (file.fieldname === 'characterPhoto') {
        uploadPath = path.join(uploadPath, 'images/characters');
    } else if (file.fieldname === 'contextFile') {
        uploadPath = path.join(uploadPath, 'context_files');
    } else {
        uploadPath = path.join(uploadPath, 'uploads');
    }
    // Создаем директорию, если она не существует
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const upload = multer({ storage: storage });

const router = Router();

router.get('/', counterpartyController.getAllCounterparties);
router.post('/', upload.fields([
    { name: 'characterPhoto', maxCount: 1 },
    { name: 'contextFile', maxCount: 1 }
]), counterpartyController.createCounterparty);

router.get('/:id', counterpartyController.getCounterpartyById);

router.put('/:id', upload.fields([
    { name: 'characterPhoto', maxCount: 1 },
    { name: 'contextFile', maxCount: 1 }
]), counterpartyController.updateCounterparty);

router.delete('/:id', counterpartyController.deleteCounterparty);

export default router;