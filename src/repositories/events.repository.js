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

    async getEvents(filters = {}, options = {}) {
        try {
            const query = {};
            if (filters.status) query.status = filters.status;
            if (filters.category) query.category = filters.category;
            if (filters.location) query.location = { $regex: filters.location, $options: 'i' };

            if (filters.dateFrom || filters.dateTo) {
                query.date = {};
                if (filters.dateFrom) query.date.$gte = new Date(filters.dateFrom);
                if (filters.dateTo) query.date.$lte = new Date(filters.dateTo);
            }

            const paginateOptions = {
                page: options.page || 1,
                limit: options.limit || 10,
                sort: options.sort ? { [options.sort]: options.order === 'desc' ? -1 : 1 } : { createdAt: -1 },
                populate: { path: 'organizer', select: 'first_name last_name email' }
            };

            return await EventsDao.getEvents(query, paginateOptions);
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
