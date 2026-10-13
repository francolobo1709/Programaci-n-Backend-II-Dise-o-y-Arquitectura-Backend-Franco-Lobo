import crypto from 'node:crypto';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { config } from './src/config/env.config.js';

globalThis.crypto = crypto;

let mongoServer;

beforeAll(async () => {
    // Inicializa la base de datos en memoria para aislar los tests de MongoDB Atlas
    if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        process.env.MONGO_URL = uri;
        process.env.MONGO_URL_TEST = uri;
        config.mongoUri = uri;
    }
    
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(config.mongoUri);
    }
}, 60000);

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            try {
                await collections[key].deleteMany({});
            } catch (_) {}
        }
        await mongoose.connection.close();
    }
    if (mongoServer) {
        await mongoServer.stop();
        mongoServer = null;
    }
});
