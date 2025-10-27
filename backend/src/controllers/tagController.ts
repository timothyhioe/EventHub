import { Request, Response } from 'express';
import { TagService } from '../services/tagService';
import { CreateTagRequest, UpdateTagRequest } from '../types/tag';

export class TagController {
  // GET /api/tags - Get all tags
  static async getAllTags(req: Request, res: Response): Promise<void> {
    try {
      const tags = await TagService.getAllTags();
      
      res.json({
        success: true,
        data: tags,
        count: tags.length
      });
    } catch (error) {
      console.error('Error fetching tags:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tags',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/tags/:id - Get single tag
  static async getTagById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Tag ID is required'
        });
        return;
      }

      const tag = await TagService.getTagById(id);
      
      if (!tag) {
        res.status(404).json({
          success: false,
          message: 'Tag not found'
        });
        return;
      }

      res.json({
        success: true,
        data: tag
      });
    } catch (error) {
      console.error('Error fetching tag:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tag',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // POST /api/tags - Create new tag
  static async createTag(req: Request, res: Response): Promise<void> {
    try {
      const tagData: CreateTagRequest = req.body;
      
      // Validation
      if (!tagData.name || !tagData.color) {
        res.status(400).json({
          success: false,
          message: 'Name and color are required'
        });
        return;
      }

      // Validate color format (hex color)
      const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!colorRegex.test(tagData.color)) {
        res.status(400).json({
          success: false,
          message: 'Color must be a valid hex color (e.g., #FF5733)'
        });
        return;
      }

      // Check if tag name already exists
      const nameExists = await TagService.tagNameExists(tagData.name);
      if (nameExists) {
        res.status(409).json({
          success: false,
          message: 'Tag name already exists'
        });
        return;
      }

      const newTag = await TagService.createTag(tagData);
      
      res.status(201).json({
        success: true,
        message: 'Tag created successfully',
        data: newTag
      });
    } catch (error) {
      console.error('Error creating tag:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create tag',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // PUT /api/tags/:id - Update tag
  static async updateTag(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateTagRequest = req.body;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Tag ID is required'
        });
        return;
      }

      // Validate color format if provided
      if (updateData.color) {
        const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!colorRegex.test(updateData.color)) {
          res.status(400).json({
            success: false,
            message: 'Color must be a valid hex color (e.g., #FF5733)'
          });
          return;
        }
      }

      // Check if tag name already exists (for updates)
      if (updateData.name) {
        const nameExists = await TagService.tagNameExists(updateData.name, id);
        if (nameExists) {
          res.status(409).json({
            success: false,
            message: 'Tag name already exists'
          });
          return;
        }
      }

      const updatedTag = await TagService.updateTag(id, updateData);
      
      if (!updatedTag) {
        res.status(404).json({
          success: false,
          message: 'Tag not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Tag updated successfully',
        data: updatedTag
      });
    } catch (error) {
      console.error('Error updating tag:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update tag',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // DELETE /api/tags/:id - Delete tag
  static async deleteTag(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Tag ID is required'
        });
        return;
      }

      const deleted = await TagService.deleteTag(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Tag not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Tag deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting tag:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete tag',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/tags/:id/events - Get all events for a tag
  static async getEventsForTag(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Tag ID is required'
        });
        return;
      }

      // Check if tag exists
      const tag = await TagService.getTagById(id);
      if (!tag) {
        res.status(404).json({
          success: false,
          message: 'Tag not found'
        });
        return;
      }

      const events = await TagService.getEventsForTag(id);
      
      res.json({
        success: true,
        data: events,
        count: events.length
      });
    } catch (error) {
      console.error('Error fetching events for tag:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events for tag',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
