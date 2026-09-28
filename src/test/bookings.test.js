import request from 'supertest';
import { app } from '../app.js';
import mongoose from 'mongoose';
import { connectDB } from '../database/connection.js';
import dns from 'node:dns';

// Forzar el uso de los DNS de Google para evitar bloqueos
dns.setServers(['8.8.8.8', '8.8.4.4']);

describe('Testing Bookings API', () => {
    let testBookingId;

    beforeAll(async () => {
        await connectDB();
        
        // Creamos una reserva de prueba
        const result = await mongoose.connection.collection('bookings').insertOne({
            clientName: 'Cliente Test Jest',
            clientEmail: 'cliente_test@mail.com',
            date: new Date(),
            services: [],
            total: 0,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        testBookingId = result.insertedId;
    });

    afterAll(async () => {
        // Limpiamos la base de datos borrando la reserva que creamos
        if (testBookingId) {
            await mongoose.connection.collection('bookings').deleteOne({ _id: testBookingId });
        }
        await mongoose.connection.close();
    });

    describe('GET /api/bookings', () => {
        it('Debería retornar un listado paginado de reservas con status 200', async () => {
            const res = await request(app).get('/api/bookings');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('GET /api/bookings/:bid', () => {
        it('Debería retornar la reserva si el ID existe', async () => {
            const res = await request(app).get(`/api/bookings/${testBookingId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('clientEmail', 'cliente_test@mail.com');
        });

        it('Debería retornar 404 si el ID no existe', async () => {
            const res = await request(app).get('/api/bookings/65d1a123f1234567890abcde');
            expect(res.statusCode).toBe(404);
        });
    });

    describe('POST /api/bookings', () => {
        // En algunas configuraciones las reservas pueden ser creadas públicamente
        // o requerir sesión. Si asumes que fallará sin auth, este test lo comprobará.
        it('Validar el formato de fecha para la creación', async () => {
            const newBooking = {
                clientName: 'Juan Pérez',
                clientEmail: 'juan@mail.com',
                date: 'fecha_invalida'
            };

            const res = await request(app).post('/api/bookings').send(newBooking);
            
            // Suponiendo validación por Zod, debería tirar 400
            expect(res.statusCode).toBe(400); 
        });
    });
});
