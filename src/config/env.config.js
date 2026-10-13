import dotenv from 'dotenv';

dotenv.config();

const requiredEnvs = ['PORT', 'NODE_ENV', 'MONGO_URL', 'JWT_SECRET'];

requiredEnvs.forEach((envVar) => {
    if (!process.env[envVar]) {
        console.error(`❌ Error crítico: Falta la variable de entorno obligatoria '${envVar}'. Revisa tu archivo .env.`);
        process.exit(1);
    }
});

export const config = {
    port: process.env.PORT,
    env: process.env.NODE_ENV,
    mongoUri: process.env.NODE_ENV === 'test'
        ? (process.env.MONGO_URL_TEST || process.env.MONGO_URL)
        : process.env.MONGO_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    mail: {
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.MAIL_PORT, 10) || 587,
        user: process.env.MAIL_USER || '',
        pass: process.env.MAIL_PASS || '',
        from: process.env.MAIL_FROM || '"API Eventos" <no-reply@eventos.com>'
    }
};
