import { eventsRepository } from '../repositories/events.repository.js';
import { AppError, ValidationError, NotFoundError } from '../errors/AppError.js';

class EventsService {
    async createEvent(eventData, user) {
        const eventDate = new Date(eventData.date);
        if (eventDate <= new Date()) {
            throw new ValidationError('No se puede crear un evento en una fecha pasada');
        }

        if (eventData.capacity <= 0) {
            throw new ValidationError('La capacidad debe ser mayor a 0');
        }

        if (eventData.price < 0) {
            throw new ValidationError('El precio no puede ser negativo');
        }

        // Se asigna automáticamente el organizador
        eventData.organizer = user.id;

        return await eventsRepository.createEvent(eventData);
    }

    async getEvents(filters, options) {
        const paginateOptions = {
            page: parseInt(options.page) || 1,
            limit: parseInt(options.limit) || 10,
            sort: options.sort || 'createdAt',
            order: options.order || 'desc'
        };

        const result = await eventsRepository.getEvents(filters, paginateOptions);

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
            throw new NotFoundError(id, 'Evento');
        }
        return event;
    }

    async updateEvent(id, eventData, user) {
        const event = await this.getEventById(id);

        if (event.status === 'cancelled') {
            throw new ValidationError('No se puede modificar un evento cancelado');
        }

        // Authorization: Only owner or admin can update
        if (user.role !== 'admin' && event.organizer._id.toString() !== user.id.toString()) {
            throw new AppError('No tienes permiso para modificar este evento', 403);
        }

        if (eventData.date) {
            const eventDate = new Date(eventData.date);
            if (eventDate <= new Date()) {
                throw new ValidationError('La fecha no puede ser en el pasado');
            }
        }

        if (eventData.capacity !== undefined && eventData.capacity <= 0) {
            throw new ValidationError('La capacidad debe ser mayor a 0');
        }

        if (eventData.price !== undefined && eventData.price < 0) {
            throw new ValidationError('El precio no puede ser negativo');
        }

        // Evitar que actualicen el organizador o el status por error/malicia
        delete eventData.organizer;
        delete eventData.status;

        return await eventsRepository.updateEvent(id, eventData);
    }

    async changeEventStatus(id, newStatus, user) {
        const event = await this.getEventById(id);

        if (event.status === 'cancelled') {
            throw new ValidationError('No se puede cambiar el estado de un evento cancelado');
        }

        if (newStatus === 'published' && event.status === 'finished') {
            throw new ValidationError('No se puede publicar un evento que ya finalizó');
        }

        if (user.role !== 'admin' && event.organizer._id.toString() !== user.id.toString()) {
            throw new AppError('No tienes permiso para modificar este evento', 403);
        }

        return await eventsRepository.updateEvent(id, { status: newStatus });
    }
}

export const eventsService = new EventsService();
