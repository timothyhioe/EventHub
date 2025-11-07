import { ENV } from '../config/env.config';

export class ImageService {
    static async fetchImageForEvent(query: string): Promise<string | null> {
        if (!ENV.UNSPLASH_ACCESS_KEY) return null;

        try {
            const response = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${ENV.UNSPLASH_ACCESS_KEY}`);
            if (!response.ok) return null;
            const data = await response.json() as { urls?: { regular?: string } };
            return data.urls?.regular || null;
        } catch (error) {
            console.error('Unsplash fetch failed:', error);
            return null;
        }
    }
}