import { Router } from 'express';
import { SessionsController } from '../controllers/sessions.controller.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../validators/sessions.validators.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';
import passport from 'passport';

const router = Router();

// Custom callback for register to handle errors
const authenticateRegister = (req, res, next) => {
    passport.authenticate('register', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(409).json({ status: 'error', error: info?.message || 'Error en registro' });
        }
        req.user = user;
        next();
    })(req, res, next);
};

// Custom callback for login to match previous responses
const authenticateLogin = (req, res, next) => {
    passport.authenticate('login', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ status: 'error', message: info?.message || 'Credenciales inválidas' });
        }
        req.user = user;
        next();
    })(req, res, next);
};

// POST /api/sessions/register
router.post('/register', validate(registerSchema), authenticateRegister, SessionsController.register);

// POST /api/sessions/login
router.post('/login', validate(loginSchema), authenticateLogin, SessionsController.login);

// GET /api/sessions/current
router.get('/current', requireAuth, SessionsController.current);

// POST /api/sessions/logout
router.post('/logout', requireAuth, SessionsController.logout);

// GET /api/sessions/users
router.get('/users', requireAuth, authorize(['admin']), SessionsController.getAllUsers);

export default router;
