import jwt from 'jsonwebtoken';
import { config } from '../config/env.config.js';

export const requireAuth = (req, res, next) => {
    const token = req.cookies.currentUser;

    if (!token) {
        return res.status(401).json({ error: 'No autorizado. Token no proporcionado.' });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded; // Adjuntar payload al request
        next();
    } catch (error) {
        return res.status(401).json({ error: 'No autorizado. Token inválido o expirado.' });
    }
};
