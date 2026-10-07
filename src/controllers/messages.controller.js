import { messageService } from '../services/message.service.js';
import { MessageDTO } from '../dtos/message.dto.js';

export const getMessages = async (req, res, next) => {
    try {
        const messages = await messageService.getAll();
        res.json(messages.map(m => new MessageDTO(m)));
    } catch (err) {
        next(err);
    }
};

export const getMessageById = async (req, res, next) => {
    try {
        const message = await messageService.getById(req.params.mid);
        res.json(new MessageDTO(message));
    } catch (err) {
        next(err);
    }
};

export const getMessagesByBooking = async (req, res, next) => {
    try {
        const messages = await messageService.getByBookingId(req.params.bid);
        res.json(messages.map(m => new MessageDTO(m)));
    } catch (err) {
        next(err);
    }
};

export const createMessage = async (req, res, next) => {
    try {
        const message = await messageService.create(req.body);
        res.status(201).json(new MessageDTO(message));
    } catch (err) {
        next(err);
    }
};

export const deleteMessage = async (req, res, next) => {
    try {
        const deleted = await messageService.remove(req.params.mid);
        res.json(new MessageDTO(deleted));
    } catch (err) {
        next(err);
    }
};
