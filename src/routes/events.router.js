import { Router } from 'express';
import { 
    createEvent, 
    getEvents, 
    getEventById, 
    updateEvent, 
    changeEventStatus 
} from '../controllers/events.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';

const router = Router();

router.post('/', requireAuth, authorize(['organizer', 'admin']), createEvent);
router.get('/', getEvents);
router.get('/:id', getEventById);
router.put('/:id', requireAuth, updateEvent);
router.patch('/:id/status', requireAuth, changeEventStatus);

export default router;
