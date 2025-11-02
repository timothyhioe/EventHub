// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Generic API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Events API
export const eventsApi = {
  getAll: async (params?: {
    search?: string;
    location?: string;
    tagIds?: string[];
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
    include?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.tagIds?.length) queryParams.append('tags', params.tagIds.join(','));
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.include) queryParams.append('include', 'true');

    const query = queryParams.toString();
    return apiRequest(`${'/events'}${query ? `?${query}` : ''}`);
  },

  getById: async (id: string, includeRelations = false) => {
    const query = includeRelations ? '?include=true' : '';
    return apiRequest(`/events/${id}${query}`);
  },

  create: async (data: {
    title: string;
    description?: string;
    location?: string;
    date: string;
    imageUrl?: string;
  }) => {
    return apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: {
    title?: string;
    description?: string;
    location?: string;
    date?: string;
    imageUrl?: string;
  }) => {
    return apiRequest(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/events/${id}`, {
      method: 'DELETE',
    });
  },

  addTag: async (eventId: string, tagId: string) => {
    return apiRequest(`/events/${eventId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tagId }),
    });
  },

  removeTag: async (eventId: string, tagId: string) => {
    return apiRequest(`/events/${eventId}/tags/${tagId}`, {
      method: 'DELETE',
    });
  },

  addParticipant: async (eventId: string, participantId: string) => {
    return apiRequest(`/events/${eventId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ participantId }),
    });
  },

  removeParticipant: async (eventId: string, participantId: string) => {
    return apiRequest(`/events/${eventId}/participants/${participantId}`, {
      method: 'DELETE',
    });
  },
};

// Participants API
export const participantsApi = {
  getAll: async (params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return apiRequest(`/participants${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/participants/${id}`);
  },

  create: async (data: {
    name: string;
    email: string;
    phone?: string;
  }) => {
    return apiRequest('/participants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
  }) => {
    return apiRequest(`/participants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/participants/${id}`, {
      method: 'DELETE',
    });
  },
};

// Tags API
export const tagsApi = {
  getAll: async () => {
    return apiRequest('/tags');
  },

  getById: async (id: string) => {
    return apiRequest(`/tags/${id}`);
  },

  create: async (data: {
    name: string;
    color: string;
  }) => {
    return apiRequest('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: {
    name?: string;
    color?: string;
  }) => {
    return apiRequest(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/tags/${id}`, {
      method: 'DELETE',
    });
  },
};

