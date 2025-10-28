import { Router } from 'express';
import { ParticipantController } from '../controllers/participantController';

export class ParticipantRoutes {
  constructor(private participantController: ParticipantController) {}

  getRoutes(): Router {
    const router = Router();

    // GET /api/participants - Get all participants
    router.get('/', this.participantController.getAllParticipants.bind(this.participantController));

    // GET /api/participants/:id - Get single participant
    router.get('/:id', this.participantController.getParticipantById.bind(this.participantController));

    // POST /api/participants - Create new participant
    router.post('/', this.participantController.createParticipant.bind(this.participantController));

    // PUT /api/participants/:id - Update participant
    router.put('/:id', this.participantController.updateParticipant.bind(this.participantController));

    // DELETE /api/participants/:id - Delete participant
    router.delete('/:id', this.participantController.deleteParticipant.bind(this.participantController));

    // GET /api/participants/:id/events - Get all events for a participant
    router.get('/:id/events', this.participantController.getEventsForParticipant.bind(this.participantController));

    return router;
  }
}