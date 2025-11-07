import { Request, Response } from 'express';

export class GeocodingController {
    private static readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

    /**
     * Search for location suggestions
     * GET /api/geocoding/search?q=query
     */
    async searchLocations(req: Request, res: Response): Promise<void> {
        try {
        const query = req.query.q as string;

        if (!query || query.trim().length < 2) {
            res.status(200).json({
            success: true,
            data: []
            });
            return;
        }

        const url = new URL(GeocodingController.NOMINATIM_URL);
        url.searchParams.set('q', query.trim());
        url.searchParams.set('format', 'json');
        url.searchParams.set('limit', '7'); 
        url.searchParams.set('addressdetails', '1');
        
        const response = await fetch(url.toString(), {
            headers: {
            'User-Agent': 'EventHub/1.0'
            }
        });

        if (!response.ok) {
            throw new Error('Geocoding API error');
        }

        const data = await response.json();
        
        const suggestions = (Array.isArray(data) ? data : []).map((item: any) => ({
            displayName: item.display_name,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            address: item.address || {}
        }));

        res.status(200).json({
            success: true,
            data: suggestions
        });
        } catch (error) {
        console.error('Error searching locations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search locations',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        }
    }
}