// Simple utility function for geocoding with Leaflet fallback
export async function geocodeWithFallback(
  address: string,
  onFallback: () => void
): Promise<{ lat: number; lng: number }> {
  try {
    // Try Nominatim first
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );

    if (!response.ok) {
      throw new Error('Nominatim API request failed');
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return {
        lat: parseFloat(lat),
        lng: parseFloat(lon),
      };
    } else {
      throw new Error('No results found');
    }
  } catch (error) {
    console.warn('Nominatim geocoding failed, falling back to manual selection:', error);
    
    // Trigger the fallback modal
    onFallback();
    
    // Return a promise that will be resolved by the manual selection
    return new Promise((resolve, reject) => {
      // This promise will be stored and resolved when the user selects a location
      // The calling component should handle storing and resolving this promise
      (window as any).__pendingGeocodePromise = { resolve, reject };
    });
  }
}

// Function to resolve a pending geocode promise
export function resolvePendingGeocode(coords: { lat: number; lng: number }): void {
  const pendingPromise = (window as any).__pendingGeocodePromise;
  if (pendingPromise) {
    pendingPromise.resolve(coords);
    delete (window as any).__pendingGeocodePromise;
  }
}

// Function to reject a pending geocode promise
export function rejectPendingGeocode(error?: Error): void {
  const pendingPromise = (window as any).__pendingGeocodePromise;
  if (pendingPromise) {
    pendingPromise.reject(error || new Error('Geocoding was cancelled'));
    delete (window as any).__pendingGeocodePromise;
  }
}
