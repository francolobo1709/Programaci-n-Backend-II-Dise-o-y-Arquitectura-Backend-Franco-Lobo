import { eventsRepository } from '../repositories/events.repository.js';
import { CustomError } from '../errors/CustomError.js';
import { ErrorCodes } from '../errors/errorCodes.js';

class EventsService {
    async createEvent(eventData, user) {
        const eventDate = new Date(eventData.date);
        if (eventDate <= new Date()) {
            throw new CustomError('No se puede crear un evento en una fecha pasada', ErrorCodes.VALIDATION_ERROR, 400);
        }

        if (eventData.capacity <= 0) {
            throw new CustomError('La capacidad debe ser mayor a 0', ErrorCodes.VALIDATION_ERROR, 400);
        }

        if (eventData.price < 0) {
            throw new CustomError('El precio no puede ser negativo', ErrorCodes.VALIDATION_ERROR, 400);
        }

        // Se asigna automáticamente el organizador
        eventData.organizer = user._id;

        return await eventsRepository.createEvent(eventData);
    }

    async getEvents(filters, options) {
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
            page: parseInt(options.page) || 1,
            limit: parseInt(options.limit) || 10,
            sort: options.sort ? { [options.sort]: 1 } : { createdAt: -1 },
            populate: { path: 'organizer', select: 'first_name last_name email' }
        };

        const result = await eventsRepository.getEvents(query, paginateOptions);

        return {
            data: result.docs,
            page: result.page,
            limit: result.limit,
            total: result.totalDocs,
            totalPages: result.totalPages
        };
    }

    async getEventById(id) {
        const event = await eventsRepository.getEventById(id);
        if (!event) {
            throw new CustomError('Evento no encontrado', ErrorCodes.NOT_FOUND, 404);
        }
        return event;
    }

    async updateEvent(id, eventData, user) {
        const event = await this.getEventById(id);

        if (event.status === 'cancelled') {
            throw new CustomError('No se puede modificar un evento cancelado', ErrorCodes.VALIDATION_ERROR, 400);
        }

        // Authorization: Only owner or admin can update
        if (user.role !== 'admin' && event.organizer._id.toString() !== user._id.toString()) {
            throw new CustomError('No tienes permiso para modificar este evento', ErrorCodes.AUTHORIZATION_ERROR, 403);
        }

        if (eventData.date) {
            const eventDate = new Date(eventData.date);
            if (eventDate <= new Date()) {
                throw new CustomError('La fecha no puede ser en el pasado', ErrorCodes.VALIDATION_ERROR, 400);
            }
        }

        if (eventData.capacity !== undefined && eventData.capacity <= 0) {
            throw new CustomError('La capacidad debe ser mayor a 0', ErrorCodes.VALIDATION_ERROR, 400);
        }

        if (eventData.price !== undefined && eventData.price < 0) {
            throw new CustomError('El precio no puede ser negativo', ErrorCodes.VALIDATION_ERROR, 400);
        }

        // Evitar que actualicen el organizador por error/malicia
        delete eventData.organizer;

        return await eventsRepository.updateEvent(id, eventData);
    }

    async changeEventStatus(id, newStatus, user) {
        const event = await this.getEventById(id);

        if (event.status === 'cancelled') {
            throw new CustomError('No se puede cambiar el estado de un evento cancelado', ErrorCodes.VALIDATION_ERROR, 400);
        }

        if (newStatus === 'published' && event.status === 'finished') {
            throw new CustomError('No se puede publicar un evento que ya finalizó', ErrorCodes.VALIDATION_ERROR, 400);
        }

        if (user.role !== 'admin' && event.organizer._id.toString() !== user._id.toString()) {
            throw new CustomError('No tienes permiso para modificar este evento', ErrorCodes.AUTHORIZATION_ERROR, 403);
        }

        return await eventsRepository.updateEvent(id, { status: newStatus });
    }
}

export const eventsService = new EventsService();
