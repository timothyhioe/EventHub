// Tag Types matching backend API
export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface TagWithEvents extends Tag {
  events?: Array<{
    id: string;
    title: string;
    date: string;
  }>;
}

export interface CreateTagRequest {
  name: string;
  color: string;
}

export interface UpdateTagRequest {
  name?: string;
  color?: string;
}

export interface TagResponse {
  success: boolean;
  data: TagWithEvents | TagWithEvents[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

