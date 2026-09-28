import request from 'supertest';
import { app } from '../app.js';
import mongoose from 'mongoose';
import { connectDB } from '../database/connection.js';
import dns from 'node:dns';

// Forzar el uso de los DNS de Google para evitar bloqueos de red con MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

describe('Testing Sessions API', () => {

    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        // Limpiamos nuestra "basura" borrando al usuario de prueba antes de cerrar
        await mongoose.connection.collection('users').deleteOne({ email: mockUser.email });
        await mongoose.connection.close();
    });

    // Usaremos un usuario de prueba aleatorio para no chocar con correos existentes
    const mockUser = {
        first_name: 'Test',
        last_name: 'User',
        email: `test_${Date.now()}@mail.com`,
        password: 'password123'
    };

    let sessionCookie = '';

    describe('POST /api/sessions/register', () => {
        it('Debería registrar un usuario correctamente y devolver status 201', async () => {
            const res = await request(app)
                .post('/api/sessions/register')
                .send(mockUser);
            
            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.payload).toHaveProperty('email', mockUser.email);
            expect(res.body.payload).toHaveProperty('role', 'user'); // Se fuerza rol user
        });

        it('Debería retornar error 400 o 401 si el email ya existe o faltan datos (según cómo esté manejado en Passport)', async () => {
            const res = await request(app)
                .post('/api/sessions/register')
                .send(mockUser); // Mandamos el mismo usuario de antes
            
            // Suponemos que el sistema devuelve 400, 401 o 409 al fallar passport register
            expect(res.statusCode).not.toBe(201); 
        });
    });

    describe('POST /api/sessions/login', () => {
        it('Debería loguear al usuario correctamente y devolver la cookie', async () => {
            const res = await request(app)
                .post('/api/sessions/login')
                .send({
                    email: mockUser.email,
                    password: mockUser.password
                });
            
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            
            // Guardamos la cookie que envía el backend para los próximos tests
            const cookies = res.headers['set-cookie'];
            expect(cookies).toBeDefined();
            sessionCookie = cookies[0];
        });

        it('Debería fallar con credenciales incorrectas', async () => {
            const res = await request(app)
                .post('/api/sessions/login')
                .send({
                    email: mockUser.email,
                    password: 'wrongpassword'
                });
            
            expect(res.statusCode).not.toBe(200);
        });
    });

    describe('GET /api/sessions/current', () => {
        it('Debería devolver el payload del usuario si enviamos la cookie válida', async () => {
            const res = await request(app)
                .get('/api/sessions/current')
                .set('Cookie', sessionCookie); // Inyectamos la cookie que guardamos en el login
            
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.payload.email).toBe(mockUser.email);
        });

        it('Debería devolver 401 si intentamos acceder sin la cookie', async () => {
            const res = await request(app).get('/api/sessions/current');
            
            expect(res.statusCode).toBe(401);
        });
    });

    describe('POST /api/sessions/logout', () => {
        it('Debería cerrar la sesión correctamente', async () => {
            const res = await request(app)
                .post('/api/sessions/logout')
                .set('Cookie', sessionCookie);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Logout exitoso');
        });
    });
});
