import { db, eventTags, eventParticipants } from '../index';
import { eq, and } from 'drizzle-orm';
export class RelationshipRepository {
  constructor(private database: typeof db) {}

  // Add tag to event
  async addTagToEvent(eventId: string, tagId: string): Promise<boolean> {
    try {
      await this.database.insert(eventTags).values({
        eventId,
        tagId
      });
      return true;
    } catch (error) {
      // If it's a duplicate key error, the relationship already exists
      if (error instanceof Error && error.message.includes('duplicate key')) {
        return false; // Relationship already exists
      }
      throw error;
    }
  }

  // Remove tag from event
  async removeTagFromEvent(eventId: string, tagId: string): Promise<boolean> {
    const result = await this.database
      .delete(eventTags)
      .where(and(
        eq(eventTags.eventId, eventId),
        eq(eventTags.tagId, tagId)
      ))
      .returning({
        eventId: eventTags.eventId,
        tagId: eventTags.tagId
      });
    
    return result.length > 0;
  }

  // Add participant to event
  async addParticipantToEvent(eventId: string, participantId: string): Promise<boolean> {
    try {
      await this.database.insert(eventParticipants).values({
        eventId,
        participantId
      });
      return true;
    } catch (error) {
      // If it's a duplicate key error, the relationship already exists
      if (error instanceof Error && error.message.includes('duplicate key')) {
        return false; // Relationship already exists
      }
      throw error;
    }
  }

  // Remove participant from event
  async removeParticipantFromEvent(eventId: string, participantId: string): Promise<boolean> {
    const result = await this.database
      .delete(eventParticipants)
      .where(and(
        eq(eventParticipants.eventId, eventId),
        eq(eventParticipants.participantId, participantId)
      ))
      .returning({
        eventId: eventParticipants.eventId,
        participantId: eventParticipants.participantId
      });
    
    return result.length > 0;
  }

  // Check if tag is already associated with event
  async isTagAssociatedWithEvent(eventId: string, tagId: string): Promise<boolean> {
    const result = await this.database
      .select()
      .from(eventTags)
      .where(and(
        eq(eventTags.eventId, eventId),
        eq(eventTags.tagId, tagId)
      ))
      .limit(1);
    
    return result.length > 0;
  }

  // Check if participant is already associated with event
  async isParticipantAssociatedWithEvent(eventId: string, participantId: string): Promise<boolean> {
    const result = await this.database
      .select()
      .from(eventParticipants)
      .where(and(
        eq(eventParticipants.eventId, eventId),
        eq(eventParticipants.participantId, participantId)
      ))
      .limit(1);
    
    return result.length > 0;
  }
}
