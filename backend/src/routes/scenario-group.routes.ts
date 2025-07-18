import { Router } from 'express';
import { scenarioGroupController } from '../controllers/scenario-group.controller';

const router = Router();

// Маршруты для работы с группами сценариев
router.get('/', scenarioGroupController.getAllScenarioGroups);
router.post('/', scenarioGroupController.createScenarioGroup);
router.get('/:id', scenarioGroupController.getScenarioGroupById);
router.patch('/:id', scenarioGroupController.updateScenarioGroup);
router.delete('/:id', scenarioGroupController.deleteScenarioGroup);

export default router; 