import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Events API',
            version: '1.0.0',
            description: 'API para la gestión de eventos e inscripciones.',
        },
    },
    apis: ['./src/docs/**/*.yaml'],
};

export const swaggerSpecs = swaggerJSDoc(swaggerOptions);
