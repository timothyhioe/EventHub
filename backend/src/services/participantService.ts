import { db, participants, events, eventParticipants } from '../db';
import { NewParticipant, UpdateParticipant, ParticipantResponse } from '../types/participant';
import { eq, desc } from 'drizzle-orm';

export class ParticipantService {
  // Get all participants
  static async getAllParticipants(): Promise<ParticipantResponse[]> {
    return await db.select().from(participants).orderBy(desc(participants.createdAt));
  }

  // Get single participant by ID
  static async getParticipantById(id: string): Promise<ParticipantResponse | null> {
    const participant = await db.select().from(participants).where(eq(participants.id, id)).limit(1);
    return participant[0] || null;
  }

  // Create new participant
  static async createParticipant(participantData: NewParticipant): Promise<ParticipantResponse> {
    const [newParticipant] = await db.insert(participants).values(participantData).returning();
    return newParticipant;
  }

  // Update participant
  static async updateParticipant(id: string, participantData: UpdateParticipant): Promise<ParticipantResponse | null> {
    const [updatedParticipant] = await db
      .update(participants)
      .set({ ...participantData, updatedAt: new Date() })
      .where(eq(participants.id, id))
      .returning();
    
    return updatedParticipant || null;
  }

  // Delete participant
  static async deleteParticipant(id: string): Promise<boolean> {
    try {
      // First check if the participant exists
      const existingParticipant = await db.select().from(participants).where(eq(participants.id, id)).limit(1);
      if (existingParticipant.length === 0) {
        return false; // Participant doesn't exist
      }
      
      // Delete the participant
      await db.delete(participants).where(eq(participants.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get all events for a specific participant
  static async getEventsForParticipant(participantId: string): Promise<Array<{ id: string; title: string; date: Date }>> {
    const result = await db
      .select({
        id: events.id,
        title: events.title,
        date: events.date
      })
      .from(events)
      .innerJoin(eventParticipants, eq(events.id, eventParticipants.eventId))
      .where(eq(eventParticipants.participantId, participantId))
      .orderBy(desc(events.date));

    return result;
  }

  // Check if email already exists
  static async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const query = db.select().from(participants).where(eq(participants.email, email));
    
    if (excludeId) {
      // For updates, exclude the current participant
      const result = await query;
      return result.some(participant => participant.id !== excludeId);
    }
    
    const result = await query;
    return result.length > 0;
  }
}
