import { EventModel } from '../models/Event.model.js';

class EventsRepository {
    async createEvent(eventData) {
        return await EventModel.create(eventData);
    }

    async getEvents(query, options) {
        return await EventModel.paginate(query, options);
    }

    async getEventById(id) {
        return await EventModel.findById(id).populate('organizer', 'first_name last_name email');
    }

    async updateEvent(id, eventData) {
        return await EventModel.findByIdAndUpdate(id, eventData, { new: true });
    }
}

export const eventsRepository = new EventsRepository();
