import { Router } from 'express';
import { ParticipantController } from '../controllers/participantController';

const router = Router();

// GET /api/participants - Get all participants
router.get('/', ParticipantController.getAllParticipants);

// GET /api/participants/:id - Get single participant
router.get('/:id', ParticipantController.getParticipantById);

// POST /api/participants - Create new participant
router.post('/', ParticipantController.createParticipant);

// PUT /api/participants/:id - Update participant
router.put('/:id', ParticipantController.updateParticipant);

// DELETE /api/participants/:id - Delete participant
router.delete('/:id', ParticipantController.deleteParticipant);

// GET /api/participants/:id/events - Get all events for a participant
router.get('/:id/events', ParticipantController.getEventsForParticipant);

export default router;
