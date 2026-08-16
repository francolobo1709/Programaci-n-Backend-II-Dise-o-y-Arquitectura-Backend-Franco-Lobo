/**
 * Middleware factory de validación con Zod.
 * Recibe un schema de Zod, valida req.body y corta el flujo con 400
 * si los datos no son válidos. Si pasan, reemplaza req.body con los
 * datos parseados/coercionados por Zod.
 *
 * @param {import('zod').ZodTypeAny} schema
 */
export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios' });
    }
    req.body = result.data;
    next();
};
