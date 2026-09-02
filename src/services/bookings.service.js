import { bookingRepository } from '../repositories/bookings.repository.js';
import { serviceRepository } from '../repositories/services.repository.js';
import { NotFoundError } from '../errors/AppError.js';
import { assertValidId } from '../repositories/repository.utils.js';

export const bookingService = {
    async getAll() {
        return bookingRepository.getAll();
    },

    async getById(id) {
        assertValidId(id);
        const booking = await bookingRepository.getById(id);
        if (!booking) throw new NotFoundError(id, 'Reserva');
        return booking;
    },

    async create(data) {
        return bookingRepository.create(data);
    },

    async update(id, data) {
        assertValidId(id);
        const updated = await bookingRepository.update(id, data);
        if (!updated) throw new NotFoundError(id, 'Reserva');
        return updated;
    },

    async remove(id) {
        assertValidId(id);
        const deleted = await bookingRepository.remove(id);
        if (!deleted) throw new NotFoundError(id, 'Reserva');
        return deleted;
    },

    async addService(bookingId, serviceId, quantity = 1) {
        assertValidId(bookingId);
        assertValidId(serviceId);

        await serviceRepository.getById(serviceId);

        const booking = await bookingService.getById(bookingId);

        // Compara como string para soportar ObjectId populado o sin popularfar
        const existing = booking.services.find(
            (s) => String(s.service?._id ?? s.service) === String(serviceId)
        );

        if (existing) {
            const updated = await bookingRepository.updateServiceQuantity(
                bookingId,
                serviceId,
                existing.quantity + quantity
            );
            if (!updated) throw new NotFoundError(bookingId, 'Reserva');
            return updated;
        }

        const updated = await bookingRepository.addService(bookingId, serviceId, quantity);
        if (!updated) throw new NotFoundError(bookingId, 'Reserva');
        return updated;
    },

    async removeService(bookingId, serviceId) {
        assertValidId(bookingId);
        assertValidId(serviceId);
        const updated = await bookingRepository.removeService(bookingId, serviceId);
        if (!updated) throw new NotFoundError(bookingId, 'Reserva');
        return updated;
    },

    async clearServices(bookingId) {
        assertValidId(bookingId);
        const updated = await bookingRepository.clearServices(bookingId);
        if (!updated) throw new NotFoundError(bookingId, 'Reserva');
        return updated;
    },
};
