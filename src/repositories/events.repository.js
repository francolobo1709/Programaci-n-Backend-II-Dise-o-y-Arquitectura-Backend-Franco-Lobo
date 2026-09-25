import { EventsDao } from '../dao/events.dao.js';
import { AppError } from '../errors/AppError.js';

class EventsRepository {
    async createEvent(eventData) {
        try {
            return await EventsDao.create(eventData);
        } catch (error) {
            throw new AppError('Error al crear evento en la base de datos', 500, error.message);
        }
    }

    async getEvents(query, options) {
        try {
            return await EventsDao.getEvents(query, options);
        } catch (error) {
            throw new AppError('Error al obtener eventos', 500, error.message);
        }
    }

    async getEventById(id) {
        try {
            return await EventsDao.getById(id);
        } catch (error) {
            throw new AppError('Error al obtener evento', 500, error.message);
        }
    }

    async updateEvent(id, eventData) {
        try {
            return await EventsDao.update(id, eventData);
        } catch (error) {
            throw new AppError('Error al actualizar evento', 500, error.message);
        }
    }
}

export const eventsRepository = new EventsRepository();
