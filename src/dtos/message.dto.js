export class MessageDTO {
    constructor(message) {
        this.id = message._id || message.id;
        this.sender = message.sender;
        this.content = message.content;
        this.readAt = message.readAt;
        this.createdAt = message.createdAt;
        this.updatedAt = message.updatedAt;

        if (message.booking && typeof message.booking === 'object' && message.booking._id) {
            this.booking = {
                id: message.booking._id || message.booking.id,
                clientName: message.booking.clientName,
                status: message.booking.status
            };
        } else {
            this.booking = message.booking;
        }
    }
}
