import { SessionsService } from '../services/sessions.service.js';
import { generateToken } from '../utils/jwt.utils.js';

export class SessionsController {
    static async register(req, res, next) {
        try {
            const userPayload = await SessionsService.registerUser(req.body);

            res.status(201).json({
                status: 'success',
                payload: userPayload
            });
        } catch (error) {
            next(error);
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const userPayload = await SessionsService.loginUser(email, password);

            const token = generateToken(userPayload);

            res.cookie('auth_cookie', token, {
                httpOnly: true,
                maxAge: 3600000 // 1 hora
            });

            res.status(200).json({
                status: 'success',
                message: 'Login exitoso'
            });
        } catch (error) {
            next(error);
        }
    }

    static async current(req, res, next) {
        try {
            res.status(200).json({
                status: 'success',
                payload: req.user
            });
        } catch (error) {
            next(error);
        }
    }

    static async logout(req, res, next) {
        try {
            res.clearCookie('auth_cookie');
            res.status(200).json({
                status: 'success',
                message: 'Logout exitoso'
            });
        } catch (error) {
            next(error);
        }
    }
}
