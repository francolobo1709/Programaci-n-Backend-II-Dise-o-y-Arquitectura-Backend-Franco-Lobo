import { TicketModel } from '../models/ticket.model.js';
import mongoose from 'mongoose';

export class TicketDAO {
    async create(ticketData) {
        return await TicketModel.create(ticketData);
    }

    async findById(id) {
        return await TicketModel.findById(id);
    }

    async find(filter, options = {}) {
        return await TicketModel.find(filter, null, options);
    }

    async update(id, ticketData) {
        return await TicketModel.findByIdAndUpdate(id, ticketData, { new: true });
    }

    async getPaginated(filter, options) {
        return await TicketModel.paginate(filter, options);
    }

    async sumQuantity(filter) {
        const matchFilter = { ...filter };
        if (matchFilter.event && typeof matchFilter.event === 'string') {
            matchFilter.event = new mongoose.Types.ObjectId(matchFilter.event);
        }
        
        const result = await TicketModel.aggregate([
            { $match: matchFilter },
            { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } }
        ]);
        return result.length > 0 ? result[0].totalQuantity : 0;
    }
}

export const ticketDAO = new TicketDAO();
