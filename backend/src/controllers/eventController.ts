import { Request, Response } from 'express';
import { EventService } from '../services/eventService';
import { RelationshipService } from '../services/relationshipService';
import { CreateEventRequest, UpdateEventRequest } from '../types/event';
import { AddTagToEventRequest } from '../types/tag';
import { AddParticipantToEventRequest } from '../types/participant';

export class EventController {
  // GET /api/events - Get all events
  static async getAllEvents(req: Request, res: Response): Promise<void> {
    try {
      const { include } = req.query;
      const includeRelations = include === 'true';
      
      const events = await EventService.getAllEvents(includeRelations);
      
      res.json({
        success: true,
        data: events,
        count: events.length
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
  static async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Event ID is required'
        });
        return;
      }

      const event = await EventService.getEventById(id);
      
      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found'
        });
        return;
      }

      res.json({
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
  static async createEvent(req: Request, res: Response): Promise<void> {
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

      // Convert date string to Date object
      const eventToCreate = {
        ...eventData,
        date: new Date(eventData.date)
      };

      const newEvent = await EventService.createEvent(eventToCreate);
      
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
  static async updateEvent(req: Request, res: Response): Promise<void> {
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

      // Convert date string to Date object if provided
      const processedUpdateData: any = { ...updateData };
      if (processedUpdateData.date) {
        processedUpdateData.date = new Date(processedUpdateData.date);
      }

      const updatedEvent = await EventService.updateEvent(id, processedUpdateData);
      
      if (!updatedEvent) {
        res.status(404).json({
          success: false,
          message: 'Event not found'
        });
        return;
      }

      res.json({
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
  static async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Event ID is required'
        });
        return;
      }

      const deleted = await EventService.deleteEvent(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Event not found'
        });
        return;
      }

      res.json({
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
  static async addTagToEvent(req: Request, res: Response): Promise<void> {
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

      // Check if event exists
      const event = await EventService.getEventById(eventId);
      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found'
        });
        return;
      }

      // Check if relationship already exists
      const alreadyAssociated = await RelationshipService.isTagAssociatedWithEvent(eventId, tagId);
      if (alreadyAssociated) {
        res.status(409).json({
          success: false,
          message: 'Tag is already associated with this event'
        });
        return;
      }

      const success = await RelationshipService.addTagToEvent(eventId, tagId);
      
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
  static async removeTagFromEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id: eventId, tagId } = req.params;
      
      if (!eventId || !tagId) {
        res.status(400).json({
          success: false,
          message: 'Event ID and Tag ID are required'
        });
        return;
      }

      const success = await RelationshipService.removeTagFromEvent(eventId, tagId);
      
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
  static async addParticipantToEvent(req: Request, res: Response): Promise<void> {
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

      // Check if event exists
      const event = await EventService.getEventById(eventId);
      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found'
        });
        return;
      }

      // Check if relationship already exists
      const alreadyAssociated = await RelationshipService.isParticipantAssociatedWithEvent(eventId, participantId);
      if (alreadyAssociated) {
        res.status(409).json({
          success: false,
          message: 'Participant is already associated with this event'
        });
        return;
      }

      const success = await RelationshipService.addParticipantToEvent(eventId, participantId);
      
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
  static async removeParticipantFromEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id: eventId, participantId } = req.params;
      
      if (!eventId || !participantId) {
        res.status(400).json({
          success: false,
          message: 'Event ID and Participant ID are required'
        });
        return;
      }

      const success = await RelationshipService.removeParticipantFromEvent(eventId, participantId);
      
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
}