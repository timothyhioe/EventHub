import { Router } from 'express';
import { TagController } from '../controllers/tagController';

const router = Router();

// GET /api/tags - Get all tags
router.get('/', TagController.getAllTags);

// GET /api/tags/:id - Get single tag
router.get('/:id', TagController.getTagById);

// POST /api/tags - Create new tag
router.post('/', TagController.createTag);

// PUT /api/tags/:id - Update tag
router.put('/:id', TagController.updateTag);

// DELETE /api/tags/:id - Delete tag
router.delete('/:id', TagController.deleteTag);

// GET /api/tags/:id/events - Get all events for a tag
router.get('/:id/events', TagController.getEventsForTag);

export default router;
