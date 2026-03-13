# Geofence Toast Alert Feature

## Overview
This feature adds real-time geofence checking to the worker mobile app, alerting workers when they are more than 300 meters away from their assigned work site.

## Implementation Details

### Files Modified/Created:
1. **`src/utils/geofence.ts`** - New utility functions for distance calculations
2. **`src/screens/ClockInScreen.tsx`** - Enhanced with geofence checking and Toast alerts
3. **`src/contexts/ToastContext.tsx`** - Existing Toast system (leveraged for alerts)

### Key Features:

#### 1. Real-time Location Checking
- Automatically checks worker's GPS location when on ClockInScreen
- Uses Haversine formula for accurate distance calculations
- Updates geofence status in real-time

#### 2. Visual Feedback
- **GPS Banner**: Shows current location status
  - Green: Within geofence (✓ GPS Verified)
  - Red: Outside geofence (✗ Too Far + distance)
  - Gray: Checking location/Location unavailable

#### 3. Toast Alerts
- **Warning Toast**: Shows when worker is outside 300m radius
- **Block Alert**: Prevents clock-in when outside geofence
- **Duration**: 5 seconds for initial warning, 4 seconds for block alert
- **Haptic Feedback**: Vibration for better user experience

#### 4. Clock-in Prevention
- **Disabled Button**: Clock-in button becomes grayed out when outside geofence
- **Visual State**: Button shows "OUT OF RANGE" instead of "CLOCK IN"
- **Helper Text**: Shows distance requirement below button

### Technical Implementation:

#### Distance Calculation (Haversine Formula)
```typescript
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth's radius in meters
  // ... calculation logic
  return distance in meters;
}
```

#### Geofence Check
```typescript
function isWithinGeofence(workerLat, workerLng, siteLat, siteLng, radiusMeters) {
  const distance = calculateDistance(workerLat, workerLng, siteLat, siteLng);
  return {
    within: distance <= radiusMeters,
    distance
  };
}
```

#### Dynamic Radius Configuration
```typescript
// Radius comes from shift data, with fallback to default
const geofenceRadius = shift.geofenceRadius || DEFAULT_GEOFENCE_RADIUS;
```

#### Toast Integration
```typescript
const { warning } = useToast();

// Show warning when outside geofence
warning(
  `You are ${formatDistance(distance)} away from the work site. Please move within 300m to clock in.`,
  { duration: 5000, vibrate: true }
);
```

### User Experience Flow:

1. **Worker opens ClockInScreen**
2. **App requests GPS permission** (if not already granted)
3. **App gets current location** using high-accuracy GPS
4. **Geofence check runs automatically**
5. **Visual feedback updates** based on location status
6. **Toast alerts show** if outside geofence
7. **Clock-in button disabled** when outside range
8. **Worker must move within the required distance** (from shift geofence radius) to enable clock-in

### Configuration:
- **Dynamic Radius**: Comes from shift data (`shift.geofenceRadius`)
- **Default Fallback**: 300 meters (`DEFAULT_GEOFENCE_RADIUS`)
- **GPS Accuracy**: High accuracy mode
- **Toast Duration**: 5 seconds warning, 4 seconds block
- **Update Frequency**: Real-time when location changes

### Future Enhancements:
1. **Configurable Radius**: Per-shift geofence settings from backend
2. **Background Location**: Continuous location tracking during shifts
3. **Geofence History**: Log of location violations
4. **Smart Notifications**: Proximity alerts when approaching work site
5. **Offline Support**: Cached location data for poor GPS areas

### Testing Notes:
- Mock coordinates used in development (London: 51.5074, -0.1278)
- Real app should use actual shift coordinates from backend API
- Test with different GPS scenarios (indoors, outdoors, poor signal)
- Verify Toast behavior on both iOS and Android

### Error Handling:
- Graceful fallback when GPS unavailable
- Clear error messages for location permission denied
- Retry mechanism for failed location requests
- Timeout handling for slow GPS responses
