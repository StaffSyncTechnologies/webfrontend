/**
 * Geofence utility functions for worker mobile app
 */

// Default geofence radius (fallback if not specified in shift data)
export const DEFAULT_GEOFENCE_RADIUS = 300; // meters

// Haversine formula to calculate distance between two coordinates
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Check if worker is within geofence radius
export function isWithinGeofence(
  workerLat: number,
  workerLng: number,
  siteLat: number,
  siteLng: number,
  radiusMeters: number
): { within: boolean; distance: number } {
  const distance = calculateDistance(workerLat, workerLng, siteLat, siteLng);
  return {
    within: distance <= radiusMeters,
    distance,
  };
}

// Format distance for display
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
