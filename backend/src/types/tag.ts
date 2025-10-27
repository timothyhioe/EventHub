import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { tags } from '../db/schema';

// Tag Types
export type Tag = InferSelectModel<typeof tags>;
export type NewTag = InferInsertModel<typeof tags>;
export type UpdateTag = Partial<NewTag>;

// Request/Response types for Tag API
export interface CreateTagRequest {
  name: string;
  color: string; 
}

export interface UpdateTagRequest {
  name?: string;
  color?: string;
}

export interface TagResponse extends Tag {
  events?: Array<{ id: string; title: string; date: Date }>;
}

// Relationship Management Types
export interface AddTagToEventRequest {
  tagId: string;
}
