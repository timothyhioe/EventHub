import { db, eventTags, eventParticipants } from '../db';
import { eq, and } from 'drizzle-orm';

export class RelationshipService {
  // Add tag to event
  static async addTagToEvent(eventId: string, tagId: string): Promise<boolean> {
    try {
      await db.insert(eventTags).values({
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
  static async removeTagFromEvent(eventId: string, tagId: string): Promise<boolean> {
    const result = await db
      .delete(eventTags)
      .where(and(
        eq(eventTags.eventId, eventId),
        eq(eventTags.tagId, tagId)
      ));
    
    return result.length > 0;
  }

  // Add participant to event
  static async addParticipantToEvent(eventId: string, participantId: string): Promise<boolean> {
    try {
      await db.insert(eventParticipants).values({
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
  static async removeParticipantFromEvent(eventId: string, participantId: string): Promise<boolean> {
    const result = await db
      .delete(eventParticipants)
      .where(and(
        eq(eventParticipants.eventId, eventId),
        eq(eventParticipants.participantId, participantId)
      ));
    
    return result.length > 0;
  }

  // Check if tag is already associated with event
  static async isTagAssociatedWithEvent(eventId: string, tagId: string): Promise<boolean> {
    const result = await db
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
  static async isParticipantAssociatedWithEvent(eventId: string, participantId: string): Promise<boolean> {
    const result = await db
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
