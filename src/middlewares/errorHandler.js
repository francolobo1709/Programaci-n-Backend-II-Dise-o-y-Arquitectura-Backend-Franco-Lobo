import { AppError } from '../errors/AppError.js';

/**
 * Middleware centralizado de errores.
 * Captura AppError (ValidationError, NotFoundError) y errores inesperados.
 * Debe registrarse como el ÚLTIMO middleware en app.js.
 */
export function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ status: 'error', message: err.message });
    }

    console.error('[Unhandled Error]', err);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
}
