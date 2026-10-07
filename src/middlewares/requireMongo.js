import { getConnectionState } from '../database/connection.js';

/**
 * Middleware que corta con 503 si MongoDB no está disponible.
 * Se usa en el router de messages para no exponer errores internos de Mongoose.
 */
export function requireMongo(req, res, next) {
    if (getConnectionState() !== 1) {
        return res.status(503).json({
            error: 'Servicio no disponible.',
            details: 'La base de datos MongoDB no está conectada. Verificá MONGO_URL y la whitelist de Atlas.',
        });
    }
    next();
}
