import { ticketsRepository } from '../repositories/tickets.repository.js';
import { eventsRepository } from '../repositories/events.repository.js';
import { AppError, NotFoundError, UnauthorizedError } from '../errors/AppError.js';
import { assertValidId } from '../repositories/repository.utils.js';
import { sendTicketEmail } from '../utils/mailer.js';

export const ticketsService = {
    async create(userId, userEmail, eventId, quantityStr) {
        assertValidId(userId);
        assertValidId(eventId);
        
        const quantity = parseInt(quantityStr, 10);
        if (isNaN(quantity) || quantity <= 0) {
            throw new AppError('La cantidad solicitada debe ser mayor a 0', 400);
        }

        // 1. Validar evento existe
        const event = await eventsRepository.getEventById(eventId);
        if (!event) throw new NotFoundError(eventId, 'Evento');

        // 2. Validar que esté publicado y no haya pasado su fecha
        if (event.status !== 'published') {
            throw new AppError('El evento no está publicado y no acepta inscripciones', 400);
        }
        if (new Date(event.date) < new Date()) {
            throw new AppError('El evento ya ha finalizado', 400);
        }

        // 3. Validar regla de duplicados (una inscripción activa por usuario)
        const activeTicket = await ticketsRepository.getActiveTicketByUserAndEvent(userId, eventId);
        if (activeTicket) {
            throw new AppError('Ya te encuentras inscripto en este evento', 400);
        }

        // 4. Validar cupos
        const occupiedCapacity = await ticketsRepository.getActiveTicketsCountByEvent(eventId);
        const availableCapacity = event.capacity - occupiedCapacity;

        if (availableCapacity < quantity) {
            throw new AppError(`No hay cupo suficiente. Cupos disponibles: ${availableCapacity}`, 400);
        }

        // 5. Crear ticket
        const reservationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        const newTicket = await ticketsRepository.create({
            user: userId,
            event: eventId,
            status: 'confirmed',
            quantity,
            reservationCode
        });

        // 6. Enviar correo (asíncrono, sin await para no bloquear si falla el correo)
        sendTicketEmail(userEmail, event.title, reservationCode, quantity);

        return newTicket;
    },

    async getMyTickets(userId, page = 1, limit = 10) {
        assertValidId(userId);
        return await ticketsRepository.getMyTickets(userId, page, limit);
    },

    async getEventTickets(eventId, organizerId, userRole, page = 1, limit = 10) {
        assertValidId(eventId);
        const event = await eventsRepository.getEventById(eventId);
        if (!event) throw new NotFoundError(eventId, 'Evento');

        // Solo admin o el organizador dueño del evento pueden ver sus tickets
        if (userRole !== 'admin' && String(event.organizer) !== String(organizerId)) {
            throw new UnauthorizedError('No tienes permisos para ver los tickets de este evento ajeno');
        }

        return await ticketsRepository.getEventTickets(eventId, page, limit);
    },

    async cancelTicket(ticketId, userId, userRole) {
        assertValidId(ticketId);
        const ticket = await ticketsRepository.getById(ticketId);
        if (!ticket) throw new NotFoundError(ticketId, 'Ticket');

        if (userRole !== 'admin' && String(ticket.user) !== String(userId)) {
            throw new UnauthorizedError('No tienes permisos para cancelar este ticket');
        }

        if (ticket.status === 'cancelled') {
            throw new AppError('El ticket ya se encuentra cancelado', 400);
        }

        return await ticketsRepository.update(ticketId, {
            status: 'cancelled',
            cancelledAt: new Date()
        });
    }
};
