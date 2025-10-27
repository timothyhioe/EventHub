import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { participants } from '../db/schema';

// Participant Types
export type Participant = InferSelectModel<typeof participants>;
export type NewParticipant = InferInsertModel<typeof participants>;
export type UpdateParticipant = Partial<NewParticipant>;

// Request/Response types for Participant API
export interface CreateParticipantRequest {
  name: string;
  email: string;
  phone?: string;
}

export interface UpdateParticipantRequest {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ParticipantResponse extends Participant {
  events?: Array<{ id: string; title: string; date: Date }>;
}

// Relationship Management Types
export interface AddParticipantToEventRequest {
  participantId: string;
}
