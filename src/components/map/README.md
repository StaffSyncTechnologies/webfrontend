# Mapbox Location Picker - Fallback for Nominatim API

This implementation provides a Mapbox-based location picker that can be used as a fallback when the Nominatim API fails or is rate-limited.

## Features

- **Interactive Map**: Click to place a marker or drag existing marker
- **Address Search**: Built-in address search using Mapbox Geocoding API
- **Manual Coordinate Entry**: Direct input of latitude/longitude coordinates
- **Fallback Integration**: Seamlessly integrates with existing Nominatim geocoding

## Setup

### 1. Install Dependencies

```bash
npm install mapbox-gl @types/mapbox-gl
```

### 2. Environment Variables

Create a `.env` file in your project root:

```env
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

Get your free Mapbox access token from [https://www.mapbox.com/](https://www.mapbox.com/)

### 3. CSS Import

The Mapbox CSS is already imported in `src/main.tsx`:

```tsx
import 'mapbox-gl/dist/mapbox-gl.css'
```

## Usage

### Basic Mapbox Picker

```tsx
import { useState } from 'react';
import { MapboxPicker } from './components/map';

function MyComponent() {
  const [showPicker, setShowPicker] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const handleConfirm = (coords: { lat: number; lng: number }) => {
    setCoordinates(coords);
    setShowPicker(false);
  };

  return (
    <div>
      <button onClick={() => setShowPicker(true)}>
        Select Location
      </button>

      <MapboxPicker
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onConfirm={handleConfirm}
        initialAddress="123 Main St, City, State"
        initialCoordinates={{ lat: 40.7128, lng: -74.0060 }}
      />
    </div>
  );
}
```

### Fallback Integration with Nominatim

```tsx
import { useState } from 'react';
import { MapboxPicker } from './components/map';
import { geocodeWithFallback, resolvePendingGeocode, rejectPendingGeocode } from './utils/geocodeWithFallback';

function LocationPickerWithFallback() {
  const [showMapbox, setShowMapbox] = useState(false);
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGeocode = async () => {
    if (!address.trim()) return;

    setLoading(true);

    try {
      // Try Nominatim first, fallback to Mapbox if it fails
      const result = await geocodeWithFallback(address, () => {
        setShowMapbox(true);
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

  const handleMapboxConfirm = (coords: { lat: number; lng: number }) => {
    setCoordinates(coords);
    setShowMapbox(false);
    resolvePendingGeocode(coords); // Resolve the pending promise
  };

  const handleMapboxClose = () => {
    setShowMapbox(false);
    rejectPendingGeocode(new Error('User cancelled location selection'));
  };

  return (
    <div>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter address"
      />
      <button onClick={handleGeocode} disabled={loading}>
        {loading ? 'Searching...' : 'Find Location'}
      </button>

      {coordinates && (
        <div>
          <p>Latitude: {coordinates.lat.toFixed(6)}</p>
          <p>Longitude: {coordinates.lng.toFixed(6)}</p>
        </div>
      )}

      <MapboxPicker
        open={showMapbox}
        onClose={handleMapboxClose}
        onConfirm={handleMapboxConfirm}
        initialAddress={address}
      />
    </div>
  );
}
```

## API Reference

### MapboxPicker Props

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Whether the modal is open |
| `onClose` | `() => void` | Called when the modal is closed |
| `onConfirm` | `(coordinates: { lat: number; lng: number }) => void` | Called when user confirms location |
| `initialAddress` | `string` (optional) | Initial address for search |
| `initialCoordinates` | `{ lat: number; lng: number }` (optional) | Initial coordinates to center map |

### Geocoding Fallback Functions

#### `geocodeWithFallback(address, onFallback)`

Attempts to geocode using Nominatim, calls `onFallback` if it fails.

**Parameters:**
- `address: string` - Address to geocode
- `onFallback: () => void` - Function to call when Nominatim fails

**Returns:** `Promise<{ lat: number; lng: number }>`

#### `resolvePendingGeocode(coords)`

Resolves the pending geocode promise when user selects location manually.

**Parameters:**
- `coords: { lat: number; lng: number }` - Selected coordinates

#### `rejectPendingGeocode(error?)`

Rejects the pending geocode promise when user cancels.

**Parameters:**
- `error?: Error` - Optional error message

## Error Handling

The Mapbox picker includes built-in error handling for:

- Network connectivity issues
- Invalid Mapbox access token
- Map loading failures
- Address search failures

Users will see appropriate error messages and can retry the operation.

## Styling

The component uses Material-UI styled components with the existing design system. You can customize the styling by modifying the styled components in `MapboxPicker.tsx`.

## Rate Limiting

- **Nominatim**: Free tier has rate limits (typically 1 request per second)
- **Mapbox**: Free tier includes 100,000 geocoding requests per month
- The fallback system automatically switches to Mapbox when Nominatim fails

## Browser Support

Mapbox GL JS requires WebGL support and works in all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 13+
- Edge 79+

## Troubleshooting

### Map doesn't load
1. Check your Mapbox access token is valid
2. Ensure you have the CSS import
3. Check browser console for WebGL errors

### Address search doesn't work
1. Verify your Mapbox access token has geocoding permissions
2. Check network connectivity
3. Try different search terms

### TypeScript errors
1. Ensure you have `@types/mapbox-gl` installed
2. Check your import paths are correct
