import { useState } from 'react';
import { LeafletPicker } from '../map';
import { geocodeWithFallback, resolvePendingGeocode, rejectPendingGeocode } from '../../utils/geocodeWithFallback';

export function LocationPickerWithFallback() {
  const [showLeaflet, setShowLeaflet] = useState(false);
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGeocode = async () => {
    if (!address.trim()) return;

    setLoading(true);

    try {
      const result = await geocodeWithFallback(address, () => {
        setShowLeaflet(true);
      });

      if (result) {
        setCoordinates(result);
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeafletConfirm = (coords: { lat: number; lng: number }) => {
    setCoordinates(coords);
    setShowLeaflet(false);
    resolvePendingGeocode(coords);
  };

  const handleLeafletClose = () => {
    setShowLeaflet(false);
    rejectPendingGeocode(new Error('User cancelled location selection'));
  };

  return (
    <div>
      <h2>Location Picker with Leaflet Fallback</h2>
      
      <div>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter address"
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button onClick={handleGeocode} disabled={loading}>
          {loading ? 'Searching...' : 'Find Location'}
        </button>
      </div>

      {coordinates && (
        <div style={{ marginTop: '20px' }}>
          <h3>Selected Location:</h3>
          <p>Latitude: {coordinates.lat.toFixed(6)}</p>
          <p>Longitude: {coordinates.lng.toFixed(6)}</p>
        </div>
      )}

      <LeafletPicker
        open={showLeaflet}
        onClose={handleLeafletClose}
        onConfirm={handleLeafletConfirm}
        initialAddress={address}
      />
    </div>
  );
}
