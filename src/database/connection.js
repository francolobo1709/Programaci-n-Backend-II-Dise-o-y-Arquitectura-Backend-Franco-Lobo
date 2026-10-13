import mongoose from 'mongoose';
import { config } from '../config/env.config.js';
import { logger } from '../utils/logger.js';

export async function connectDB() {
    if (mongoose.connection.readyState === 1) return;
    if (!config.mongoUri) {
        throw new Error('MONGO_URL no está definida en las variables de entorno.');
    }
    await mongoose.connect(config.mongoUri);
    logger.info('✅ MongoDB conectado correctamente.');
}

export function getConnectionState() {
    return mongoose.connection.readyState; // 0=disconnected, 1=connected, 2=connecting
}
