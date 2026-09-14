import { serviceService } from '../services/services.service.js';
import { getIO } from '../config/socket.js';

export const getServices = async (req, res, next) => {
    try {
        const { category, available, page, limit, sortBy, order } = req.query;
        res.json(await serviceService.getAll({ category, available, page, limit, sortBy, order }));
    } catch (err) {
        next(err);
    }
};

export const getServiceById = async (req, res, next) => {
    try {
        res.json(await serviceService.getById(req.params.sid));
    } catch (err) {
        next(err);
    }
};

export const createService = async (req, res, next) => {
    try {
        const serviceData = { ...req.body, organizer: req.user.id };
        const service = await serviceService.create(serviceData);
        // Notifica a todos los clientes conectados sobre el nuevo servicio
        try { getIO().emit('service:created', service); } catch (_) {}
        res.status(201).json({ status: 'success', payload: service });
    } catch (err) {
        next(err);
    }
};

export const updateService = async (req, res, next) => {
    try {
        const service = await serviceService.getById(req.params.sid);
        if (req.user.role === 'organizer' && service.organizer?.toString() !== req.user.id) {
            return res.status(403).json({ status: 'error', message: 'No tenés permisos para modificar este servicio ajeno' });
        }
        res.json({ status: 'success', payload: await serviceService.update(req.params.sid, req.body) });
    } catch (err) {
        next(err);
    }
};

export const deleteService = async (req, res, next) => {
    try {
        const service = await serviceService.getById(req.params.sid);
        if (req.user.role === 'organizer' && service.organizer?.toString() !== req.user.id) {
            return res.status(403).json({ status: 'error', message: 'No tenés permisos para eliminar este servicio ajeno' });
        }
        res.json({ status: 'success', payload: await serviceService.remove(req.params.sid) });
    } catch (err) {
        next(err);
    }
};
