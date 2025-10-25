import { db, events, tags, participants, eventTags, eventParticipants } from '../db';
import { NewEvent, UpdateEvent, EventResponse } from '../types/event';
import { eq, desc } from 'drizzle-orm';

export class EventService {
  // Get all events with optional relationships
  static async getAllEvents(includeRelations = false): Promise<EventResponse[]> {
    const baseQuery = db.select().from(events).orderBy(desc(events.createdAt));
    
    if (includeRelations) {
      return await baseQuery;
    }
    
    return await baseQuery;
  }

  // Get single event by ID
  static async getEventById(id: string): Promise<EventResponse | null> {
    const event = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return event[0] || null;
  }

  // Create new event
  static async createEvent(eventData: NewEvent): Promise<EventResponse> {
    const [newEvent] = await db.insert(events).values(eventData).returning();
    return newEvent;
  }

  // Update event
  static async updateEvent(id: string, eventData: UpdateEvent): Promise<EventResponse | null> {
    const [updatedEvent] = await db
      .update(events)
      .set({ ...eventData, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    
    return updatedEvent || null;
  }

  // Delete event
  static async deleteEvent(id: string): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return result.length > 0;
  }

  // Search events by title or description
  static async searchEvents(query: string): Promise<EventResponse[]> {
    // We'll implement this with proper search later
    return await db.select().from(events).orderBy(desc(events.createdAt));
  }

  // Get events by date range
  static async getEventsByDateRange(startDate: Date, endDate: Date): Promise<EventResponse[]> {
    // We'll implement this with proper date filtering later
    return await db.select().from(events).orderBy(desc(events.createdAt));
  }
}       