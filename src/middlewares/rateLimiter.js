import rateLimit from 'express-rate-limit';
import { config } from '../config/env.config.js';

/**
 * Limitador de tasa para rutas sensibles de autenticación (Login y Register).
 * Previene ataques de fuerza bruta y DDoS.
 * Se desactiva o flexibiliza en entorno de test para no afectar las pruebas automáticas.
 */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: config.env === 'test' ? 1000 : 15, // 15 intentos en producción, 1000 en test
    standardHeaders: true, // Devuelve headers `RateLimit-*`
    legacyHeaders: false, // Deshabilita headers `X-RateLimit-*`
    handler: (req, res) => {
        res.status(429).json({
            status: 'error',
            message: 'Demasiados intentos de acceso desde esta dirección IP. Por favor, reintenta en 15 minutos.'
        });
    }
});
