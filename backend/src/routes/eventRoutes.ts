import { Router } from 'express';
import { EventController } from '../controllers/eventController';

const router = Router();

// GET /api/events - Get all events
router.get('/', EventController.getAllEvents);

// GET /api/events/:id - Get single event
router.get('/:id', EventController.getEventById);

// POST /api/events - Create new event
router.post('/', EventController.createEvent);

// PUT /api/events/:id - Update event
router.put('/:id', EventController.updateEvent);

// DELETE /api/events/:id - Delete event
router.delete('/:id', EventController.deleteEvent);

export default router;