import request from 'supertest';
import { createTestApp } from '../helpers/testApp';
import { testDb, generateNonExistentUUID } from '../setup';
import { events, tags, participants, eventTags, eventParticipants } from '../../db/schema';
import { NewEvent } from '../../types/event';
import { NewTag } from '../../types/tag';
import { NewParticipant } from '../../types/participant';

describe('API Endpoints Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /api/events', () => {
    beforeEach(async () => {
      // Create test events
      const testEvents: NewEvent[] = [
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

      // Insert events separately to ensure different timestamps
      await testDb.insert(events).values(testEvents[0]);
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      await testDb.insert(events).values(testEvents[1]);
    });

    it('should return all events', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
      expect(response.body.data[0].title).toBe('React Workshop'); // Ordered by createdAt desc
      expect(response.body.data[1].title).toBe('JavaScript Conference');
    });

    it('should filter events by search term', async () => {
      const response = await request(app)
        .get('/api/events')
        .query({ search: 'JavaScript' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('JavaScript Conference');
    });

    it('should filter events by location', async () => {
      const response = await request(app)
        .get('/api/events')
        .query({ location: 'San Francisco' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('JavaScript Conference');
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/events')
        .query({ limit: 1, offset: 0 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.total).toBe(2);
      expect(response.body.pagination.hasMore).toBe(true);
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

      // Create a specific event for this test
      const [event] = await testDb.insert(events).values({
        title: 'Event with Relations',
        description: 'Test Description',
        location: 'Test Location',
        date: new Date('2024-12-31T18:00:00Z')
      }).returning();

      // Add relationships to the specific event
      await testDb.insert(eventTags).values({
        eventId: event.id,
        tagId: tag.id
      });

      await testDb.insert(eventParticipants).values({
        eventId: event.id,
        participantId: participant.id
      });

      const response = await request(app)
        .get('/api/events')
        .query({ include: 'true' })
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Find the event with relations in the response
      const eventWithRelations = response.body.data.find((e: any) => e.id === event.id);
      expect(eventWithRelations).toBeDefined();
      expect(eventWithRelations.tags).toBeDefined();
      expect(eventWithRelations.participants).toBeDefined();
      expect(eventWithRelations.tags).toHaveLength(1);
      expect(eventWithRelations.participants).toHaveLength(1);
    });
  });

  describe('GET /api/events/:id', () => {
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

    it('should return event by ID', async () => {
      const response = await request(app)
        .get(`/api/events/${testEventId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testEventId);
      expect(response.body.data.title).toBe('Test Event');
      expect(response.body.data.description).toBe('Test Description');
      expect(response.body.data.location).toBe('Test Location');
    });

    it('should return 404 for non-existent event ID', async () => {
      const nonExistentId = generateNonExistentUUID();
      const response = await request(app)
        .get(`/api/events/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Event not found');
    });
  });

  describe('POST /api/events', () => {
    it('should create event successfully', async () => {
      const eventData = {
        title: 'New Event',
        description: 'New Description',
        location: 'New Location',
        date: '2024-12-31T18:00:00Z',
        imageUrl: 'https://example.com/image.jpg'
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Event created successfully');
      expect(response.body.data.title).toBe(eventData.title);
      expect(response.body.data.description).toBe(eventData.description);
      expect(response.body.data.location).toBe(eventData.location);
      expect(response.body.data.imageUrl).toBe(eventData.imageUrl);
    });

    it('should return 400 for missing required fields', async () => {
      const eventData = {
        description: 'Missing title and date'
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Title and date are required');
    });

    it('should return 400 for missing title only', async () => {
      const eventData = {
        date: '2024-12-31T18:00:00Z'
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Title and date are required');
    });
  });

  describe('PUT /api/events/:id', () => {
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
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put(`/api/events/${testEventId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Event updated successfully');
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.description).toBe(updateData.description);
    });

    it('should return 404 for non-existent event ID', async () => {
      const updateData = { title: 'Updated Title' };

      const response = await request(app)
        .put(`/api/events/${generateNonExistentUUID()}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Event not found');
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should delete event successfully', async () => {
      // Create event specifically for this test
      const [event] = await testDb.insert(events).values({
        title: 'Event to Delete',
        date: new Date('2024-12-31T18:00:00Z')
      }).returning();

      const response = await request(app)
        .delete(`/api/events/${event.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Event deleted successfully');

      // Verify event is deleted
      const getResponse = await request(app)
        .get(`/api/events/${event.id}`)
        .expect(404);
      
      expect(getResponse.body.message).toBe('Event not found');
    });

    it('should return 404 for non-existent event ID', async () => {
      const response = await request(app)
        .delete(`/api/events/${generateNonExistentUUID()}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Event not found');
    });
  });

  describe('POST /api/events/:id/tags', () => {
    let testEventId: string;
    let testTagId: string;

    beforeEach(async () => {
      const [event] = await testDb.insert(events).values({
        title: 'Test Event',
        date: new Date('2024-12-31T18:00:00Z')
      }).returning();
      testEventId = event.id;

      const [tag] = await testDb.insert(tags).values({
        name: 'Test Tag',
        color: '#FF5733'
      }).returning();
      testTagId = tag.id;
    });

    it('should add tag to event successfully', async () => {
      const response = await request(app)
        .post(`/api/events/${testEventId}/tags`)
        .send({ tagId: testTagId })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Tag added to event successfully');
    });

    it('should return 404 for non-existent event ID', async () => {
      const response = await request(app)
        .post(`/api/events/${generateNonExistentUUID()}/tags`)
        .send({ tagId: testTagId })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Event not found');
    });

    it('should return 400 for missing tagId', async () => {
      const response = await request(app)
        .post(`/api/events/${testEventId}/tags`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Event ID and Tag ID are required');
    });
  });

  describe('POST /api/events/:id/participants', () => {
    let testEventId: string;
    let testParticipantId: string;

    beforeEach(async () => {
      const [event] = await testDb.insert(events).values({
        title: 'Test Event',
        date: new Date('2024-12-31T18:00:00Z')
      }).returning();
      testEventId = event.id;

      const [participant] = await testDb.insert(participants).values({
        name: 'Test Participant',
        email: 'test@example.com'
      }).returning();
      testParticipantId = participant.id;
    });

    it('should add participant to event successfully', async () => {
      const response = await request(app)
        .post(`/api/events/${testEventId}/participants`)
        .send({ participantId: testParticipantId })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Participant added to event successfully');
    });

    it('should return 404 for non-existent event ID', async () => {
      const response = await request(app)
        .post(`/api/events/${generateNonExistentUUID()}/participants`)
        .send({ participantId: testParticipantId })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Event not found');
    });

    it('should return 400 for missing participantId', async () => {
      const response = await request(app)
        .post(`/api/events/${testEventId}/participants`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Event ID and Participant ID are required');
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return API info on root endpoint', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.message).toBe('Event Management System API');
      expect(response.body.version).toBe('1.0.0');
      expect(response.body.status).toBe('running');
      expect(response.body.endpoints).toBeDefined();
    });
  });
});
