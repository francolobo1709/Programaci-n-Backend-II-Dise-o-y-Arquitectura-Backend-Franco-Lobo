import request from 'supertest';
import { app } from '../app.js';
import mongoose from 'mongoose';
import { connectDB } from '../database/connection.js';
import dns from 'node:dns';

// Forzar el uso de los DNS de Google para evitar bloqueos de red con MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

describe('Testing Events API', () => {

    beforeAll(async () => {
        // Conectar a MongoDB antes de empezar los tests
        await connectDB();
    });

    afterAll(async () => {
        // Desconectar para que Jest pueda finalizar el proceso correctamente
        await mongoose.connection.close();
    });

    describe('GET /api/events', () => {
        it('Debería retornar un listado de eventos con status 200', async () => {
            const response = await request(app).get('/api/events');

            // Verificamos el código de estado HTTP
            expect(response.statusCode).toBe(200);

            // Verificamos el cuerpo de la respuesta
            expect(response.body.status).toBe('success');
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('POST /api/events', () => {
        it('Debería retornar 403 o 401 si se intenta crear un evento sin token de organizador', async () => {
            const newEvent = {
                title: 'Concierto de Rock',
                capacity: 100,
                price: 500,
                date: '2027-10-10T20:00:00'
            };

            const response = await request(app)
                .post('/api/events')
                .send(newEvent);
            // No enviamos .set('Cookie', ['currentUser=...']) intencionalmente

            expect(response.statusCode).toBe(401);
        });
    });
});
