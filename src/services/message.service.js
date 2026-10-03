import { messageRepository } from '../repositories/message.repository.js';
import { bookingRepository } from '../repositories/bookings.repository.js';
import { ValidationError } from '../errors/AppError.js';
import { getIO } from '../config/socket.js';

const REQUIRED_FIELDS = ['booking', 'sender', 'content'];

function validate(data) {
    const missing = REQUIRED_FIELDS.filter(
        (f) => data[f] === undefined || data[f] === null || data[f] === ''
    );
    if (missing.length > 0) {
        throw new ValidationError(`Faltan campos obligatorios: ${missing.join(', ')}.`);
    }
}

export const messageService = {
    getAll: () => messageRepository.getAll(),
    getById: (id) => messageRepository.getById(id),
    getByBookingId: (bookingId) => messageRepository.getByBookingId(bookingId),
    async create(data) {
        validate(data);
        // Verifica que la reserva exista antes de asociar el mensaje
        await bookingRepository.getById(data.booking);
        const newMessage = await messageRepository.create(data);
        
        try {
            const io = getIO();
            io.emit('newMessage', newMessage);
        } catch (error) {
            console.error('Socket.io no está inicializado o hubo un error al emitir:', error.message);
        }
        
        return newMessage;
    },
    remove: (id) => messageRepository.remove(id),
};
