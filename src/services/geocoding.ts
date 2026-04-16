// Geocoding service for frontend
interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'StaffSync/1.0 (contact@staffsynctech.co.uk)'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error('No results found for address');
    }

    const result = data[0];
    const [longitude, latitude] = result.centroid.coordinates;

    // Construct formatted address from address components
    const addressComponents = result.address
      .filter((addr: any) => addr.isaddress)
      .map((addr: any) => addr.localname)
      .reverse();

    const formattedAddress = addressComponents.join(', ');

    return {
      latitude,
      longitude,
      formattedAddress
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}
