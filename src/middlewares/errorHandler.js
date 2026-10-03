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
        return res.status(err.statusCode || 400).json({ status: 'error', message: err.message });
    }

    logger.error('[Unhandled Error]', err);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
}
