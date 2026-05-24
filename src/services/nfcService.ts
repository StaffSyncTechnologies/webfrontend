/**
 * NFC Service — react-native-nfc-manager wrapper
 *
 * iOS:     Add NFC capability in Xcode + NFCReaderUsageDescription in Info.plist
 * Android: Add <uses-permission android:name="android.permission.NFC" />
 *
 * NOTE: react-native-nfc-manager calls `new NativeEventEmitter(NativeNfcModule)`
 * at module initialisation time.  In Expo Go the native module is absent and
 * the call throws "Invariant Violation: new NativeEventEmitter() requires a
 * non-null argument."  We guard against this with a lazy require() so that the
 * rest of the app keeps running on Expo Go; every exported function returns a
 * safe no-op / false / null when the module is unavailable.
 */

import { Platform } from 'react-native';

export const NFC_URI_SCHEME = 'staffsync-worker://nfc-clock/';

// ─── Lazy-load the native module ─────────────────────────────────────────────

type NfcManagerType = typeof import('react-native-nfc-manager').default;
type NfcTechType    = typeof import('react-native-nfc-manager').NfcTech;
type NdefType       = typeof import('react-native-nfc-manager').Ndef;

let _NfcManager: NfcManagerType | null = null;
let _NfcTech:    NfcTechType    | null = null;
let _Ndef:       NdefType       | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod      = require('react-native-nfc-manager');
  _NfcManager    = mod.default   as NfcManagerType;
  _NfcTech       = mod.NfcTech   as NfcTechType;
  _Ndef          = mod.Ndef      as NdefType;
} catch {
  // Native module not available (Expo Go) — all functions return safe defaults.
  _NfcManager = null;
}

const isAvailable = () => _NfcManager !== null;

// ─── Initialisation ──────────────────────────────────────────────────────────

let _started = false;

export async function initNfc(): Promise<boolean> {
  if (!isAvailable()) return false;
  try {
    if (_started) return true;
    await _NfcManager!.start();
    _started = true;
    return true;
  } catch {
    return false;
  }
}

export async function isNfcSupported(): Promise<boolean> {
  if (!isAvailable()) return false;
  try {
    return await _NfcManager!.isSupported();
  } catch {
    return false;
  }
}

export async function isNfcEnabled(): Promise<boolean> {
  if (!isAvailable()) return false;
  try {
    return await _NfcManager!.isEnabled();
  } catch {
    return false;
  }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Waits for a worker to tap an NFC tag and returns the StaffSync tag code.
 * Returns null if the tag does not contain a valid staffsync:// URI, or if
 * the native NFC module is not available (Expo Go).
 */
export async function readNfcClockPoint(): Promise<string | null> {
  if (!isAvailable() || !_NfcTech || !_Ndef) return null;
  try {
    await _NfcManager!.requestTechnology(_NfcTech.Ndef);

    const tag = await _NfcManager!.getTag();
    if (!tag?.ndefMessage?.length) return null;

    const record = tag.ndefMessage[0];
    if (!record?.payload) return null;

    const uri = _Ndef.uri.decodePayload(record.payload as Uint8Array);
    if (!uri.startsWith(NFC_URI_SCHEME)) return null;

    const tagCode = uri.replace(NFC_URI_SCHEME, '').trim();
    return tagCode || null;
  } finally {
    _NfcManager?.cancelTechnologyRequest();
  }
}

// ─── Write (Admin only) ───────────────────────────────────────────────────────

/**
 * Writes a StaffSync NFC clock point URL to a blank NTAG213/215/216 sticker.
 * Only call this from an admin screen after the admin confirms the tag is ready.
 * No-op when native NFC module is unavailable (Expo Go).
 */
export async function writeNfcClockPoint(tagCode: string): Promise<void> {
  if (!isAvailable() || !_NfcTech || !_Ndef) return;
  try {
    await _NfcManager!.requestTechnology(_NfcTech.Ndef);

    const bytes = _Ndef.encodeMessage([
      _Ndef.uriRecord(`${NFC_URI_SCHEME}${tagCode}`),
    ]);

    if (bytes) {
      await _NfcManager!.ndefHandler.writeNdefMessage(bytes);
    }
  } finally {
    _NfcManager?.cancelTechnologyRequest();
  }
}

// ─── Cancel pending operation ────────────────────────────────────────────────

export function cancelNfcRequest(): void {
  _NfcManager?.cancelTechnologyRequest();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function buildNfcUri(tagCode: string): string {
  return `${NFC_URI_SCHEME}${tagCode}`;
}

export function extractTagCodeFromUri(uri: string): string | null {
  if (!uri.startsWith(NFC_URI_SCHEME)) return null;
  const code = uri.replace(NFC_URI_SCHEME, '').trim();
  return code || null;
}

/**
 * Formats a tag code for display: SS_NFC_8F92KDA → SS-NFC-8F92KDA
 */
export function formatTagCode(tagCode: string): string {
  return tagCode.replace(/_/g, '-');
}

/**
 * Android-only: opens NFC settings so the user can enable it.
 * No-op when native NFC module is unavailable (Expo Go).
 */
export function goToNfcSettings(): void {
  if (Platform.OS === 'android' && _NfcManager) {
    _NfcManager.goToNfcSetting();
  }
}
