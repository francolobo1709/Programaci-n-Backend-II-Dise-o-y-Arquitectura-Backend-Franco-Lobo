export class EventInputDTO {
    constructor(data = {}) {
        this.title = data.title;
        this.description = data.description;
        this.date = data.date;
        this.location = data.location;
        this.capacity = data.capacity !== undefined ? Number(data.capacity) : undefined;
        this.price = data.price !== undefined ? Number(data.price) : undefined;
        this.category = data.category;
    }

    toPayload() {
        const payload = {
            title: this.title,
            description: this.description,
            date: this.date,
            location: this.location,
            capacity: this.capacity,
            price: this.price,
            category: this.category
        };
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
        return payload;
    }
}

export class EventResponseDTO {
    constructor(event) {
        this.id = event._id || event.id;
        this.title = event.title;
        this.description = event.description;
        this.date = event.date;
        this.location = event.location;
        this.capacity = event.capacity;
        this.price = event.price;
        this.status = event.status;
        this.category = event.category;

        if (event.organizer && typeof event.organizer === 'object' && (event.organizer._id || event.organizer.id)) {
            this.organizer = {
                id: event.organizer._id || event.organizer.id,
                first_name: event.organizer.first_name,
                last_name: event.organizer.last_name,
                email: event.organizer.email
            };
        } else {
            this.organizer = event.organizer;
        }
    }
}

// Retrocompatibilidad
export const EventDTO = EventResponseDTO;
