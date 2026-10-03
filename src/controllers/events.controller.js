import { eventsService } from '../services/events.service.js';
import { EventDTO } from '../dtos/event.dto.js';
import { TicketDTO } from '../dtos/ticket.dto.js';
import { ticketsService } from '../services/tickets.service.js';

export const createEvent = async (req, res, next) => {
    try {
        const event = await eventsService.createEvent(req.body, req.user);
        res.status(201).json({ status: 'success', data: new EventDTO(event) });
    } catch (error) {
        next(error);
    }
};

export const getEvents = async (req, res, next) => {
    try {
        const filters = {
            status: req.query.status,
            category: req.query.category,
            location: req.query.location,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo
        };

        const options = {
            page: req.query.page,
            limit: req.query.limit,
            sort: req.query.sort,
            order: req.query.order
        };

        const result = await eventsService.getEvents(filters, options);
        result.data = result.data.map(event => new EventDTO(event));
        res.status(200).json({ status: 'success', ...result });
    } catch (error) {
        next(error);
    }
};

export const getEventById = async (req, res, next) => {
    try {
        const event = await eventsService.getEventById(req.params.id);
        res.status(200).json({ status: 'success', data: new EventDTO(event) });
    } catch (error) {
        next(error);
    }
};

export const updateEvent = async (req, res, next) => {
    try {
        const event = await eventsService.updateEvent(req.params.id, req.body, req.user);
        res.status(200).json({ status: 'success', data: new EventDTO(event) });
    } catch (error) {
        next(error);
    }
};

export const changeEventStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const event = await eventsService.changeEventStatus(req.params.id, status, req.user);
        res.status(200).json({ status: 'success', data: new EventDTO(event) });
    } catch (error) {
        next(error);
    }
};


export const createTicket = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;
        const userEmail = req.user.email;
        const { quantity = 1 } = req.body;
        
        const ticket = await ticketsService.create(userId, userEmail, eventId, quantity);
        res.status(201).json({ status: 'success', payload: new TicketDTO(ticket) });
    } catch (error) {
        next(error);
    }
};

export const getEventTickets = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const organizerId = req.user.id;
        const userRole = req.user.role;
        const { page = 1, limit = 10 } = req.query;

        const result = await ticketsService.getEventTickets(eventId, organizerId, userRole, page, limit);
        result.docs = result.docs.map(t => new TicketDTO(t));
        res.status(200).json({ status: 'success', payload: result });
    } catch (error) {
        next(error);
    }
};
