import { Request, Response } from 'express';
import { ParticipantRepository } from '../db/repository/participant.repository';
import { CreateParticipantRequest, UpdateParticipantRequest } from '../types/participant';

export class ParticipantController {
  constructor(private participantRepository: ParticipantRepository) {}
  // GET /api/participants - Get all participants
  async getAllParticipants(req: Request, res: Response): Promise<void> {
    try {
      const participants = await this.participantRepository.getAllParticipants();
      
      res.json({
        success: true,
        data: participants,
        count: participants.length
      });
    } catch (error) {
      console.error('Error fetching participants:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch participants',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/participants/:id - Get single participant
  async getParticipantById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Participant ID is required'
        });
        return;
      }

      const participant = await this.participantRepository.getParticipantById(id);
      
      if (!participant) {
        res.status(404).json({
          success: false,
          message: 'Participant not found'
        });
        return;
      }

      res.json({
        success: true,
        data: participant
      });
    } catch (error) {
      console.error('Error fetching participant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch participant',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // POST /api/participants - Create new participant
  async createParticipant(req: Request, res: Response): Promise<void> {
    try {
      const participantData: CreateParticipantRequest = req.body;
      
      // Validation
      if (!participantData.name || !participantData.email) {
        res.status(400).json({
          success: false,
          message: 'Name and email are required'
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(participantData.email)) {
        res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
        return;
      }

      // Check if email already exists
      const emailExists = await this.participantRepository.emailExists(participantData.email);
      if (emailExists) {
        res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
        return;
      }

      const newParticipant = await this.participantRepository.createParticipant(participantData);
      
      res.status(201).json({
        success: true,
        message: 'Participant created successfully',
        data: newParticipant
      });
    } catch (error) {
      console.error('Error creating participant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create participant',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // PUT /api/participants/:id - Update participant
  async updateParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateParticipantRequest = req.body;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Participant ID is required'
        });
        return;
      }

      // Validate email format if provided
      if (updateData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.email)) {
          res.status(400).json({
            success: false,
            message: 'Please provide a valid email address'
          });
          return;
        }

        // Check if email already exists (for updates)
        const emailExists = await this.participantRepository.emailExists(updateData.email, id);
        if (emailExists) {
          res.status(409).json({
            success: false,
            message: 'Email already exists'
          });
          return;
        }
      }

      const updatedParticipant = await this.participantRepository.updateParticipant(id, updateData);
      
      if (!updatedParticipant) {
        res.status(404).json({
          success: false,
          message: 'Participant not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Participant updated successfully',
        data: updatedParticipant
      });
    } catch (error) {
      console.error('Error updating participant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update participant',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // DELETE /api/participants/:id - Delete participant
  async deleteParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Participant ID is required'
        });
        return;
      }

      const deleted = await this.participantRepository.deleteParticipant(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Participant not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Participant deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting participant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete participant',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/participants/:id/events - Get all events for a participant
  async getEventsForParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Participant ID is required'
        });
        return;
      }

      // Check if participant exists
      const participant = await this.participantRepository.getParticipantById(id);
      if (!participant) {
        res.status(404).json({
          success: false,
          message: 'Participant not found'
        });
        return;
      }

      const events = await this.participantRepository.getEventsForParticipant(id);
      
      res.json({
        success: true,
        data: events,
        count: events.length
      });
    } catch (error) {
      console.error('Error fetching events for participant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events for participant',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
