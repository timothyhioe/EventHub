import { Router } from 'express';
import { TagController } from '../controllers/tagController';

export class TagRoutes {
  constructor(private tagController: TagController) {}

  getRoutes(): Router {
    const router = Router();

    // GET /api/tags - Get all tags
    router.get('/', this.tagController.getAllTags.bind(this.tagController));

    // GET /api/tags/:id - Get single tag
    router.get('/:id', this.tagController.getTagById.bind(this.tagController));

    // POST /api/tags - Create new tag
    router.post('/', this.tagController.createTag.bind(this.tagController));

    // PUT /api/tags/:id - Update tag
    router.put('/:id', this.tagController.updateTag.bind(this.tagController));

    // DELETE /api/tags/:id - Delete tag
    router.delete('/:id', this.tagController.deleteTag.bind(this.tagController));

    // GET /api/tags/:id/events - Get all events for a tag
    router.get('/:id/events', this.tagController.getEventsForTag.bind(this.tagController));

    return router;
  }
}