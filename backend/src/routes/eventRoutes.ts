import { Router } from 'express';
import { EventController } from '../controllers/eventController';

export class EventRoutes {
  constructor(private eventController: EventController) {}

  getRoutes(): Router {
    const router = Router();

    // GET /api/events - Get all events with search and filter capabilities
    router.get('/', this.eventController.getAllEvents.bind(this.eventController));

    // GET /api/events/search?q=query - Search events
    router.get('/search', this.eventController.searchEvents.bind(this.eventController));

    // GET /api/events/filter/date?start=date&end=date - Filter by date range
    router.get('/filter/date', this.eventController.getEventsByDateRange.bind(this.eventController));

    // GET /api/events/filter/location?location=location - Filter by location
    router.get('/filter/location', this.eventController.getEventsByLocation.bind(this.eventController));

    // GET /api/events/filter/tags?tags=id1,id2,id3 - Filter by tags
    router.get('/filter/tags', this.eventController.getEventsByTags.bind(this.eventController));

    // GET /api/events/:id - Get single event
    router.get('/:id', this.eventController.getEventById.bind(this.eventController));

    // POST /api/events - Create new event
    router.post('/', this.eventController.createEvent.bind(this.eventController));

    // PUT /api/events/:id - Update event
    router.put('/:id', this.eventController.updateEvent.bind(this.eventController));

    // DELETE /api/events/:id - Delete event
    router.delete('/:id', this.eventController.deleteEvent.bind(this.eventController));

    // POST /api/events/:id/tags - Add tag to event
    router.post('/:id/tags', this.eventController.addTagToEvent.bind(this.eventController));

    // DELETE /api/events/:id/tags/:tagId - Remove tag from event
    router.delete('/:id/tags/:tagId', this.eventController.removeTagFromEvent.bind(this.eventController));

    // POST /api/events/:id/participants - Add participant to event
    router.post('/:id/participants', this.eventController.addParticipantToEvent.bind(this.eventController));

    // DELETE /api/events/:id/participants/:participantId - Remove participant from event
    router.delete('/:id/participants/:participantId', this.eventController.removeParticipantFromEvent.bind(this.eventController));

    return router;
  }
}