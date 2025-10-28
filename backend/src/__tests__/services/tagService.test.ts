import { TagService } from '../../services/tagService';
import { testDb } from '../setup';
import { tags, events, eventTags } from '../../db/schema';
import { NewTag } from '../../types/tag';

describe('TagService', () => {
  describe('createTag', () => {
    it('should create a new tag successfully', async () => {
      const tagData: NewTag = {
        name: 'Technology',
        color: '#FF5733'
      };

      const result = await TagService.createTag(tagData);

      expect(result).toBeDefined();
      expect(result.name).toBe(tagData.name);
      expect(result.color).toBe(tagData.color);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should create a tag with valid hex color', async () => {
      const tagData: NewTag = {
        name: 'Business',
        color: '#33FF57'
      };

      const result = await TagService.createTag(tagData);

      expect(result).toBeDefined();
      expect(result.name).toBe(tagData.name);
      expect(result.color).toBe(tagData.color);
    });
  });

  describe('getTagById', () => {
    it('should return a tag by ID', async () => {
      // Create a test tag
      const tagData: NewTag = {
        name: 'Test Tag',
        color: '#FF5733'
      };
      const [createdTag] = await testDb.insert(tags).values(tagData).returning();

      const result = await TagService.getTagById(createdTag.id);

      expect(result).toBeDefined();
      expect(result!.id).toBe(createdTag.id);
      expect(result!.name).toBe(tagData.name);
      expect(result!.color).toBe(tagData.color);
    });

    it('should return null for non-existent tag ID', async () => {
      const result = await TagService.getTagById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('getAllTags', () => {
    it('should return all tags', async () => {
      // Create test tags
      const tagData1: NewTag = {
        name: 'Tag 1',
        color: '#FF5733'
      };
      const tagData2: NewTag = {
        name: 'Tag 2',
        color: '#33FF57'
      };

      await testDb.insert(tags).values([tagData1, tagData2]);

      const result = await TagService.getAllTags();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Tag 2'); // Should be ordered by createdAt desc
      expect(result[1].name).toBe('Tag 1');
    });

    it('should return empty array when no tags exist', async () => {
      const result = await TagService.getAllTags();
      expect(result).toHaveLength(0);
    });
  });

  describe('updateTag', () => {
    it('should update an existing tag', async () => {
      // Create a test tag
      const tagData: NewTag = {
        name: 'Original Name',
        color: '#FF5733'
      };
      const [createdTag] = await testDb.insert(tags).values(tagData).returning();

      const updateData = {
        name: 'Updated Name',
        color: '#33FF57'
      };

      const result = await TagService.updateTag(createdTag.id, updateData);

      expect(result).toBeDefined();
      expect(result!.name).toBe(updateData.name);
      expect(result!.color).toBe(updateData.color);
      expect(result!.id).toBe(createdTag.id);
    });

    it('should return null for non-existent tag ID', async () => {
      const result = await TagService.updateTag('non-existent-id', {
        name: 'Updated Name'
      });
      expect(result).toBeNull();
    });
  });

  describe('deleteTag', () => {
    it('should delete an existing tag', async () => {
      // Create a test tag
      const tagData: NewTag = {
        name: 'Tag to Delete',
        color: '#FF5733'
      };
      const [createdTag] = await testDb.insert(tags).values(tagData).returning();

      const result = await TagService.deleteTag(createdTag.id);

      expect(result).toBe(true);

      // Verify tag is deleted
      const deletedTag = await TagService.getTagById(createdTag.id);
      expect(deletedTag).toBeNull();
    });

    it('should return false for non-existent tag ID', async () => {
      const result = await TagService.deleteTag('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('getEventsForTag', () => {
    beforeEach(async () => {
      // Create test tags and events
      const [tag] = await testDb.insert(tags).values({
        name: 'Test Tag',
        color: '#FF5733'
      }).returning();

      const [event1] = await testDb.insert(events).values({
        title: 'Event 1',
        date: new Date('2024-12-31T18:00:00Z')
      }).returning();

      const [event2] = await testDb.insert(events).values({
        title: 'Event 2',
        date: new Date('2024-12-25T18:00:00Z')
      }).returning();

      // Add tag to events
      await testDb.insert(eventTags).values([
        { eventId: event1.id, tagId: tag.id },
        { eventId: event2.id, tagId: tag.id }
      ]);
    });

    it('should return events for a specific tag', async () => {
      const allTags = await TagService.getAllTags();
      const tagId = allTags[0].id;

      const result = await TagService.getEventsForTag(tagId);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Event 1'); // Should be ordered by date desc
      expect(result[1].title).toBe('Event 2');
    });

    it('should return empty array for tag with no events', async () => {
      const [tag] = await testDb.insert(tags).values({
        name: 'Tag with No Events',
        color: '#FF5733'
      }).returning();

      const result = await TagService.getEventsForTag(tag.id);
      expect(result).toHaveLength(0);
    });
  });

  describe('tagNameExists', () => {
    beforeEach(async () => {
      // Create a test tag
      await testDb.insert(tags).values({
        name: 'Existing Tag',
        color: '#FF5733'
      });
    });

    it('should return true for existing tag name', async () => {
      const result = await TagService.tagNameExists('Existing Tag');
      expect(result).toBe(true);
    });

    it('should return false for non-existing tag name', async () => {
      const result = await TagService.tagNameExists('Non Existing Tag');
      expect(result).toBe(false);
    });

    it('should exclude tag ID when checking for updates', async () => {
      const allTags = await TagService.getAllTags();
      const tagId = allTags[0].id;

      const result = await TagService.tagNameExists('Existing Tag', tagId);
      expect(result).toBe(false); // Should return false because it's the same tag
    });

    it('should return true for duplicate tag name from different tag', async () => {
      const allTags = await TagService.getAllTags();
      const tagId = allTags[0].id;

      // Create another tag with same name
      await testDb.insert(tags).values({
        name: 'Existing Tag',
        color: '#33FF57'
      });

      const result = await TagService.tagNameExists('Existing Tag', tagId);
      expect(result).toBe(true); // Should return true because another tag has this name
    });
  });
});
