// backend/src/services/geocodingService.ts
export class GeocodingService {
    private static readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
    
    /**
     * Geocode an address to get latitude and longitude coordinates
     * @param address - The address string to geocode
     * @returns Object with latitude and longitude, or null if geocoding fails
     */
    static async geocodeAddress(
        address: string
        ): Promise<{ latitude: number; longitude: number } | null> {
        // Return null if address is empty or invalid
        if (!address || address.trim().length === 0) {
            return null;
        }
    
        try {
            const url = new URL(this.NOMINATIM_URL);
            url.searchParams.set('q', address.trim());
            url.searchParams.set('format', 'json');
            url.searchParams.set('limit', '1'); //first result
            url.searchParams.set('addressdetails', '1'); //detailed address info
    
            const response = await fetch(url.toString(), {
            headers: {
                'User-Agent': 'EventHub'
            }
            });
    
            if (!response.ok) {
            console.error('Geocoding API error:', response.status, response.statusText);
            return null;
            }
    
            const data = await response.json();
            
            //nominatim returns an array of results
            if (Array.isArray(data) && data.length > 0) {
            const result = data[0];
            const latitude = parseFloat(result.lat);
            const longitude = parseFloat(result.lon);
            
            //coordinates validation
            if (isNaN(latitude) || isNaN(longitude)) {
                console.error('Invalid coordinates received from geocoding API');
                return null;
            }
            
            return { latitude, longitude };
            }
            
            //no results found
            console.warn(`No geocoding results found for address: ${address}`);
            return null;
        } catch (error) {
            console.error('Error geocoding address:', error);
            return null;
        }
        }
}