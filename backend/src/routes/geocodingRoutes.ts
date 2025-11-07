import { Router } from 'express';
import { GeocodingController } from '../controllers/geocodingController';

export class GeocodingRoutes {
    constructor(private geocodingController: GeocodingController) {}

    getRoutes(): Router {
        const router = Router();

        // GET /api/geocoding/search?q=query
        router.get('/search', this.geocodingController.searchLocations.bind(this.geocodingController));

        return router;
    }
}