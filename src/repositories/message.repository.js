import { MessageDAO } from '../dao/message.dao.js';
import { NotFoundError } from '../errors/AppError.js';
import { assertValidId } from './repository.utils.js';

const dao = new MessageDAO();

export const messageRepository = {
    async getAll() {
        return dao.findAll();
    },

    async getById(id) {
        assertValidId(id);
        const message = await dao.findById(id);
        if (!message) throw new NotFoundError(id, 'Mensaje');
        return message;
    },

    async getByBookingId(bookingId) {
        assertValidId(bookingId);
        return dao.findByBookingId(bookingId);
    },

    async create(data) {
        return dao.create(data);
    },

    async remove(id) {
        assertValidId(id);
        const deleted = await dao.deleteById(id);
        if (!deleted) throw new NotFoundError(id, 'Mensaje');
        return deleted;
    },
};
