import { Router } from 'express';
import { SessionsController } from '../controllers/sessions.controller.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../validators/sessions.validators.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/sessions/register
router.post('/register', validate(registerSchema), SessionsController.register);

// POST /api/sessions/login
router.post('/login', validate(loginSchema), SessionsController.login);

// GET /api/sessions/current
router.get('/current', requireAuth, SessionsController.current);

// POST /api/sessions/logout
router.post('/logout', requireAuth, SessionsController.logout);

export default router;
