import { createServer } from 'node:http';
import dns from 'node:dns';

// Forzar el uso de los DNS de Google para evitar bloqueos de red con MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

import { app } from './app.js';
import { config } from './config/env.config.js';
import { connectDB } from './database/connection.js';
import { initSocket } from './config/socket.js';
import { logger } from './utils/logger.js';

const httpServer = createServer(app);
const io = initSocket(httpServer);

io.on('connection', (socket) => {
    logger.debug(`🔌 Cliente Socket.io conectado: ${socket.id}`);
    socket.on('disconnect', () => {
        logger.debug(`❌ Cliente Socket.io desconectado: ${socket.id}`);
    });
});

connectDB()
    .then(() => {
        httpServer.listen(config.port, () => {
            logger.info(`🚀 API corriendo en modo: ${config.env}`);
            logger.info(`📡 Servidor escuchando en http://localhost:${config.port}`);
        });
    })
    .catch((err) => {
        logger.error(`❌ No se pudo conectar a MongoDB: ${err.message}`);
        process.exit(1);
    });