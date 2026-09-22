import { eventsService } from '../services/events.service.js';

export const createEvent = async (req, res, next) => {
    try {
        const event = await eventsService.createEvent(req.body, req.user);
        res.status(201).json({ status: 'success', data: event });
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
            sort: req.query.sort
        };

        const result = await eventsService.getEvents(filters, options);
        res.status(200).json({ status: 'success', ...result });
    } catch (error) {
        next(error);
    }
};

export const getEventById = async (req, res, next) => {
    try {
        const event = await eventsService.getEventById(req.params.id);
        res.status(200).json({ status: 'success', data: event });
    } catch (error) {
        next(error);
    }
};

export const updateEvent = async (req, res, next) => {
    try {
        const event = await eventsService.updateEvent(req.params.id, req.body, req.user);
        res.status(200).json({ status: 'success', data: event });
    } catch (error) {
        next(error);
    }
};

export const changeEventStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const event = await eventsService.changeEventStatus(req.params.id, status, req.user);
        res.status(200).json({ status: 'success', data: event });
    } catch (error) {
        next(error);
    }
};
