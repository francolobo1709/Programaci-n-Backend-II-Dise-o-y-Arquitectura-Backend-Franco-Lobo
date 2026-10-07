export class BookingDTO {
    constructor(booking) {
        this.id = booking._id || booking.id;
        this.clientName = booking.clientName;
        this.clientEmail = booking.clientEmail;
        this.date = booking.date;
        this.status = booking.status;
        this.createdAt = booking.createdAt;
        this.updatedAt = booking.updatedAt;

        if (Array.isArray(booking.services)) {
            this.services = booking.services.map(s => {
                if (s.service && typeof s.service === 'object' && s.service._id) {
                    return {
                        service: {
                            id: s.service._id || s.service.id,
                            name: s.service.name,
                            category: s.service.category,
                            price: s.service.price
                        },
                        quantity: s.quantity
                    };
                }
                return {
                    service: s.service,
                    quantity: s.quantity
                };
            });
        } else {
            this.services = booking.services;
        }
    }
}
