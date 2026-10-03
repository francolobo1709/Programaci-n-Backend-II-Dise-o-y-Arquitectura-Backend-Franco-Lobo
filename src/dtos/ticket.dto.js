export class TicketDTO {
    constructor(ticket) {
        this.id = ticket._id || ticket.id;
        this.reservationCode = ticket.reservationCode;
        this.status = ticket.status;
        this.quantity = ticket.quantity;
        this.createdAt = ticket.createdAt;

        if (ticket.user && typeof ticket.user === 'object' && ticket.user._id) {
            this.user = {
                id: ticket.user._id || ticket.user.id,
                first_name: ticket.user.first_name,
                last_name: ticket.user.last_name,
                email: ticket.user.email
            };
        } else {
            this.user = ticket.user;
        }

        if (ticket.event && typeof ticket.event === 'object' && ticket.event._id) {
            this.event = {
                id: ticket.event._id || ticket.event.id,
                title: ticket.event.title,
                date: ticket.event.date,
                location: ticket.event.location
            };
        } else {
            this.event = ticket.event;
        }
    }
}
