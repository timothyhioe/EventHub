import { db } from './db';
import { EventRepository } from './db/repository/event.repository';
import { ParticipantRepository } from './db/repository/participant.repository';
import { TagRepository } from './db/repository/tag.repository';
import { RelationshipRepository } from './db/repository/relationship.repository';
import { EventController } from './controllers/eventController';
import { ParticipantController } from './controllers/participantController';
import { TagController } from './controllers/tagController';
import { EventRoutes } from './routes/eventRoutes';
import { ParticipantRoutes } from './routes/participantRoutes';
import { TagRoutes } from './routes/tagRoutes';
import { App } from './app';
import { Server } from './server';
import { ENV } from './config/env.config';
import { GeocodingController } from './controllers/geocodingController';
import { GeocodingRoutes } from './routes/geocodingRoutes';

export const DI = {} as {
    app: App;
    db: typeof db;
    server: Server;
    repositories: {
        eventRepository: EventRepository;
        participantRepository: ParticipantRepository;
        tagRepository: TagRepository;
        relationshipRepository: RelationshipRepository;
    };
    controllers: {
        eventController: EventController;
        participantController: ParticipantController;
        tagController: TagController;
        geocodingController: GeocodingController;
    };
    routes: {
        eventRoutes: EventRoutes;
        participantRoutes: ParticipantRoutes;
        tagRoutes: TagRoutes;
        geocodingRoutes: GeocodingRoutes;
    };
}

export function initializeDependencyInjection() {
    DI.db = db;

    DI.repositories = {
        eventRepository: new EventRepository(DI.db),
        participantRepository: new ParticipantRepository(DI.db),
        tagRepository: new TagRepository(DI.db),
        relationshipRepository: new RelationshipRepository(DI.db),
    };

    DI.controllers = {
        eventController: new EventController(
            DI.repositories.eventRepository,
            DI.repositories.relationshipRepository
        ),
        participantController: new ParticipantController(
            DI.repositories.participantRepository
        ),
        tagController: new TagController(
            DI.repositories.tagRepository
        ),
        geocodingController: new GeocodingController(),
    };

    DI.routes = {
        eventRoutes: new EventRoutes(DI.controllers.eventController),
        participantRoutes: new ParticipantRoutes(DI.controllers.participantController),
        tagRoutes: new TagRoutes(DI.controllers.tagController),
        geocodingRoutes: new GeocodingRoutes(DI.controllers.geocodingController),
    };

    DI.app = new App(DI.routes);
    DI.server = new Server(DI.app, ENV);
}
