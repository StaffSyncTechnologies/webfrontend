// Frontend Geocoding Service
// Use this in your web app to geocode addresses before sending to backend

export class FrontendGeocodingService {
  private static readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
  private static readonly USER_AGENT = 'StaffSync/1.0 (staffsync@example.com)';

  /**
   * Geocode address in browser
   */
  static async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    if (!address || !address.trim()) {
      return null;
    }

    try {
      const response = await fetch(
        `${this.NOMINATIM_BASE_URL}?format=json&q=${encodeURIComponent(address.trim())}&limit=1`,
        {
          headers: {
            'User-Agent': this.USER_AGENT,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('Geocoding failed:', response.status);
        return null;
      }

      const data = await response.json() as any[];

      if (!data || data.length === 0) {
        console.log('No results found for address:', address);
        return null;
      }

      const result = data[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);

      if (isNaN(lat) || isNaN(lng)) {
        console.error('Invalid coordinates:', result);
        return null;
      }

      console.log('✅ Browser geocoded:', { address, lat, lng });
      return { lat, lng };
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Get coordinates for shift location (with fallback)
   */
  static async getShiftCoordinates(siteLocation: string, fallbackLat?: number, fallbackLng?: number): Promise<{ lat: number; lng: number }> {
    // Try to geocode
    const coordinates = await this.geocodeAddress(siteLocation);
    
    if (coordinates) {
      return coordinates;
    }
    
    // Fallback to provided coordinates or London defaults
    return {
      lat: fallbackLat || 51.5074,
      lng: fallbackLng || -0.1278
    };
  }
}

// Usage example:
export const updateShiftWithCoordinates = async (shiftId: string, siteLocation: string, token: string) => {
  // Geocode in browser first
  const coordinates = await FrontendGeocodingService.geocodeAddress(siteLocation);
  
  if (!coordinates) {
    console.error('Failed to geocode address');
    return null;
  }
  
  // Send to backend with coordinates
  const response = await fetch(`https://backend-rp5c.onrender.com/api/v1/shifts/${shiftId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      siteLocation,
      siteLat: coordinates.lat,
      siteLng: coordinates.lng
    })
  });
  
  return response.json();
};
