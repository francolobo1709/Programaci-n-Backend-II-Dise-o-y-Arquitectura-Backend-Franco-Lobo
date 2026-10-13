import { ValidationError } from '../errors/AppError.js';

/**
 * Middleware factory de validación con Zod.
 * Recibe un schema de Zod, valida req.body y corta el flujo con ValidationError (400)
 * centralizado si los datos no son válidos. Si pasan, reemplaza req.body con los
 * datos parseados/coercionados por Zod.
 *
 * @param {import('zod').ZodTypeAny} schema
 */
export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const details = result.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(' | ');
        return next(new ValidationError('Datos inválidos.', details));
    }
    req.body = result.data;
    next();
};
