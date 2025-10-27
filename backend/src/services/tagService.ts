import { db, tags, events, eventTags } from '../db';
import { NewTag, UpdateTag, TagResponse } from '../types/tag';
import { eq, desc } from 'drizzle-orm';

export class TagService {
  // Get all tags
  static async getAllTags(): Promise<TagResponse[]> {
    return await db.select().from(tags).orderBy(desc(tags.createdAt));
  }

  // Get single tag by ID
  static async getTagById(id: string): Promise<TagResponse | null> {
    const tag = await db.select().from(tags).where(eq(tags.id, id)).limit(1);
    return tag[0] || null;
  }

  // Create new tag
  static async createTag(tagData: NewTag): Promise<TagResponse> {
    const [newTag] = await db.insert(tags).values(tagData).returning();
    return newTag;
  }

  // Update tag
  static async updateTag(id: string, tagData: UpdateTag): Promise<TagResponse | null> {
    const [updatedTag] = await db
      .update(tags)
      .set({ ...tagData, updatedAt: new Date() })
      .where(eq(tags.id, id))
      .returning();
    
    return updatedTag || null;
  }

  // Delete tag
  static async deleteTag(id: string): Promise<boolean> {
    const result = await db.delete(tags).where(eq(tags.id, id));
    return result.length > 0;
  }

  // Get all events for a specific tag
  static async getEventsForTag(tagId: string): Promise<Array<{ id: string; title: string; date: Date }>> {
    const result = await db
      .select({
        id: events.id,
        title: events.title,
        date: events.date
      })
      .from(events)
      .innerJoin(eventTags, eq(events.id, eventTags.eventId))
      .where(eq(eventTags.tagId, tagId))
      .orderBy(desc(events.date));

    return result;
  }

  // Check if tag name already exists
  static async tagNameExists(name: string, excludeId?: string): Promise<boolean> {
    const query = db.select().from(tags).where(eq(tags.name, name));
    
    if (excludeId) {
      // For updates, exclude the current tag
      const result = await query;
      return result.some(tag => tag.id !== excludeId);
    }
    
    const result = await query;
    return result.length > 0;
  }
}
