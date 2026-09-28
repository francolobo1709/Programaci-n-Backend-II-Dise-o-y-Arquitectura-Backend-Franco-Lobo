import { ticketDAO } from '../daos/ticket.dao.js';

export class TicketsRepository {
    async create(ticketData) {
        return await ticketDAO.create(ticketData);
    }

    async getById(id) {
        return await ticketDAO.findById(id);
    }

    async update(id, ticketData) {
        return await ticketDAO.update(id, ticketData);
    }

    async getMyTickets(userId, page, limit) {
        const options = {
            page,
            limit,
            sort: { createdAt: -1 },
            populate: { path: 'event', select: 'title date location' }
        };
        return await ticketDAO.getPaginated({ user: userId }, options);
    }

    async getEventTickets(eventId, page, limit) {
        const options = {
            page,
            limit,
            sort: { createdAt: -1 },
            populate: { path: 'user', select: 'first_name last_name email' }
        };
        return await ticketDAO.getPaginated({ event: eventId }, options);
    }

    async getActiveTicketsCountByEvent(eventId) {
        // Solo contamos tickets confirmados (o pending si lo hubiere) que no están cancelados
        return await ticketDAO.sumQuantity({ event: eventId, status: { $ne: 'cancelled' } });
    }

    async getActiveTicketByUserAndEvent(userId, eventId) {
        const tickets = await ticketDAO.find({ user: userId, event: eventId, status: { $ne: 'cancelled' } });
        return tickets.length > 0 ? tickets[0] : null;
    }
}

export const ticketsRepository = new TicketsRepository();
