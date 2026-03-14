import { useState, useEffect, useRef, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { API_BASE_URL } from '../services/endpoints';

export interface NetworkStatus {
  isConnected: boolean;
  isServerReachable: boolean;
  isOnline: boolean; // true only if both connected AND server reachable
}

const SERVER_CHECK_INTERVAL = 15_000; // 15 seconds
const SERVER_TIMEOUT = 5_000; // 5 second timeout for health check

export function useNetworkStatus(): NetworkStatus {
  const [isConnected, setIsConnected] = useState(true);
  const [isServerReachable, setIsServerReachable] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkServer = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), SERVER_TIMEOUT);

      // Ping the base URL (just needs any response, even 404)
      const baseUrl = API_BASE_URL.replace('/api/v1', '');
      const res = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      setIsServerReachable(true);
    } catch {
      setIsServerReachable(false);
    }
  }, []);

  // Listen for device connectivity changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);

      // If we just reconnected, immediately check server
      if (connected) {
        checkServer();
      } else {
        setIsServerReachable(false);
      }
    });

    return () => unsubscribe();
  }, [checkServer]);

  // Periodically ping server when connected
  useEffect(() => {
    if (isConnected) {
      checkServer(); // Check immediately
      intervalRef.current = setInterval(checkServer, SERVER_CHECK_INTERVAL);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isConnected, checkServer]);

  return {
    isConnected,
    isServerReachable,
    isOnline: isConnected && isServerReachable,
  };
}
