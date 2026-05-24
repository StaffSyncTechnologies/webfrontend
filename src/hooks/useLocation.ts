import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  isLoading: boolean;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    isLoading: false,
  });
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      return granted;
    } catch {
      setHasPermission(false);
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          setState((prev) => ({ ...prev, isLoading: false, error: 'Location permission denied' }));
          return null;
        }
      }

      const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
        new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('Location timeout')), ms);
          promise.then((v) => { clearTimeout(timer); resolve(v); }).catch((e) => { clearTimeout(timer); reject(e); });
        });

      let location: Location.LocationObject;
      try {
        location = await withTimeout(
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          10000
        );
      } catch {
        location = await withTimeout(
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
          8000
        );
      }

      const { latitude, longitude, accuracy } = location.coords;
      setState({ latitude, longitude, accuracy, error: null, isLoading: false });
      return { latitude, longitude, accuracy };
    } catch (e: any) {
      setState((prev) => ({ ...prev, isLoading: false, error: e.message || 'Failed to get location' }));
      return null;
    }
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return {
    ...state,
    hasPermission,
    requestPermission,
    getCurrentLocation,
  };
}
