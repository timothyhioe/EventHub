// Event Types matching backend API
import type { Tag } from './tag';
import type { Participant } from './participant';

export interface Event {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  date: string;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventWithRelations extends Event {
  tags?: Tag[];
  participants?: Participant[];
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  location?: string;
  date: string;
  imageUrl?: string;
  latitude?: number | string;
  longitude?: number | string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  location?: string;
  date?: string;
  imageUrl?: string;
  latitude?: number | string;
  longitude?: number | string;
}

export interface EventResponse {
  success: boolean;
  data: EventWithRelations | EventWithRelations[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

