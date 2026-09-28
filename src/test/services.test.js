import request from 'supertest';
import { app } from '../app.js';
import mongoose from 'mongoose';
import { connectDB } from '../database/connection.js';
import dns from 'node:dns';

// Forzar el uso de los DNS de Google para evitar bloqueos
dns.setServers(['8.8.8.8', '8.8.4.4']);

describe('Testing Services API', () => {
    let testServiceId;

    beforeAll(async () => {
        await connectDB();
        
        // Creamos un servicio de prueba directamente en la base de datos
        // para asegurar que siempre haya al menos uno y poder probar el GET por ID
        const result = await mongoose.connection.collection('services').insertOne({
            name: 'Servicio de prueba Jest',
            description: 'Un servicio temporal para el test',
            duration: 60,
            price: 1500,
            category: 'test',
            available: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        testServiceId = result.insertedId;
    });

    afterAll(async () => {
        // Limpieza: borramos el servicio de prueba que creamos
        if (testServiceId) {
            await mongoose.connection.collection('services').deleteOne({ _id: testServiceId });
        }
        await mongoose.connection.close();
    });

    describe('GET /api/services', () => {
        it('Debería retornar un listado paginado de servicios con status 200', async () => {
            const res = await request(app).get('/api/services');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('GET /api/services/:sid', () => {
        it('Debería retornar el servicio si el ID existe', async () => {
            const res = await request(app).get(`/api/services/${testServiceId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('name', 'Servicio de prueba Jest');
        });

        it('Debería retornar 404 si el ID no existe', async () => {
            const res = await request(app).get('/api/services/65d1a123f1234567890abcde');
            expect(res.statusCode).toBe(404);
        });
    });

    describe('POST /api/services', () => {
        it('Debería retornar 401 si un usuario sin sesión intenta crear un servicio', async () => {
            const newService = {
                name: 'Servicio Fake',
                description: 'Fake',
                duration: 10,
                price: 100,
                category: 'limpieza',
                available: true
            };

            const res = await request(app).post('/api/services').send(newService);
            expect(res.statusCode).toBe(401);
        });
    });
});
