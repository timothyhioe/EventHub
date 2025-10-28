import { db, events, tags, participants, eventTags, eventParticipants } from '../index';
import { NewEvent, UpdateEvent, EventResponse } from '../../types/event';
import { eq, desc, and, or, ilike, gte, lte, inArray, sql } from 'drizzle-orm';

export class EventRepository {
  constructor(private database: typeof db) {}

  // Get all events with search and filter capabilities
  async getAllEventsWithFilters(filters: {
    search?: string;
    startDate?: Date;
    endDate?: Date;
    location?: string;
    tagIds?: string[];
    includeRelations?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ events: EventResponse[]; total: number }> {
    const {
      search,
      startDate,
      endDate,
      location,
      tagIds,
      includeRelations = false,
      limit = 50,
      offset = 0
    } = filters;

    const conditions = [];

    // Search by title or description
    if (search) {
      conditions.push(
        or(
          ilike(events.title, `%${search}%`),
          ilike(events.description, `%${search}%`)
        )
      );
    }

    // Filter by date range
    if (startDate) {
      conditions.push(gte(events.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(events.date, endDate));
    }

    // Filter by location
    if (location) {
      conditions.push(ilike(events.location, `%${location}%`));
    }

    // Filter by tags
    if (tagIds && tagIds.length > 0) {
      const eventIdsWithTags = this.database
        .select({ eventId: eventTags.eventId })
        .from(eventTags)
        .where(inArray(eventTags.tagId, tagIds));
      
      conditions.push(inArray(events.id, eventIdsWithTags));
    }

    // Build the main query
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get total count for pagination
    const totalResult = await this.database
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(whereClause);
    
    const total = Number(totalResult[0]?.count) || 0;

    // Get events with pagination
    const eventsResult = await this.database
      .select()
      .from(events)
      .where(whereClause)
      .orderBy(desc(events.createdAt))
      .limit(limit)
      .offset(offset);

    // If includeRelations is true, fetch related data
    if (includeRelations) {
      const eventsWithRelations = await Promise.all(
        eventsResult.map(async (event) => {
          const [eventTagsData, eventParticipantsData] = await Promise.all([
            // Get tags for this event
            this.database
              .select({
                id: tags.id,
                name: tags.name,
                color: tags.color
              })
              .from(eventTags)
              .innerJoin(tags, eq(eventTags.tagId, tags.id))
              .where(eq(eventTags.eventId, event.id)),
            
            // Get participants for this event
            this.database
              .select({
                id: participants.id,
                name: participants.name,
                email: participants.email
              })
              .from(eventParticipants)
              .innerJoin(participants, eq(eventParticipants.participantId, participants.id))
              .where(eq(eventParticipants.eventId, event.id))
          ]);

          return {
            ...event,
            tags: eventTagsData,
            participants: eventParticipantsData
          };
        })
      );

      return { events: eventsWithRelations, total };
    }

    return { events: eventsResult, total };
  }

  // Get single event by ID
  async getEventById(id: string): Promise<EventResponse | null> {
    const event = await this.database.select().from(events).where(eq(events.id, id)).limit(1);
    return event[0] || null;
  }

  // Create new event
  async createEvent(eventData: NewEvent): Promise<EventResponse> {
    const [newEvent] = await this.database.insert(events).values(eventData).returning();
    return newEvent;
  }

  // Update event
  async updateEvent(id: string, eventData: UpdateEvent): Promise<EventResponse | null> {
    const [updatedEvent] = await this.database
      .update(events)
      .set({ ...eventData, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    
    return updatedEvent || null;
  }

  // Delete event
  async deleteEvent(id: string): Promise<boolean> {
    const result = await this.database.delete(events).where(eq(events.id, id));
    return result.length > 0;
  }

  // Search events by title or description
  async searchEvents(query: string, limit = 50, offset = 0): Promise<{ events: EventResponse[]; total: number }> {
    return await this.getAllEventsWithFilters({
      search: query,
      limit,
      offset
    });
  }

  // Get events by date range
  async getEventsByDateRange(
    startDate: Date, 
    endDate: Date, 
    limit = 50, 
    offset = 0
  ): Promise<{ events: EventResponse[]; total: number }> {
    return await this.getAllEventsWithFilters({
      startDate,
      endDate,
      limit,
      offset
    });
  }

  // Get events by location
  async getEventsByLocation(location: string, limit = 50, offset = 0): Promise<{ events: EventResponse[]; total: number }> {
    return await this.getAllEventsWithFilters({
      location,
      limit,
      offset
    });
  }

  // Get events by tags
  async getEventsByTags(tagIds: string[], limit = 50, offset = 0): Promise<{ events: EventResponse[]; total: number }> {
    return await this.getAllEventsWithFilters({
      tagIds,
      limit,
      offset
    });
  }
}
