import { Router } from 'express';
import { SessionsController } from '../controllers/sessions.controller.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema } from '../validators/sessions.validators.js';

const router = Router();

// POST /api/sessions/register
router.post('/register', validate(registerSchema), SessionsController.register);

export default router;
