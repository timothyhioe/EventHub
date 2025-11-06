import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { events } from '../db/schema';

// Type for selecting events (when reading from database)
export type Event = InferSelectModel<typeof events>;

// Type for inserting events (when creating new events)
export type NewEvent = InferInsertModel<typeof events>;

// Type for updating events (partial event data)
export type UpdateEvent = Partial<NewEvent>;

// Request/Response types for API
export interface CreateEventRequest {
  title: string;
  description?: string;
  location?: string;
  date: string; // ISO date string
  imageUrl?: string;
  latitude?: number | string;
  longitude?: number | string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  location?: string;
  date?: string; // ISO date string
  imageUrl?: string;
  latitude?: number | string;
  longitude?: number | string;
}

export interface EventResponse extends Event {
  tags?: Array<{ id: string; name: string; color: string }>;
  participants?: Array<{ id: string; name: string; email: string }>;
}