import { EventController } from '../../controllers/eventController';
import { EventRepository } from '../../db/repository/event.repository';
import { RelationshipRepository } from '../../db/repository/relationship.repository';
import { testDb, generateNonExistentUUID } from '../setup';
import { events, tags, participants, eventTags, eventParticipants } from '../../db/schema';
import { CreateEventRequest, UpdateEventRequest } from '../../types/event';
import { NewTag } from '../../types/tag';
import { NewParticipant } from '../../types/participant';
import { eq } from 'drizzle-orm';

// Mock Express Request and Response objects
const createMockRequest = (params: any = {}, body: any = {}, query: any = {}) => ({
  params,
  body,
  query,
  ...params
});

const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('EventController Integration Tests', () => {
  let eventController: EventController;
  let eventRepository: EventRepository;
  let relationshipRepository: RelationshipRepository;

  beforeEach(() => {
    eventRepository = new EventRepository(testDb);
    relationshipRepository = new RelationshipRepository(testDb);
    eventController = new EventController(eventRepository, relationshipRepository);
  });

  describe('getAllEvents', () => {
    beforeEach(async () => {
      // Create test events
      const testEvents = [
        {
          title: 'JavaScript Conference',
          description: 'Learn about modern JavaScript',
          location: 'San Francisco',
          date: new Date('2024-12-31T18:00:00Z')
        },
        {
          title: 'React Workshop',
          description: 'Hands-on React development',
          location: 'New York',
          date: new Date('2024-12-25T10:00:00Z')
        }
      ];

      await testDb.insert(events).values(testEvents);
    });

    it('should return all events successfully', async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      await eventController.getAllEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            title: 'React Workshop'
          }),
          expect.objectContaining({
            title: 'JavaScript Conference'
          })
        ]),
        pagination: expect.objectContaining({
          total: 2,
          limit: 50,
          offset: 0,
          hasMore: false
        })
      });
    });

    it('should filter events by search term', async () => {
      const req = createMockRequest({}, {}, { search: 'JavaScript' });
      const res = createMockResponse();

      await eventController.getAllEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            title: 'JavaScript Conference'
          })
        ]),
        pagination: expect.objectContaining({
          total: 1
        })
      });
    });

    it('should filter events by location', async () => {
      const req = createMockRequest({}, {}, { location: 'San Francisco' });
      const res = createMockResponse();

      await eventController.getAllEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            title: 'JavaScript Conference'
          })
        ]),
        pagination: expect.objectContaining({
          total: 1
        })
      });
    });

    it('should handle pagination parameters', async () => {
      const req = createMockRequest({}, {}, { limit: '1', offset: '0' });
      const res = createMockResponse();

      await eventController.getAllEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String)
          })
        ]),
        pagination: expect.objectContaining({
          total: 2,
          limit: 1,
          offset: 0,
          hasMore: true
        })
      });
    });

    it('should include relations when requested', async () => {
      // Create test tag and participant
      const [tag] = await testDb.insert(tags).values({
        name: 'Technology',
        color: '#FF5733'
      }).returning();

      const [participant] = await testDb.insert(participants).values({
        name: 'John Doe',
        email: 'john@example.com'
      }).returning();

      // Get the first event and add relationships
      const allEvents = await testDb.select().from(events).limit(1);
      const eventId = allEvents[0].id;

      await testDb.insert(eventTags).values({
        eventId,
        tagId: tag.id
      });

      await testDb.insert(eventParticipants).values({
        eventId,
        participantId: participant.id
      });

      const req = createMockRequest({}, {}, { include: 'true' });
      const res = createMockResponse();

      await eventController.getAllEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = (res.json as jest.Mock).mock.calls[0][0];
      expect(responseData.data[0].tags).toBeDefined();
      expect(responseData.data[0].participants).toBeDefined();
    });
  });

  describe('getEventById', () => {
    let testEventId: string;

    beforeEach(async () => {
      const [event] = await testDb.insert(events).values({
        title: 'Test Event',
        description: 'Test Description',
        location: 'Test Location',
        date: new Date('2024-12-31T18:00:00Z')
      }).returning();
      testEventId = event.id;
    });

    it('should return event by ID successfully', async () => {
      const req = createMockRequest({ id: testEventId });
      const res = createMockResponse();

      await eventController.getEventById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: testEventId,
          title: 'Test Event',
          description: 'Test Description',
          location: 'Test Location'
        })
      });
    });

    it('should return 404 for non-existent event ID', async () => {
      const req = createMockRequest({ id: generateNonExistentUUID() });
      const res = createMockResponse();

      await eventController.getEventById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Event not found'
      });
    });

    it('should return 400 for missing event ID', async () => {
      const req = createMockRequest({});
      const res = createMockResponse();

      await eventController.getEventById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Event ID is required'
      });
    });
  });

  describe('createEvent', () => {
    it('should create event successfully', async () => {
      const eventData: CreateEventRequest = {
        title: 'New Event',
        description: 'New Description',
        location: 'New Location',
        date: '2024-12-31T18:00:00Z',
        imageUrl: 'https://example.com/image.jpg'
      };

      const req = createMockRequest({}, eventData);
      const res = createMockResponse();

      await eventController.createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Event created successfully',
        data: expect.objectContaining({
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          imageUrl: eventData.imageUrl
        })
      });
    });

    it('should return 400 for missing required fields', async () => {
      const eventData = {
        description: 'Missing title and date'
      };

      const req = createMockRequest({}, eventData);
      const res = createMockResponse();

      await eventController.createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Title and date are required'
      });
    });

    it('should return 400 for missing title only', async () => {
      const eventData = {
        date: '2024-12-31T18:00:00Z'
      };

      const req = createMockRequest({}, eventData);
      const res = createMockResponse();

      await eventController.createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Title and date are required'
      });
    });

    it('should return 400 for missing date only', async () => {
      const eventData = {
        title: 'Missing Date Event'
      };

      const req = createMockRequest({}, eventData);
      const res = createMockResponse();

      await eventController.createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Title and date are required'
      });
    });
  });

  describe('updateEvent', () => {
    let testEventId: string;

    beforeEach(async () => {
      const [event] = await testDb.insert(events).values({
        title: 'Original Title',
        description: 'Original Description',
        location: 'Original Location',
        date: new Date('2024-12-31T18:00:00Z')
      }).returning();
      testEventId = event.id;
    });

    it('should update event successfully', async () => {
      const updateData: UpdateEventRequest = {
        title: 'Updated Title',
        description: 'Updated Description'
      };

      const req = createMockRequest({ id: testEventId }, updateData);
      const res = createMockResponse();

      await eventController.updateEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Event updated successfully',
        data: expect.objectContaining({
          id: testEventId,
          title: updateData.title,
          description: updateData.description
        })
      });
    });

    it('should return 404 for non-existent event ID', async () => {
      const updateData = { title: 'Updated Title' };
      const req = createMockRequest({ id: generateNonExistentUUID() }, updateData);
      const res = createMockResponse();

      await eventController.updateEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Event not found'
      });
    });

    it('should return 400 for missing event ID', async () => {
      const updateData = { title: 'Updated Title' };
      const req = createMockRequest({}, updateData);
      const res = createMockResponse();

      await eventController.updateEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Event ID is required'
      });
    });
  });

  describe('deleteEvent', () => {
    it('should delete event successfully', async () => {
      // Create event specifically for this test
      const [event] = await testDb.insert(events).values({
        title: 'Event to Delete',
        date: new Date('2024-12-31T18:00:00Z')
      }).returning();

      const req = createMockRequest({ id: event.id });
      const res = createMockResponse();

      await eventController.deleteEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Event deleted successfully'
      });

      // Verify event is deleted
      const deletedEvent = await testDb.select().from(events).where(eq(events.id, event.id));
      expect(deletedEvent).toHaveLength(0);
    });

    it('should return 404 for non-existent event ID', async () => {
      const req = createMockRequest({ id: generateNonExistentUUID() });
      const res = createMockResponse();

      await eventController.deleteEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Event not found'
      });
    });

    it('should return 400 for missing event ID', async () => {
      const req = createMockRequest({});
      const res = createMockResponse();

      await eventController.deleteEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Event ID is required'
      });
    });
  });
});
