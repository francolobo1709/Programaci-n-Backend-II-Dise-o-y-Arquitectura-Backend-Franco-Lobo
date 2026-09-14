import { Router } from 'express';
import * as servicesController from '../controllers/services.controller.js';
import { validate } from '../middlewares/validate.js';
import { createServiceSchema, updateServiceSchema } from '../validators/service.validators.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';

const router = Router();

// GET /api/services  — filtros, paginación y ordenamiento via query params
router.get('/',       servicesController.getServices);

// GET /api/services/:sid
router.get('/:sid',   servicesController.getServiceById);

// POST /api/services
router.post('/',      requireAuth, authorize(['organizer', 'admin']), validate(createServiceSchema), servicesController.createService);

// PUT /api/services/:sid
router.put('/:sid',   requireAuth, authorize(['organizer', 'admin']), validate(updateServiceSchema), servicesController.updateService);

// DELETE /api/services/:sid
router.delete('/:sid', requireAuth, authorize(['organizer', 'admin']), servicesController.deleteService);

export default router;
