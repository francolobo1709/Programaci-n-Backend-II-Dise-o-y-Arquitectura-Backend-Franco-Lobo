import { generateToken } from '../utils/jwt.utils.js';

export class SessionsController {
    static async register(req, res, next) {
        try {
            res.status(201).json({
                status: 'success',
                payload: req.user
            });
        } catch (error) {
            next(error);
        }
    }

    static async login(req, res, next) {
        try {
            const userPayload = req.user;

            const token = generateToken(userPayload);

            res.cookie('currentUser', token, {
                httpOnly: true,
                maxAge: 3600000 // 1 hora
            });

            res.status(200).json({
                status: 'success',
                message: 'Login correcto'
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
            res.clearCookie('currentUser');
            res.status(200).json({
                status: 'success',
                message: 'Logout exitoso'
            });
        } catch (error) {
            next(error);
        }
    }
}
