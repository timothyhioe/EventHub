import { Request, Response } from 'express';
import { EventService } from '../services/eventService';
import { CreateEventRequest, UpdateEventRequest } from '../types/event';

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
}