import mongoose from 'mongoose';
import { config } from '../config/env.config.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

export async function connectDB() {
    if (isConnected) return;
    if (!config.mongoUri) {
        throw new Error('MONGO_URL no está definida en las variables de entorno.');
    }
    await mongoose.connect(config.mongoUri);
    isConnected = true;
    logger.info('✅ MongoDB conectado correctamente.');
}

export function getConnectionState() {
    return mongoose.connection.readyState; // 0=disconnected, 1=connected, 2=connecting
}
