import { ValidationError } from '../errors/AppError.js';

/**
 * Valida si un identificador cumple con el formato estándar de 24 caracteres hexadecimales.
 * Se desacopla de la librería Mongoose para preservar la independencia de la capa Repository.
 * @param {string} id
 */
export function assertValidId(id) {
    const isValidFormat = typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
    if (!id || !isValidFormat) {
        throw new ValidationError(`El id '${id}' no es un identificador válido.`);
    }
}
