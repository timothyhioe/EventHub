// Participant Types matching backend API
export interface Participant {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantWithEvents extends Participant {
  events?: Array<{
    id: string;
    title: string;
    date: string;
  }>;
}

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

export interface ParticipantResponse {
  success: boolean;
  data: ParticipantWithEvents | ParticipantWithEvents[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}


