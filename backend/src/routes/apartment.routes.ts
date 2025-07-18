import { Router } from 'express';
import { apartmentController } from '../controllers/apartment.controller';

const router = Router();

// Маршруты для работы с апартаментами
router.get('/', apartmentController.getAllApartments);
router.post('/', apartmentController.createApartment);
router.get('/:id', apartmentController.getApartmentById);
router.patch('/:id', apartmentController.updateApartment);
router.delete('/:id', apartmentController.deleteApartment);
router.post('/generate', apartmentController.generateScenarioContext);

export default router; 