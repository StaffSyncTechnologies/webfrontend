/**
 * clockQueueService — offline clock-in/out queue
 *
 * When a worker taps NFC or scans a QR code with no network, the attempt is
 * saved here. When the device reconnects, call flushQueue() to replay them
 * against the backend in the order they were recorded.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@staffsync_clock_queue';

export interface QueuedClockEvent {
  id: string;            // uuid generated client-side
  tagCode: string;
  lat?: number;
  lng?: number;
  recordedAt: string;    // ISO timestamp of when the tap happened
  method: 'NFC' | 'QR'; // for display purposes
  retries: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Read / write queue ───────────────────────────────────────────────────────

export async function getQueue(): Promise<QueuedClockEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveQueue(queue: QueuedClockEvent[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Add a failed clock event to the queue. */
export async function enqueue(
  event: Omit<QueuedClockEvent, 'id' | 'retries'>
): Promise<QueuedClockEvent> {
  const item: QueuedClockEvent = { ...event, id: generateId(), retries: 0 };
  const queue = await getQueue();
  queue.push(item);
  await saveQueue(queue);
  return item;
}

/** Remove a successfully synced event from the queue. */
export async function dequeue(id: string): Promise<void> {
  const queue = await getQueue();
  await saveQueue(queue.filter((e) => e.id !== id));
}

/** Increment the retry counter for an event (max 5 — then drop it). */
export async function incrementRetry(id: string): Promise<void> {
  const queue = await getQueue();
  const updated = queue
    .map((e) => (e.id === id ? { ...e, retries: e.retries + 1 } : e))
    .filter((e) => e.retries <= 5);
  await saveQueue(updated);
}

/** How many events are waiting. */
export async function queueLength(): Promise<number> {
  const queue = await getQueue();
  return queue.length;
}

/** Wipe the entire queue (e.g. on logout). */
export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}
