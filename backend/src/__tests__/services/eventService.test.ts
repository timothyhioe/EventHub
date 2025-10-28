import { EventService } from '../../services/eventService';
import { testDb } from '../setup';
import { events, tags, participants, eventTags, eventParticipants } from '../../db/schema';
import { NewEvent } from '../../types/event';

describe('EventService', () => {
  describe('createEvent', () => {
    it('should create a new event successfully', async () => {
      const eventData: NewEvent = {
        title: 'Test Event',
        description: 'Test Description',
        location: 'Test Location',
        date: new Date('2024-12-31T18:00:00Z'),
        imageUrl: 'https://example.com/image.jpg'
      };

      const result = await EventService.createEvent(eventData);

      expect(result).toBeDefined();
      expect(result.title).toBe(eventData.title);
      expect(result.description).toBe(eventData.description);
      expect(result.location).toBe(eventData.location);
      expect(result.imageUrl).toBe(eventData.imageUrl);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should create an event with minimal required fields', async () => {
      const eventData: NewEvent = {
        title: 'Minimal Event',
        date: new Date('2024-12-31T18:00:00Z')
      };

      const result = await EventService.createEvent(eventData);

      expect(result).toBeDefined();
      expect(result.title).toBe(eventData.title);
      expect(result.date).toEqual(eventData.date);
      expect(result.description).toBeNull();
      expect(result.location).toBeNull();
      expect(result.imageUrl).toBeNull();
    });
  });

  describe('getEventById', () => {
    it('should return an event by ID', async () => {
      // Create a test event
      const eventData: NewEvent = {
        title: 'Test Event for Get',
        date: new Date('2024-12-31T18:00:00Z')
      };
      const [createdEvent] = await testDb.insert(events).values(eventData).returning();

      const result = await EventService.getEventById(createdEvent.id);

      expect(result).toBeDefined();
      expect(result!.id).toBe(createdEvent.id);
      expect(result!.title).toBe(eventData.title);
    });

    it('should return null for non-existent event ID', async () => {
      const result = await EventService.getEventById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('getAllEvents', () => {
    it('should return all events', async () => {
      // Create test events
      const eventData1: NewEvent = {
        title: 'Event 1',
        date: new Date('2024-12-31T18:00:00Z')
      };
      const eventData2: NewEvent = {
        title: 'Event 2',
        date: new Date('2024-12-30T18:00:00Z')
      };

      await testDb.insert(events).values([eventData1, eventData2]);

      const result = await EventService.getAllEvents();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Event 2'); // Should be ordered by createdAt desc
      expect(result[1].title).toBe('Event 1');
    });

    it('should return empty array when no events exist', async () => {
      const result = await EventService.getAllEvents();
      expect(result).toHaveLength(0);
    });
  });

  describe('getAllEventsWithFilters', () => {
    beforeEach(async () => {
      // Create test events with different properties
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
        },
        {
          title: 'Node.js Meetup',
          description: 'Backend development with Node.js',
          location: 'San Francisco',
          date: new Date('2024-12-20T19:00:00Z')
        }
      ];

      await testDb.insert(events).values(testEvents);
    });

    it('should filter events by search term in title', async () => {
      const result = await EventService.getAllEventsWithFilters({
        search: 'JavaScript'
      });

      expect(result.events).toHaveLength(1);
      expect(result.events[0].title).toBe('JavaScript Conference');
    });

    it('should filter events by search term in description', async () => {
      const result = await EventService.getAllEventsWithFilters({
        search: 'React'
      });

      expect(result.events).toHaveLength(1);
      expect(result.events[0].title).toBe('React Workshop');
    });

    it('should filter events by location', async () => {
      const result = await EventService.getAllEventsWithFilters({
        location: 'San Francisco'
      });

      expect(result.events).toHaveLength(2);
      expect(result.events.map(e => e.title)).toContain('JavaScript Conference');
      expect(result.events.map(e => e.title)).toContain('Node.js Meetup');
    });

    it('should filter events by date range', async () => {
      const startDate = new Date('2024-12-25T00:00:00Z');
      const endDate = new Date('2024-12-31T23:59:59Z');

      const result = await EventService.getAllEventsWithFilters({
        startDate,
        endDate
      });

      expect(result.events).toHaveLength(2);
      expect(result.events.map(e => e.title)).toContain('JavaScript Conference');
      expect(result.events.map(e => e.title)).toContain('React Workshop');
    });

    it('should apply pagination', async () => {
      const result = await EventService.getAllEventsWithFilters({
        limit: 2,
        offset: 0
      });

      expect(result.events).toHaveLength(2);
      expect(result.total).toBe(3);
    });

    it('should include relations when requested', async () => {
      // Create test tags and participants
      const [tag1] = await testDb.insert(tags).values({
        name: 'Technology',
        color: '#FF5733'
      }).returning();

      const [participant1] = await testDb.insert(participants).values({
        name: 'John Doe',
        email: 'john@example.com'
      }).returning();

      // Get the first event
      const allEvents = await EventService.getAllEvents();
      const eventId = allEvents[0].id;

      // Add relationships
      await testDb.insert(eventTags).values({
        eventId,
        tagId: tag1.id
      });

      await testDb.insert(eventParticipants).values({
        eventId,
        participantId: participant1.id
      });

      const result = await EventService.getAllEventsWithFilters({
        includeRelations: true
      });

      expect(result.events[0].tags).toBeDefined();
      expect(result.events[0].participants).toBeDefined();
      expect(result.events[0].tags).toHaveLength(1);
      expect(result.events[0].participants).toHaveLength(1);
    });
  });

  describe('updateEvent', () => {
    it('should update an existing event', async () => {
      // Create a test event
      const eventData: NewEvent = {
        title: 'Original Title',
        description: 'Original Description',
        date: new Date('2024-12-31T18:00:00Z')
      };
      const [createdEvent] = await testDb.insert(events).values(eventData).returning();

      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description'
      };

      const result = await EventService.updateEvent(createdEvent.id, updateData);

      expect(result).toBeDefined();
      expect(result!.title).toBe(updateData.title);
      expect(result!.description).toBe(updateData.description);
      expect(result!.id).toBe(createdEvent.id);
    });

    it('should return null for non-existent event ID', async () => {
      const result = await EventService.updateEvent('non-existent-id', {
        title: 'Updated Title'
      });
      expect(result).toBeNull();
    });
  });

  describe('deleteEvent', () => {
    it('should delete an existing event', async () => {
      // Create a test event
      const eventData: NewEvent = {
        title: 'Event to Delete',
        date: new Date('2024-12-31T18:00:00Z')
      };
      const [createdEvent] = await testDb.insert(events).values(eventData).returning();

      const result = await EventService.deleteEvent(createdEvent.id);

      expect(result).toBe(true);

      // Verify event is deleted
      const deletedEvent = await EventService.getEventById(createdEvent.id);
      expect(deletedEvent).toBeNull();
    });

    it('should return false for non-existent event ID', async () => {
      const result = await EventService.deleteEvent('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('searchEvents', () => {
    beforeEach(async () => {
      const testEvents: NewEvent[] = [
        {
          title: 'JavaScript Conference',
          description: 'Learn about modern JavaScript',
          date: new Date('2024-12-31T18:00:00Z')
        },
        {
          title: 'Python Workshop',
          description: 'Data science with Python',
          date: new Date('2024-12-25T10:00:00Z')
        }
      ];

      await testDb.insert(events).values(testEvents);
    });

    it('should search events by query', async () => {
      const result = await EventService.searchEvents('JavaScript');

      expect(result.events).toHaveLength(1);
      expect(result.events[0].title).toBe('JavaScript Conference');
    });

    it('should return empty results for non-matching query', async () => {
      const result = await EventService.searchEvents('NonExistent');

      expect(result.events).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getEventsByDateRange', () => {
    beforeEach(async () => {
      const testEvents: NewEvent[] = [
        {
          title: 'Event 1',
          date: new Date('2024-12-20T18:00:00Z')
        },
        {
          title: 'Event 2',
          date: new Date('2024-12-25T18:00:00Z')
        },
        {
          title: 'Event 3',
          date: new Date('2024-12-31T18:00:00Z')
        }
      ];

      await testDb.insert(events).values(testEvents);
    });

    it('should return events within date range', async () => {
      const startDate = new Date('2024-12-22T00:00:00Z');
      const endDate = new Date('2024-12-30T23:59:59Z');

      const result = await EventService.getEventsByDateRange(startDate, endDate);

      expect(result.events).toHaveLength(1);
      expect(result.events[0].title).toBe('Event 2');
    });
  });

  describe('getEventsByLocation', () => {
    beforeEach(async () => {
      const testEvents: NewEvent[] = [
        {
          title: 'Event in SF',
          location: 'San Francisco',
          date: new Date('2024-12-31T18:00:00Z')
        },
        {
          title: 'Event in NYC',
          location: 'New York',
          date: new Date('2024-12-25T18:00:00Z')
        }
      ];

      await testDb.insert(events).values(testEvents);
    });

    it('should return events by location', async () => {
      const result = await EventService.getEventsByLocation('San Francisco');

      expect(result.events).toHaveLength(1);
      expect(result.events[0].title).toBe('Event in SF');
    });
  });

  describe('getEventsByTags', () => {
    beforeEach(async () => {
      // Create test events and tags
      const [event1] = await testDb.insert(events).values({
        title: 'Event 1',
        date: new Date('2024-12-31T18:00:00Z')
      }).returning();

      const [event2] = await testDb.insert(events).values({
        title: 'Event 2',
        date: new Date('2024-12-25T18:00:00Z')
      }).returning();

      const [tag1] = await testDb.insert(tags).values({
        name: 'Technology',
        color: '#FF5733'
      }).returning();

      const [tag2] = await testDb.insert(tags).values({
        name: 'Business',
        color: '#33FF57'
      }).returning();

      // Add tags to events
      await testDb.insert(eventTags).values([
        { eventId: event1.id, tagId: tag1.id },
        { eventId: event2.id, tagId: tag2.id }
      ]);
    });

    it('should return events by tag IDs', async () => {
      const allTags = await testDb.select().from(tags);
      const techTag = allTags.find(t => t.name === 'Technology');
      
      const result = await EventService.getEventsByTags([techTag!.id]);

      expect(result.events).toHaveLength(1);
      expect(result.events[0].title).toBe('Event 1');
    });
  });
});
