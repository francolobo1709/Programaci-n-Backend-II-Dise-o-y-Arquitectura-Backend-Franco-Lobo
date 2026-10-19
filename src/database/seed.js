import { connectDB } from './connection.js';
import { UsersDao } from '../dao/users.dao.js';
import { createHash } from '../utils/hash.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';

export async function seedUsers() {
    await connectDB();

    const users = [
        {
            first_name: 'Organizador',
            last_name: 'Oficial',
            email: 'organizador@events.com',
            password: createHash('password123'),
            role: 'organizer'
        },
        {
            first_name: 'Administrador',
            last_name: 'Sistema',
            email: 'admin@events.com',
            password: createHash('admin123'),
            role: 'admin'
        },
        {
            first_name: 'Cliente',
            last_name: 'Prueba',
            email: 'cliente@events.com',
            password: createHash('password123'),
            role: 'user'
        }
    ];

    for (const u of users) {
        const existing = await UsersDao.findByEmail(u.email);
        if (!existing) {
            await UsersDao.create(u);
            logger.info(`✅ Usuario de prueba creado: ${u.email} (Rol: ${u.role})`);
        } else {
            logger.info(`ℹ️ Usuario ya existente: ${u.email} (Rol: ${existing.role})`);
        }
    }
}

// Ejecución directa mediante npm run seed
if (process.argv[1]?.replace(/\\/g, '/').endsWith('src/database/seed.js')) {
    seedUsers()
        .then(async () => {
            logger.info('🎉 Seed finalizado exitosamente.');
            await mongoose.connection.close();
            process.exit(0);
        })
        .catch((err) => {
            logger.error(`❌ Error en seed: ${err.message}`);
            process.exit(1);
        });
}
