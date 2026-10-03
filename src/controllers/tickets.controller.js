import { ticketsService } from '../services/tickets.service.js';
import { TicketDTO } from '../dtos/ticket.dto.js';

export const getMyTickets = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user.id;
        const result = await ticketsService.getMyTickets(userId, page, limit);
        result.docs = result.docs.map(t => new TicketDTO(t));
        res.status(200).json({ status: 'success', payload: result });
    } catch (error) {
        next(error);
    }
};

export const cancelTicket = async (req, res, next) => {
    try {
        const ticketId = req.params.tid;
        const userId = req.user.id;
        const userRole = req.user.role;
        const result = await ticketsService.cancelTicket(ticketId, userId, userRole);
        res.status(200).json({ status: 'success', payload: new TicketDTO(result) });
    } catch (error) {
        next(error);
    }
};
