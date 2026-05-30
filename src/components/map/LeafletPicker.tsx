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
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { colors } from '../../utilities/colors';
import 'leaflet/dist/leaflet.css';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

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

const MapContainerStyled = styled(Box)({
  width: '100%',
  height: '400px',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid #ddd',
  marginTop: '16px',
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

function ClickHandler({
  onPick,
}: {
  onPick: (coords: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e: any) {
      onPick({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return null;
}

export interface LeafletPickerProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (coordinates: { lat: number; lng: number }) => void;
  initialAddress?: string;
  initialCoordinates?: { lat: number; lng: number };
}

export function LeafletPicker({
  open,
  onClose,
  onConfirm,
  initialAddress,
  initialCoordinates,
}: LeafletPickerProps) {
  const [address, setAddress] = useState(initialAddress || '');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
    initialCoordinates || null
  );
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    setAddress(initialAddress || '');
  }, [initialAddress]);

  useEffect(() => {
    setCoordinates(initialCoordinates || null);
  }, [initialCoordinates]);

  // Default center (Nantwich/Crewe area)
  const defaultCenter: [number, number] = initialCoordinates
    ? [initialCoordinates.lat, initialCoordinates.lng]
    : [53.0648, -2.5205];

  const handleManualInput = (field: 'lat' | 'lng', value: string) => {
    const num = parseFloat(value);

    if (Number.isNaN(num)) return;

    const newCoords = {
      lat: field === 'lat' ? num : coordinates?.lat ?? defaultCenter[0],
      lng: field === 'lng' ? num : coordinates?.lng ?? defaultCenter[1],
    };

    setCoordinates(newCoords);
  };

  const handleAddressSearch = async () => {
    if (!address.trim()) return;

    try {
      // Use Nominatim for address search (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );

      if (!response.ok) {
        throw new Error('Address search failed');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setCoordinates({
          lat: parseFloat(lat),
          lng: parseFloat(lon),
        });
        setMapError(null);
      } else {
        setMapError('Address not found. Please try a different search term or click on the map.');
      }
    } catch (error) {
      console.error('Address search error:', error);
      setMapError('Failed to search for address. Please try again or use the map to select a location.');
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

          <MapContainerStyled>
            <MapContainer
              center={coordinates ? [coordinates.lat, coordinates.lng] : defaultCenter}
              zoom={coordinates ? 16 : 13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <ClickHandler onPick={setCoordinates} />

              {coordinates && (
                <Marker
                  position={[coordinates.lat, coordinates.lng]}
                  icon={markerIcon}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e: any) => {
                      const marker = e.target;
                      const pos = marker.getLatLng();
                      setCoordinates({ lat: pos.lat, lng: pos.lng });
                    },
                  }}
                />
              )}
            </MapContainer>
          </MapContainerStyled>

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
