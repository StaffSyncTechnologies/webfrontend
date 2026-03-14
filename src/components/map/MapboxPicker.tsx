import { useEffect, useState } from 'react';
import { Close, Check } from '@mui/icons-material';
import {
  Box,
  styled,
  Modal,
  IconButton,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import mapboxgl from 'mapbox-gl';
import { colors } from '../../utilities/colors';

// Mapbox access token (you should move this to environment variables)
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'your-mapbox-token-here';

const ModalOverlay = styled(Box)({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 9999,
});

const ModalCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  padding: '24px',
  width: '90%',
  maxWidth: '700px',
  maxHeight: '85vh',
  overflowY: 'auto',
  position: 'relative',
  outline: 'none',
});

const ModalClose = styled(IconButton)({
  position: 'absolute',
  top: '16px',
  right: '16px',
});

const ModalTitle = styled(Typography)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '20px',
  fontWeight: 600,
  color: colors.primary.navy,
  marginBottom: '16px',
});

const MapContainer = styled(Box)({
  width: '100%',
  height: '400px',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid #ddd',
  marginTop: '16px',
  position: 'relative',
});

const CoordinatesDisplay = styled(Box)({
  backgroundColor: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: '6px',
  padding: '12px',
  marginTop: '16px',
});

const CoordinateRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
  gap: '12px',
});

const ButtonRow = styled(Box)({
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  marginTop: '20px',
});

const ConfirmButton = styled(Button)({
  backgroundColor: colors.primary.navy,
  color: colors.secondary.white,
  '&:hover': {
    backgroundColor: '#1a2d4a',
  },
});

const CancelButton = styled(Button)({
  backgroundColor: '#f5f5f5',
  color: colors.primary.navy,
  '&:hover': {
    backgroundColor: '#e0e0e0',
  },
});

const ErrorMessage = styled(Box)({
  backgroundColor: '#fee',
  border: '1px solid #fcc',
  borderRadius: '6px',
  padding: '12px',
  marginTop: '16px',
  color: '#c33',
});

export interface MapboxPickerProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (coordinates: { lat: number; lng: number }) => void;
  initialAddress?: string;
  initialCoordinates?: { lat: number; lng: number };
}

export function MapboxPicker({
  open,
  onClose,
  onConfirm,
  initialAddress,
  initialCoordinates,
}: MapboxPickerProps) {
  const [address, setAddress] = useState(initialAddress || '');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
    initialCoordinates || null
  );
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);

  // Default center (Nantwich/Crewe area)
  const defaultCenter: [number, number] = initialCoordinates
    ? [initialCoordinates.lng, initialCoordinates.lat] // Mapbox uses [lng, lat]
    : [-2.5205, 53.0648];

  useEffect(() => {
    setAddress(initialAddress || '');
  }, [initialAddress]);

  useEffect(() => {
    setCoordinates(initialCoordinates || null);
  }, [initialCoordinates]);

  useEffect(() => {
    if (!open || !mapContainer) return;

    // Initialize Mapbox map
    try {
      const mapboxMap = new mapboxgl.Map({
        container: mapContainer,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: defaultCenter,
        zoom: coordinates ? 16 : 13,
      });

      // Add navigation control
      mapboxMap.addControl(new mapboxgl.NavigationControl());

      // Handle map clicks
      mapboxMap.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        setCoordinates({ lat, lng });
      });

      setMap(mapboxMap);
      setMapError(null);

      return () => {
        mapboxMap.remove();
      };
    } catch (error) {
      console.error('Mapbox initialization error:', error);
      setMapError('Failed to load Mapbox. Please check your internet connection and try again.');
    }
  }, [open, mapContainer, defaultCenter, coordinates]);

  // Update marker when coordinates change
  useEffect(() => {
    if (!map || !coordinates) return;

    // Remove existing marker
    if (marker) {
      marker.remove();
    }

    // Add new marker
    const newMarker = new mapboxgl.Marker({
      draggable: true,
    })
      .setLngLat([coordinates.lng, coordinates.lat])
      .addTo(map);

    // Handle marker drag events
    newMarker.on('dragend', () => {
      const lngLat = newMarker.getLngLat();
      setCoordinates({ lat: lngLat.lat, lng: lngLat.lng });
    });

    setMarker(newMarker);

    // Center map on new coordinates
    map.flyTo({
      center: [coordinates.lng, coordinates.lat],
      zoom: 16,
    });

    return () => {
      if (newMarker) {
        newMarker.remove();
      }
    };
  }, [map, coordinates]);

  const handleManualInput = (field: 'lat' | 'lng', value: string) => {
    const num = parseFloat(value);

    if (Number.isNaN(num)) return;

    const newCoords = {
      lat: field === 'lat' ? num : coordinates?.lat ?? defaultCenter[1],
      lng: field === 'lng' ? num : coordinates?.lng ?? defaultCenter[0],
    };

    setCoordinates(newCoords);

    // Update map view if it exists
    if (map) {
      map.flyTo({
        center: [newCoords.lng, newCoords.lat],
        zoom: 16,
      });
    }
  };

  const handleAddressSearch = async () => {
    if (!address.trim() || !map) return;

    try {
      // Use Mapbox Geocoding API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setCoordinates({ lat, lng });
        
        // Fly to the location
        map.flyTo({
          center: [lng, lat],
          zoom: 16,
        });
      } else {
        setMapError('Address not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Address search error:', error);
      setMapError('Failed to search for address. Please try again.');
    }
  };

  const handleConfirm = () => {
    if (!coordinates) return;
    onConfirm(coordinates);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalOverlay>
        <ModalCard>
          <ModalClose onClick={onClose}>
            <Close />
          </ModalClose>

          <ModalTitle>📍 Select Location on Map</ModalTitle>

          <TextField
            fullWidth
            label="Address Search"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address to search"
            margin="normal"
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAddressSearch()}
            helperText="Press Enter to search or click the map to place a pin"
          />

          <MapContainer ref={setMapContainer}>
            {mapError && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  zIndex: 1,
                }}
              >
                <Typography color="error" textAlign="center">
                  {mapError}
                </Typography>
              </Box>
            )}
          </MapContainer>

          <Typography sx={{ mt: 1, fontSize: '13px', color: '#666' }}>
            Click on the map to place a pin, drag the marker to adjust it, or search for an address above.
          </Typography>

          <CoordinatesDisplay>
            <Typography variant="subtitle2" gutterBottom>
              Coordinates
            </Typography>

            <CoordinateRow>
              <span>Latitude</span>
              <TextField
                size="small"
                value={coordinates?.lat.toFixed(6) ?? ''}
                onChange={(e) => handleManualInput('lat', e.target.value)}
                sx={{ width: '160px' }}
                placeholder="0.000000"
              />
            </CoordinateRow>

            <CoordinateRow>
              <span>Longitude</span>
              <TextField
                size="small"
                value={coordinates?.lng.toFixed(6) ?? ''}
                onChange={(e) => handleManualInput('lng', e.target.value)}
                sx={{ width: '160px' }}
                placeholder="0.000000"
              />
            </CoordinateRow>
          </CoordinatesDisplay>

          {mapError && (
            <ErrorMessage>
              <Typography variant="body2">
                {mapError}
              </Typography>
            </ErrorMessage>
          )}

          <ButtonRow>
            <CancelButton onClick={onClose}>Cancel</CancelButton>
            <ConfirmButton
              onClick={handleConfirm}
              disabled={!coordinates}
              startIcon={<Check />}
            >
              Confirm Location
            </ConfirmButton>
          </ButtonRow>
        </ModalCard>
      </ModalOverlay>
    </Modal>
  );
}
