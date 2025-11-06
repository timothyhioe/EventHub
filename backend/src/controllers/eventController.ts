import { Request, Response } from 'express';
import { EventRepository } from '../db/repository/event.repository';
import { RelationshipRepository } from '../db/repository/relationship.repository';
import { CreateEventRequest, UpdateEventRequest, NewEvent, UpdateEvent } from '../types/event';
import { AddTagToEventRequest } from '../types/tag';
import { AddParticipantToEventRequest } from '../types/participant';
import { isValidUUID } from '../utils/uuid';
import { GeocodingService } from '../services/geocordingService';

export class EventController {
  constructor(
    private eventRepository: EventRepository,
    private relationshipRepository: RelationshipRepository
  ) {}
  // GET /api/events - Get all events with search and filter capabilities
  async getAllEvents(req: Request, res: Response): Promise<void> {
    try {
      const {
        search,
        startDate,
        endDate,
        location,
        tags,
        include,
        limit,
        offset
      } = req.query;

      // Parse and validate query parameters
      const filters: any = {
        includeRelations: include === 'true'
      };

      // Search parameter
      if (search && typeof search === 'string') {
        filters.search = search.trim();
      }

      // Date range parameters
      if (startDate && typeof startDate === 'string') {
        const parsedStartDate = new Date(startDate);
        if (!isNaN(parsedStartDate.getTime())) {
          filters.startDate = parsedStartDate;
        }
      }

      if (endDate && typeof endDate === 'string') {
        const parsedEndDate = new Date(endDate);
        if (!isNaN(parsedEndDate.getTime())) {
          filters.endDate = parsedEndDate;
        }
      }

      // Location parameter
      if (location && typeof location === 'string') {
        filters.location = location.trim();
      }

      // Tags parameter (can be comma-separated)
      if (tags && typeof tags === 'string') {
        const tagIds = tags.split(',').map(id => id.trim()).filter(id => id.length > 0);
        if (tagIds.length > 0) {
          filters.tagIds = tagIds;
        }
      }

      // Pagination parameters
      if (limit && typeof limit === 'string') {
        const parsedLimit = parseInt(limit, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
          filters.limit = parsedLimit;
        }
      }

      if (offset && typeof offset === 'string') {
        const parsedOffset = parseInt(offset, 10);
        if (!isNaN(parsedOffset) && parsedOffset >= 0) {
          filters.offset = parsedOffset;
        }
      }

      const result = await this.eventRepository.getAllEventsWithFilters(filters);
      
      res.status(200).json({
        success: true,
        data: result.events,
        pagination: {
          total: result.total,
          limit: filters.limit || 50,
          offset: filters.offset || 0,
          hasMore: (filters.offset || 0) + result.events.length < result.total
        }
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/events/:id - Get single event
  async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Event ID is required'
        });
        return;
      }

      // Validate UUID format
      if (!isValidUUID(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid event ID format'
        });
        return;
      }

      const event = await this.eventRepository.getEventById(id);
      
      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: event
      });
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch event',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // POST /api/events - Create new event
  async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventData: CreateEventRequest = req.body;
      
      // validation
      if (!eventData.title || !eventData.date) {
        res.status(400).json({
          success: false,
          message: 'Title and date are required'
        });
        return;
      }

      // Convert date string to Date object and prepare event data
      const eventToCreate: NewEvent = {
        title: eventData.title,
        description: eventData.description || null,
        location: eventData.location || null,
        date: new Date(eventData.date),
        imageUrl: eventData.imageUrl || null,
      };

      // Geocode address if provided
      if (eventData.location) {
        const coordinates = await GeocodingService.geocodeAddress(eventData.location);
        if (coordinates) {
          eventToCreate.latitude = coordinates.latitude.toString();
          eventToCreate.longitude = coordinates.longitude.toString();
        }
      }

      const newEvent = await this.eventRepository.createEvent(eventToCreate);
      
      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: newEvent
      });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create event',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // PUT /api/events/:id - Update event
  async updateEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateEventRequest = req.body;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Event ID is required'
        });
        return;
      }

      // Validate UUID format
      if (!isValidUUID(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid event ID format'
        });
        return;
      }

      // Prepare update data with proper types
      const processedUpdateData: UpdateEvent = {};
      
      if (updateData.title !== undefined) processedUpdateData.title = updateData.title;
      if (updateData.description !== undefined) processedUpdateData.description = updateData.description || null;
      if (updateData.location !== undefined) processedUpdateData.location = updateData.location || null;
      if (updateData.imageUrl !== undefined) processedUpdateData.imageUrl = updateData.imageUrl || null;
      if (updateData.date) {
        processedUpdateData.date = new Date(updateData.date);
      }

      // Geocode address if location is being updated
      if (updateData.location) {
        const coordinates = await GeocodingService.geocodeAddress(updateData.location);
        if (coordinates) {
          processedUpdateData.latitude = coordinates.latitude.toString();
          processedUpdateData.longitude = coordinates.longitude.toString();
        } else {
          // If geocoding fails and location changed, clear coordinates
          processedUpdateData.latitude = null;
          processedUpdateData.longitude = null;
        }
      }

      const updatedEvent = await this.eventRepository.updateEvent(id, processedUpdateData);
      
      if (!updatedEvent) {
        res.status(404).json({
          success: false,
          message: 'Event not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: updatedEvent
      });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update event',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // DELETE /api/events/:id - Delete event
  async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Event ID is required'
        });
        return;
      }

      // Validate UUID format
      if (!isValidUUID(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid event ID format'
        });
        return;
      }

      const deleted = await this.eventRepository.deleteEvent(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Event not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete event',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // POST /api/events/:id/tags - Add tag to event
  async addTagToEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id: eventId } = req.params;
      const { tagId }: AddTagToEventRequest = req.body;
      
      if (!eventId || !tagId) {
        res.status(400).json({
          success: false,
          message: 'Event ID and Tag ID are required'
        });
        return;
      }

      // Validate UUID formats
      if (!isValidUUID(eventId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid event ID format'
        });
        return;
      }

      if (!isValidUUID(tagId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid tag ID format'
        });
        return;
      }

      // Check if event exists
      const event = await this.eventRepository.getEventById(eventId);
      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found'
        });
        return;
      }

      // Check if relationship already exists
      const alreadyAssociated = await this.relationshipRepository.isTagAssociatedWithEvent(eventId, tagId);
      if (alreadyAssociated) {
        res.status(409).json({
          success: false,
          message: 'Tag is already associated with this event'
        });
        return;
      }

      const success = await this.relationshipRepository.addTagToEvent(eventId, tagId);
      
      if (!success) {
        res.status(409).json({
          success: false,
          message: 'Tag is already associated with this event'
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Tag added to event successfully'
      });
    } catch (error) {
      console.error('Error adding tag to event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add tag to event',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // DELETE /api/events/:id/tags/:tagId - Remove tag from event
  async removeTagFromEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id: eventId, tagId } = req.params;
      
      if (!eventId || !tagId) {
        res.status(400).json({
          success: false,
          message: 'Event ID and Tag ID are required'
        });
        return;
      }

      const success = await this.relationshipRepository.removeTagFromEvent(eventId, tagId);
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Tag association not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Tag removed from event successfully'
      });
    } catch (error) {
      console.error('Error removing tag from event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove tag from event',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // POST /api/events/:id/participants - Add participant to event
  async addParticipantToEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id: eventId } = req.params;
      const { participantId }: AddParticipantToEventRequest = req.body;
      
      if (!eventId || !participantId) {
        res.status(400).json({
          success: false,
          message: 'Event ID and Participant ID are required'
        });
        return;
      }

      // Validate UUID formats
      if (!isValidUUID(eventId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid event ID format'
        });
        return;
      }

      if (!isValidUUID(participantId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid participant ID format'
        });
        return;
      }

      // Check if event exists
      const event = await this.eventRepository.getEventById(eventId);
      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found'
        });
        return;
      }

      // Check if relationship already exists
      const alreadyAssociated = await this.relationshipRepository.isParticipantAssociatedWithEvent(eventId, participantId);
      if (alreadyAssociated) {
        res.status(409).json({
          success: false,
          message: 'Participant is already associated with this event'
        });
        return;
      }

      const success = await this.relationshipRepository.addParticipantToEvent(eventId, participantId);
      
      if (!success) {
        res.status(409).json({
          success: false,
          message: 'Participant is already associated with this event'
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Participant added to event successfully'
      });
    } catch (error) {
      console.error('Error adding participant to event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add participant to event',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // DELETE /api/events/:id/participants/:participantId - Remove participant from event
  async removeParticipantFromEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id: eventId, participantId } = req.params;
      
      if (!eventId || !participantId) {
        res.status(400).json({
          success: false,
          message: 'Event ID and Participant ID are required'
        });
        return;
      }

      const success = await this.relationshipRepository.removeParticipantFromEvent(eventId, participantId);
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Participant association not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Participant removed from event successfully'
      });
    } catch (error) {
      console.error('Error removing participant from event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove participant from event',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/events/search?q=query - Search events
  async searchEvents(req: Request, res: Response): Promise<void> {
    try {
      const { q, limit, offset } = req.query;
      
      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
        return;
      }

      const parsedLimit = limit ? parseInt(limit as string, 10) : 50;
      const parsedOffset = offset ? parseInt(offset as string, 10) : 0;

      const result = await this.eventRepository.searchEvents(q, parsedLimit, parsedOffset);
      
      res.json({
        success: true,
        data: result.events,
        pagination: {
          total: result.total,
          limit: parsedLimit,
          offset: parsedOffset,
          hasMore: parsedOffset + result.events.length < result.total
        }
      });
    } catch (error) {
      console.error('Error searching events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search events',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/events/filter/date?start=date&end=date - Filter by date range
  async getEventsByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const { start, end, limit, offset } = req.query;
      
      if (!start || !end || typeof start !== 'string' || typeof end !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
        return;
      }

      const startDate = new Date(start);
      const endDate = new Date(end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format. Use ISO date format (YYYY-MM-DD)'
        });
        return;
      }

      const parsedLimit = limit ? parseInt(limit as string, 10) : 50;
      const parsedOffset = offset ? parseInt(offset as string, 10) : 0;

      const result = await this.eventRepository.getEventsByDateRange(startDate, endDate, parsedLimit, parsedOffset);
      
      res.json({
        success: true,
        data: result.events,
        pagination: {
          total: result.total,
          limit: parsedLimit,
          offset: parsedOffset,
          hasMore: parsedOffset + result.events.length < result.total
        }
      });
    } catch (error) {
      console.error('Error filtering events by date range:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to filter events by date range',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/events/filter/location?location=location - Filter by location
  async getEventsByLocation(req: Request, res: Response): Promise<void> {
    try {
      const { location, limit, offset } = req.query;
      
      if (!location || typeof location !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Location is required'
        });
        return;
      }

      const parsedLimit = limit ? parseInt(limit as string, 10) : 50;
      const parsedOffset = offset ? parseInt(offset as string, 10) : 0;

      const result = await this.eventRepository.getEventsByLocation(location, parsedLimit, parsedOffset);
      
      res.json({
        success: true,
        data: result.events,
        pagination: {
          total: result.total,
          limit: parsedLimit,
          offset: parsedOffset,
          hasMore: parsedOffset + result.events.length < result.total
        }
      });
    } catch (error) {
      console.error('Error filtering events by location:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to filter events by location',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/events/filter/tags?tags=id1,id2,id3 - Filter by tags
  async getEventsByTags(req: Request, res: Response): Promise<void> {
    try {
      const { tags, limit, offset } = req.query;
      
      if (!tags || typeof tags !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Tags are required (comma-separated tag IDs)'
        });
        return;
      }

      const tagIds = tags.split(',').map(id => id.trim()).filter(id => id.length > 0);
      
      if (tagIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'At least one valid tag ID is required'
        });
        return;
      }

      const parsedLimit = limit ? parseInt(limit as string, 10) : 50;
      const parsedOffset = offset ? parseInt(offset as string, 10) : 0;

      const result = await this.eventRepository.getEventsByTags(tagIds, parsedLimit, parsedOffset);
      
      res.json({
        success: true,
        data: result.events,
        pagination: {
          total: result.total,
          limit: parsedLimit,
          offset: parsedOffset,
          hasMore: parsedOffset + result.events.length < result.total
        }
      });
    } catch (error) {
      console.error('Error filtering events by tags:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to filter events by tags',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}