import { Router } from 'express';
import { 
    createEvent, 
    getEvents, 
    getEventById, 
    updateEvent, 
    changeEventStatus,
    createTicket,
    getEventTickets
} from '../controllers/events.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';
import { validate } from '../middlewares/validate.js';
import { createEventSchema, updateEventSchema, updateEventStatusSchema } from '../validators/event.validators.js';

const router = Router();

router.post('/', requireAuth, authorize(['organizer', 'admin']), validate(createEventSchema), createEvent);
router.get('/', getEvents);
router.get('/:id', getEventById);
router.put('/:id', requireAuth, validate(updateEventSchema), updateEvent);
router.patch('/:id/status', requireAuth, validate(updateEventStatusSchema), changeEventStatus);

// Tickets endpoints en eventos
router.post('/:id/tickets', requireAuth, createTicket);
router.get('/:id/tickets', requireAuth, authorize(['organizer', 'admin']), getEventTickets);

export default router;
