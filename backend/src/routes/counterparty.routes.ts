import { Router } from 'express';
import { counterpartyController } from '../controllers/counterparty.controller';

const router = Router();

// Маршруты для работы с контрагентами
router.get('/', counterpartyController.getAllCounterparties);
router.post('/', counterpartyController.createCounterparty);
router.get('/:id', counterpartyController.getCounterpartyById);
router.patch('/:id', counterpartyController.updateCounterparty);
router.delete('/:id', counterpartyController.deleteCounterparty);
router.post('/generate', counterpartyController.generateCounterparty);
export default router; 