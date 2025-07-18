import { Router } from 'express';
import { scenarioController } from '../controllers/scenario.controller';

const router = Router();

// Маршруты для работы со сценариями
router.get('/', scenarioController.getAllScenarios);
router.post('/', scenarioController.createScenario);
router.get('/:id', scenarioController.getScenarioById);
router.patch('/:id', scenarioController.updateScenario);
router.delete('/:id', scenarioController.deleteScenario);

export default router; 