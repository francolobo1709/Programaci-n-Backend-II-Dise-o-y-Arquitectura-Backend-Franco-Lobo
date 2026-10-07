import { bookingService } from '../services/bookings.service.js';
import { getIO } from '../config/socket.js';
import { BookingDTO } from '../dtos/booking.dto.js';

export const getBookings = async (req, res, next) => {
    try {
        const bookings = await bookingService.getAll();
        res.json(bookings.map(b => new BookingDTO(b)));
    } catch (err) {
        next(err);
    }
};

export const getBookingById = async (req, res, next) => {
    try {
        const booking = await bookingService.getById(req.params.bid);
        res.json(new BookingDTO(booking));
    } catch (err) {
        next(err);
    }
};

export const createBooking = async (req, res, next) => {
    try {
        const booking = await bookingService.create(req.body);
        try { getIO().emit('booking:created', booking); } catch (_) {}
        res.status(201).json(new BookingDTO(booking));
    } catch (err) {
        next(err);
    }
};

export const updateBooking = async (req, res, next) => {
    try {
        const updated = await bookingService.update(req.params.bid, req.body);
        res.json(new BookingDTO(updated));
    } catch (err) {
        next(err);
    }
};

export const deleteBooking = async (req, res, next) => {
    try {
        const deleted = await bookingService.remove(req.params.bid);
        res.json(new BookingDTO(deleted));
    } catch (err) {
        next(err);
    }
};

// POST /api/bookings/:bid/services/:sid
export const addServiceToBooking = async (req, res, next) => {
    try {
        const { bid, sid } = req.params;
        const quantity = req.body?.quantity ?? 1;
        const updated = await bookingService.addService(bid, sid, quantity);
        res.json(new BookingDTO(updated));
    } catch (err) {
        next(err);
    }
};

// DELETE /api/bookings/:bid/services/:sid
export const removeServiceFromBooking = async (req, res, next) => {
    try {
        const updated = await bookingService.removeService(req.params.bid, req.params.sid);
        res.json(new BookingDTO(updated));
    } catch (err) {
        next(err);
    }
};

// DELETE /api/bookings/:bid/services
export const clearBookingServices = async (req, res, next) => {
    try {
        const updated = await bookingService.clearServices(req.params.bid);
        res.json(new BookingDTO(updated));
    } catch (err) {
        next(err);
    }
};
