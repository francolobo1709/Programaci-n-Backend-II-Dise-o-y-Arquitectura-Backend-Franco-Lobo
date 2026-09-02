import { BookingDAO } from '../dao/bookings.dao.js';

const dao = new BookingDAO();

export const bookingRepository = {
    async getAll() {
        return dao.findAll();
    },

    async getById(id) {
        return dao.findById(id);
    },

    async create(data) {
        return dao.create(data);
    },

    async update(id, data) {
        return dao.updateById(id, data);
    },

    async remove(id) {
        return dao.deleteById(id);
    },

    async addService(bookingId, serviceId, quantity = 1) {
        return dao.addService(bookingId, serviceId, quantity);
    },

    async updateServiceQuantity(bookingId, serviceId, quantity) {
        return dao.updateServiceQuantity(bookingId, serviceId, quantity);
    },

    async removeService(bookingId, serviceId) {
        return dao.removeService(bookingId, serviceId);
    },

    async clearServices(bookingId) {
        return dao.clearServices(bookingId);
    },
};
