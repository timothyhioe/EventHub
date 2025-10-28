import request from 'supertest';
import { App } from '../../app';
import { EventRoutes } from '../../routes/eventRoutes';
import { ParticipantRoutes } from '../../routes/participantRoutes';
import { TagRoutes } from '../../routes/tagRoutes';
import { EventController } from '../../controllers/eventController';
import { ParticipantController } from '../../controllers/participantController';
import { TagController } from '../../controllers/tagController';
import { EventRepository } from '../../db/repository/event.repository';
import { ParticipantRepository } from '../../db/repository/participant.repository';
import { TagRepository } from '../../db/repository/tag.repository';
import { RelationshipRepository } from '../../db/repository/relationship.repository';
import { testDb } from '../setup';

export function createTestApp() {
  // Create repositories with test database
  const eventRepository = new EventRepository(testDb);
  const participantRepository = new ParticipantRepository(testDb);
  const tagRepository = new TagRepository(testDb);
  const relationshipRepository = new RelationshipRepository(testDb);

  // Create controllers
  const eventController = new EventController(eventRepository, relationshipRepository);
  const participantController = new ParticipantController(participantRepository);
  const tagController = new TagController(tagRepository);

  // Create routes
  const eventRoutes = new EventRoutes(eventController);
  const participantRoutes = new ParticipantRoutes(participantController);
  const tagRoutes = new TagRoutes(tagController);

  // Create app
  const app = new App({
    eventRoutes,
    participantRoutes,
    tagRoutes
  });

  return app.app;
}
