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

const router = Router();

router.post('/', requireAuth, authorize(['user', 'organizer', 'admin']), createEvent);
router.get('/', getEvents);
router.get('/:id', getEventById);
router.put('/:id', requireAuth, updateEvent);
router.patch('/:id/status', requireAuth, changeEventStatus);

// Tickets endpoints en eventos
router.post('/:id/tickets', requireAuth, createTicket);
router.get('/:id/tickets', requireAuth, authorize(['organizer', 'admin']), getEventTickets);

export default router;
