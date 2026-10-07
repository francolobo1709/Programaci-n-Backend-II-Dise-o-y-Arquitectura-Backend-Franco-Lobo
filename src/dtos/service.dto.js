export class ServiceDTO {
    constructor(service) {
        this.id = service._id || service.id;
        this.name = service.name;
        this.description = service.description;
        this.duration = service.duration;
        this.price = service.price;
        this.category = service.category;
        this.available = service.available;
        this.createdAt = service.createdAt;
        this.updatedAt = service.updatedAt;

        if (service.organizer && typeof service.organizer === 'object' && service.organizer._id) {
            this.organizer = {
                id: service.organizer._id || service.organizer.id,
                first_name: service.organizer.first_name,
                last_name: service.organizer.last_name,
                email: service.organizer.email
            };
        } else {
            this.organizer = service.organizer;
        }
    }
}
