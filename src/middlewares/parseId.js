import { ValidationError } from '../errors/AppError.js';

/**
 * Middleware que valida que el param de ID sea un string no vacío.
 * Soporta :id, :sid (services) y :bid (bookings).
 * Expone `req.parsedId` (string) para los handlers que lo necesiten.
 */
export function parseId(req, res, next) {
    const raw = req.params.id ?? req.params.sid ?? req.params.bid;

    if (!raw || typeof raw !== 'string') {
        return next(new ValidationError('El id proporcionado no es válido.'));
    }

    req.parsedId = raw;
    next();
}
