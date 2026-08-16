import { SessionsService } from '../services/sessions.service.js';

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
}
