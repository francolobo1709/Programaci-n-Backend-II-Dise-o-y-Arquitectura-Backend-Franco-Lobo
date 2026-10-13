import { Router } from 'express';
import { getConnectionState } from '../database/connection.js';
import { config } from '../config/env.config.js';

const router = Router();

/**
 * Health check endpoint para monitorización del sistema y orquestadores (Docker, Kubernetes).
 * Devuelve el estado de la conexión a MongoDB, uptime del proceso y entorno.
 */
router.get('/', (req, res) => {
    const dbStateMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    const stateCode = getConnectionState();
    const isHealthy = stateCode === 1;

    res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'success' : 'error',
        data: {
            uptime: Math.floor(process.uptime()),
            timestamp: new Date().toISOString(),
            environment: config.env,
            database: {
                status: dbStateMap[stateCode] || 'unknown',
                readyState: stateCode
            }
        }
    });
});

export default router;
