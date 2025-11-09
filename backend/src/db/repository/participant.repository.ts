import { db, participants, events, eventParticipants } from '../index';
import { NewParticipant, UpdateParticipant, ParticipantResponse } from '../../types/participant';
import { eq, desc } from 'drizzle-orm';
export class ParticipantRepository {
  constructor(private database: typeof db) {}

  // Get all participants
  async getAllParticipants(): Promise<ParticipantResponse[]> {
    return await this.database.select().from(participants).orderBy(desc(participants.createdAt));
  }

  // Get single participant by ID
  async getParticipantById(id: string): Promise<ParticipantResponse | null> {
    const participantResult = await this.database
      .select()
      .from(participants)
      .where(eq(participants.id, id))
      .limit(1);

    const participant = participantResult[0];
    if (!participant) {
      return null;
    }

    const eventsForParticipant = await this.getEventsForParticipant(id);

    return {
      ...participant,
      events: eventsForParticipant,
    };
  }

  // Create new participant
  async createParticipant(participantData: NewParticipant): Promise<ParticipantResponse> {
    const [newParticipant] = await this.database.insert(participants).values(participantData).returning();
    return newParticipant;
  }

  // Update participant
  async updateParticipant(id: string, participantData: UpdateParticipant): Promise<ParticipantResponse | null> {
    const [updatedParticipant] = await this.database
      .update(participants)
      .set({ ...participantData, updatedAt: new Date() })
      .where(eq(participants.id, id))
      .returning();
    
    return updatedParticipant || null;
  }

  // Delete participant
  async deleteParticipant(id: string): Promise<boolean> {
    try {
      // Delete and return the deleted row(s) to verify deletion
      const result = await this.database
        .delete(participants)
        .where(eq(participants.id, id))
        .returning();
      
      // If result has items, deletion was successful
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting participant:', error);
      throw error;
    }
  }

  // Get all events for a specific participant
  async getEventsForParticipant(participantId: string): Promise<Array<{ id: string; title: string; date: string; location: string | null }>> {
    const result = await this.database
      .select({
        id: events.id,
        title: events.title,
        date: events.date,
        location: events.location,
      })
      .from(events)
      .innerJoin(eventParticipants, eq(events.id, eventParticipants.eventId))
      .where(eq(eventParticipants.participantId, participantId))
      .orderBy(desc(events.date));

    return result.map(event => ({
      ...event,
      date: event.date instanceof Date ? event.date.toISOString() : event.date,
    }));
  }

  // Check if email already exists
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const query = this.database.select().from(participants).where(eq(participants.email, email));
    
    if (excludeId) {
      // For updates, exclude the current participant
      const result = await query;
      return result.some(participant => participant.id !== excludeId);
    }
    
    const result = await query;
    return result.length > 0;
  }
}
