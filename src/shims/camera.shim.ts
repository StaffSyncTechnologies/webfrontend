/**
 * camera.shim.ts
 *
 * Wraps expo-camera so the app doesn't crash on Expo Go where the native
 * 'ExpoCamera' module is absent.
 *
 * Strategy
 * ────────
 * • We lazy-require expo-camera inside a try/catch so the inevitable
 *   "Cannot find native module 'ExpoCamera'" never propagates.
 * • CameraView falls back to a React.Fragment (renders nothing).
 * • useCameraPermissions falls back to usePermissionsStub, a proper React
 *   hook (uses useState/useCallback) that always returns { granted: false }.
 *
 * Rules-of-Hooks safety
 * ──────────────────────
 * _hookFn is assigned ONCE at module-load time (either the real expo hook or
 * the stub) and never reassigned, so every render of useCameraPermissions
 * calls the exact same hook function in the exact same order — the Rules of
 * Hooks are satisfied.
 */

import React, { useState, useCallback } from 'react';

// ─── Types (mirror expo-camera public surface) ────────────────────────────────

export type CameraPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface PermissionResponse {
  granted: boolean;
  canAskAgain: boolean;
  status: CameraPermissionStatus;
  expires: 'never' | number;
}

type RequestFn = () => Promise<PermissionResponse>;
type UsePermissionsReturn = [PermissionResponse | null, RequestFn];

// ─── Lazy-load the native module ─────────────────────────────────────────────

type ExpoCameraModule = {
  CameraView: React.ComponentType<any>;
  useCameraPermissions: () => UsePermissionsReturn;
};

let _mod: ExpoCameraModule | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  _mod = require('expo-camera') as ExpoCameraModule;
} catch {
  // Native module unavailable (Expo Go) — all exports fall back to stubs.
  _mod = null;
}

// ─── isCameraModuleAvailable ──────────────────────────────────────────────────

/** true in a native dev/prod build; false in Expo Go */
export const isCameraModuleAvailable: boolean = _mod !== null;

// ─── CameraView ───────────────────────────────────────────────────────────────

/**
 * In Expo Go this is a no-op fragment; callers should gate rendering with
 * `isCameraModuleAvailable`.
 */
export const CameraView: React.ComponentType<any> =
  _mod?.CameraView ?? ((_props: any) => React.createElement(React.Fragment));

// ─── useCameraPermissions ─────────────────────────────────────────────────────

/** Stub hook returned when expo-camera is unavailable. */
function usePermissionsStub(): UsePermissionsReturn {
  const [state] = useState<PermissionResponse | null>(null);
  const request = useCallback(
    async (): Promise<PermissionResponse> => ({
      granted:      false,
      canAskAgain:  false,
      status:       'denied',
      expires:      'never',
    }),
    [],
  );
  return [state, request];
}

// Locked at module-init time — never changes between renders.
const _hookFn: () => UsePermissionsReturn =
  (_mod?.useCameraPermissions as () => UsePermissionsReturn) ?? usePermissionsStub;

/** Drop-in replacement for expo-camera's useCameraPermissions. */
export function useCameraPermissions(): UsePermissionsReturn {
  // _hookFn is a stable reference → same hook called every render ✓
  return _hookFn();
}
