import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { initializePassport } from './config/passport.config.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpecs } from './config/swagger.config.js';

import eventsRouter from './routes/events.router.js';
import sessionsRouter from './routes/sessions.router.js';
import servicesRouter from './routes/services.router.js';
import bookingsRouter from './routes/bookings.router.js';
import messagesRouter from './routes/messages.router.js';
import viewsRouter from './routes/views.router.js';
import ticketsRouter from './routes/tickets.router.js';

import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

initializePassport();
app.use(passport.initialize());

app.use('/api/events', eventsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/', viewsRouter);

// Documentación de la API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use(errorHandler);

export { app };
