import { AppError } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware centralizado de errores.
 * Captura AppError (ValidationError, NotFoundError) y errores inesperados.
 * Debe registrarse como el ÚLTIMO middleware en app.js.
 */
export function errorHandler(err, req, res, next) {
    if (err instanceof AppError || err.statusCode) {
        logger.warning(`[AppError] ${err.message}`);
        return res.status(err.statusCode || 400).json({
            status: 'error',
            message: err.message,
            ...(err.details && { details: err.details })
        });
    }

    if (err.name === 'CastError') {
        logger.warning(`[CastError] ${err.message}`);
        return res.status(400).json({
            status: 'error',
            message: `El id proporcionado '${err.value}' no tiene un formato válido.`
        });
    }

    if (err.code === 11000) {
        logger.warning(`[MongoServerError] Clave duplicada`);
        return res.status(409).json({
            status: 'error',
            message: 'El registro ya existe en el sistema.'
        });
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        logger.warning(`[JWT] ${err.message}`);
        return res.status(401).json({
            status: 'error',
            message: 'Token de autenticación inválido o expirado.'
        });
    }

    logger.error('[Unhandled Error]', err);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
}
