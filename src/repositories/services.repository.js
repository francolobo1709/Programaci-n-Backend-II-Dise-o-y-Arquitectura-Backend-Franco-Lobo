import { ServiceDAO } from '../dao/services.dao.js';

const dao = new ServiceDAO();

export const serviceRepository = {
    async getAll(options) {
        return dao.findAll(options);
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
};
