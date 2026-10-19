import request from 'supertest';
import { app } from '../app.js';
import mongoose from 'mongoose';
import { connectDB } from '../database/connection.js';

describe('Testing Tickets & Cupos Flow (Isolated)', () => {
    let organizerCookie = '';
    let userCookie1 = '';
    let userCookie2 = '';
    let testEventId = '';
    let createdTicketId = '';

    beforeAll(async () => {
        await connectDB();

        // 1. Registro y login de organizador
        const organizerData = {
            first_name: 'Organizador',
            last_name: 'Test',
            email: `organizer_${Date.now()}@mail.com`,
            password: 'password123'
        };

        await request(app).post('/api/sessions/register').send(organizerData);

        // Actualizamos rol a organizer en la BD
        await mongoose.connection.collection('users').updateOne(
            { email: organizerData.email },
            { $set: { role: 'organizer' } }
        );

        const loginOrgRes = await request(app).post('/api/sessions/login').send({
            email: organizerData.email,
            password: organizerData.password
        });
        organizerCookie = loginOrgRes.headers['set-cookie'][0];

        // 2. Registro y login de dos usuarios clientes
        const user1Data = {
            first_name: 'Cliente',
            last_name: 'Uno',
            email: `cliente1_${Date.now()}@mail.com`,
            password: 'password123'
        };
        await request(app).post('/api/sessions/register').send(user1Data);
        const loginUser1Res = await request(app).post('/api/sessions/login').send({
            email: user1Data.email,
            password: user1Data.password
        });
        userCookie1 = loginUser1Res.headers['set-cookie'][0];

        const user2Data = {
            first_name: 'Cliente',
            last_name: 'Dos',
            email: `cliente2_${Date.now()}@mail.com`,
            password: 'password123'
        };
        await request(app).post('/api/sessions/register').send(user2Data);
        const loginUser2Res = await request(app).post('/api/sessions/login').send({
            email: user2Data.email,
            password: user2Data.password
        });
        userCookie2 = loginUser2Res.headers['set-cookie'][0];

        // 3. Crear evento publicado con capacidad = 2 para probar control de cupos
        const eventRes = await request(app)
            .post('/api/events')
            .set('Cookie', organizerCookie)
            .send({
                title: 'Conferencia de Arquitectura Backend',
                description: 'Evento con cupo limitado a 2 personas',
                category: 'tecnologia',
                date: '2028-12-01T15:00:00.000Z',
                location: 'Auditorio Central',
                capacity: 2,
                price: 1500
            });

        testEventId = eventRes.body.data.id;

        // Publicar evento
        await request(app)
            .patch(`/api/events/${testEventId}/status`)
            .set('Cookie', organizerCookie)
            .send({ status: 'published' });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('Flujo de Inscripción, Cupos y Tickets', () => {
        it('1. Usuario 1 se inscribe exitosamente al evento (Cupo 1/2)', async () => {
            const res = await request(app)
                .post(`/api/events/${testEventId}/tickets`)
                .set('Cookie', userCookie1)
                .send({ quantity: 1 });

            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.payload).toHaveProperty('reservationCode');
            expect(res.body.payload.status).toBe('confirmed');
            createdTicketId = res.body.payload.id;
        });

        it('2. Usuario 1 no puede inscribirse duplicado al mismo evento (409 Conflict)', async () => {
            const res = await request(app)
                .post(`/api/events/${testEventId}/tickets`)
                .set('Cookie', userCookie1)
                .send({ quantity: 1 });

            expect(res.statusCode).toBe(409);
            expect(res.body.status).toBe('error');
        });

        it('3. Usuario 1 puede consultar sus tickets mediante GET /api/tickets/my-tickets', async () => {
            const res = await request(app)
                .get('/api/tickets/my-tickets')
                .set('Cookie', userCookie1);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(Array.isArray(res.body.payload.docs)).toBe(true);
            expect(res.body.payload.docs.length).toBeGreaterThanOrEqual(1);
        });

        it('4. Usuario 2 se inscribe consumiendo el último cupo (Cupo 2/2)', async () => {
            const res = await request(app)
                .post(`/api/events/${testEventId}/tickets`)
                .set('Cookie', userCookie2)
                .send({ quantity: 1 });

            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('success');
        });

        it('5. Intento de inscripción cuando el cupo está agotado retorna 400', async () => {
            // Creamos un tercer usuario para verificar que se rechaza por falta de cupo
            const user3Data = {
                first_name: 'Cliente',
                last_name: 'Tres',
                email: `cliente3_${Date.now()}@mail.com`,
                password: 'password123'
            };
            await request(app).post('/api/sessions/register').send(user3Data);
            const loginUser3Res = await request(app).post('/api/sessions/login').send({
                email: user3Data.email,
                password: user3Data.password
            });
            const userCookie3 = loginUser3Res.headers['set-cookie'][0];

            const res = await request(app)
                .post(`/api/events/${testEventId}/tickets`)
                .set('Cookie', userCookie3)
                .send({ quantity: 1 });

            expect(res.statusCode).toBe(400);
            expect(res.body.status).toBe('error');
            expect(res.body.message).toMatch(/cupo/i);
        });

        it('6. Usuario 1 cancela su ticket (soft delete) y se libera el cupo', async () => {
            const res = await request(app)
                .patch(`/api/tickets/${createdTicketId}/cancel`)
                .set('Cookie', userCookie1);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.payload.status).toBe('cancelled');
        });
    });
});
