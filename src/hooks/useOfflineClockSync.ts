/**
 * useOfflineClockSync — watches network state and replays queued clock events
 * when the device comes back online.
 *
 * Mount this once in App.tsx (inside AppContent) so it runs globally.
 */

import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { getQueue, dequeue, incrementRetry } from '../services/clockQueueService';

// We import the raw fetch rather than RTK Query so we can call it outside a component
import { API_BASE_URL } from '../services/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@staffsync_auth_token';

async function syncQueue(token: string): Promise<{ synced: number; failed: number }> {
  const queue = await getQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const event of queue) {
    try {
      const res = await fetch(`${API_BASE_URL}/nfc/tap-clock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tagCode: event.tagCode,
          lat: event.lat,
          lng: event.lng,
        }),
        signal: AbortSignal.timeout(10_000),
      });

      if (res.ok) {
        await dequeue(event.id);
        synced++;
      } else if (res.status === 409) {
        // Already clocked in — treat as success, remove from queue
        await dequeue(event.id);
        synced++;
      } else {
        await incrementRetry(event.id);
        failed++;
      }
    } catch {
      await incrementRetry(event.id);
      failed++;
    }
  }

  return { synced, failed };
}

export function useOfflineClockSync() {
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const isConnected = state.isConnected && state.isInternetReachable !== false;
      if (!isConnected || isSyncingRef.current) return;

      const queue = await getQueue();
      if (queue.length === 0) return;

      isSyncingRef.current = true;
      try {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) return;

        const { synced } = await syncQueue(token);
        if (synced > 0) {
          console.log(`[OfflineSync] Synced ${synced} queued clock event(s)`);
        }
      } finally {
        isSyncingRef.current = false;
      }
    });

    return () => unsubscribe();
  }, []);
}
