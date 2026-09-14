import { serviceRepository } from '../repositories/services.repository.js';
import { NotFoundError } from '../errors/AppError.js';
import { assertValidId } from '../repositories/repository.utils.js';

export const serviceService = {
    async getAll({ category, available, page, limit, sortBy, order } = {}) {
        const filter = {};
        if (category) filter.category = category.toLowerCase();
        if (available !== undefined && available !== '') {
            filter.available = available === 'true' || available === true;
        }

        const pageNum  = Math.max(1, parseInt(page)  || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const sortField = sortBy || 'createdAt';
        const sortDir   = order === 'desc' ? -1 : 1;

        const { docs, total } = await serviceRepository.getAll({
            filter,
            sort:  { [sortField]: sortDir },
            page:  pageNum,
            limit: limitNum,
        });

        const totalPages = Math.ceil(total / limitNum);
        return {
            data: docs,
            pagination: {
                total,
                page:        pageNum,
                limit:       limitNum,
                totalPages,
                hasPrevPage: pageNum > 1,
                hasNextPage: pageNum < totalPages,
            },
        };
    },

    async getById(id) {
        assertValidId(id);
        const service = await serviceRepository.getById(id);
        if (!service) throw new NotFoundError(id, 'Servicio');
        return service;
    },

    async create(data) {
        return serviceRepository.create(data);
    },

    async update(id, data) {
        assertValidId(id);
        const updated = await serviceRepository.update(id, data);
        if (!updated) throw new NotFoundError(id, 'Servicio');
        return updated;
    },

    async remove(id) {
        assertValidId(id);
        const deleted = await serviceRepository.remove(id);
        if (!deleted) throw new NotFoundError(id, 'Servicio');
        return deleted;
    },
};
