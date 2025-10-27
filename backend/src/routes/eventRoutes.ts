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

// POST /api/events/:id/tags - Add tag to event
router.post('/:id/tags', EventController.addTagToEvent);

// DELETE /api/events/:id/tags/:tagId - Remove tag from event
router.delete('/:id/tags/:tagId', EventController.removeTagFromEvent);

// POST /api/events/:id/participants - Add participant to event
router.post('/:id/participants', EventController.addParticipantToEvent);

// DELETE /api/events/:id/participants/:participantId - Remove participant from event
router.delete('/:id/participants/:participantId', EventController.removeParticipantFromEvent);

export default router;