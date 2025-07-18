import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';

const router = Router();

// Защищенные маршруты (требуют авторизации)
router.get('/characteristics', profileController.getUserCharacteristics);
router.get('/characteristics/history', profileController.getUserCharacteristicsHistory);
router.post('/characteristics/dynamic', profileController.analyzeCharacteristicDynamic);

export default router; 