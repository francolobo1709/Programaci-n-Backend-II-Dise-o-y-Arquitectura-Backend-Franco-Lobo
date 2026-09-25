import { EventModel } from '../models/Event.model.js';

export class EventsDao {
    static async create(eventData) {
        return await EventModel.create(eventData);
    }

    static async getEvents(query, options) {
        return await EventModel.paginate(query, options);
    }

    static async getById(id) {
        return await EventModel.findById(id).populate('organizer', 'first_name last_name email');
    }

    static async update(id, eventData) {
        return await EventModel.findByIdAndUpdate(id, eventData, { new: true });
    }
}