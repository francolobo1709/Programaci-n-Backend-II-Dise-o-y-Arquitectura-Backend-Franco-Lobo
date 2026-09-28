import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const VALID_STATUSES = ['confirmed', 'pending', 'cancelled'];

const ticketSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        status: { type: String, enum: VALID_STATUSES, default: 'confirmed' },
        quantity: { type: Number, required: true, min: 1 },
        reservationCode: { type: String, required: true, unique: true },
        cancelledAt: { type: Date, default: null }
    },
    { timestamps: true }
);

ticketSchema.plugin(mongoosePaginate);

export const TicketModel = mongoose.model('Ticket', ticketSchema);
