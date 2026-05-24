/**
 * useBiometric — wraps expo-local-authentication
 *
 * Returns:
 *   isAvailable  — device has enrolled biometrics (Face ID / fingerprint)
 *   biometricType — 'face' | 'fingerprint' | 'iris' | null
 *   authenticate — call this before clock-in; resolves true if passed
 *
 * NOTE: expo-local-authentication requires a native build (EAS / dev-client).
 * When running in Expo Go the native module is absent; the hook gracefully
 * returns isAvailable=false so clock-in still works without biometrics.
 */

import { useEffect, useState, useCallback } from 'react';

// Lazy require — avoids the "Cannot find native module 'ExpoLocalAuthentication'"
// crash when running in Expo Go, which doesn't ship this native module.
type LocalAuth = typeof import('expo-local-authentication');
let _LocalAuthentication: LocalAuth | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  _LocalAuthentication = require('expo-local-authentication') as LocalAuth;
} catch {
  // Not available in Expo Go — biometric prompt will be skipped.
  _LocalAuthentication = null;
}

export type BiometricType = 'face' | 'fingerprint' | 'iris' | null;

function mapAuthType(types: number[]): BiometricType {
  if (!_LocalAuthentication) return null;
  const { AuthenticationType } = _LocalAuthentication;
  if (types.includes(AuthenticationType.FACIAL_RECOGNITION)) return 'face';
  if (types.includes(AuthenticationType.FINGERPRINT))        return 'fingerprint';
  if (types.includes(AuthenticationType.IRIS))               return 'iris';
  return null;
}

export function useBiometric() {
  const [isAvailable, setIsAvailable]     = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>(null);

  useEffect(() => {
    if (!_LocalAuthentication) return; // Expo Go — skip silently

    (async () => {
      const compatible = await _LocalAuthentication!.hasHardwareAsync();
      const enrolled   = await _LocalAuthentication!.isEnrolledAsync();
      if (compatible && enrolled) {
        setIsAvailable(true);
        const types = await _LocalAuthentication!.supportedAuthenticationTypesAsync();
        setBiometricType(mapAuthType(types as number[]));
      }
    })();
  }, []);

  const authenticate = useCallback(
    async (reason: string = 'Confirm your identity to clock in'): Promise<boolean> => {
      // No biometrics available (Expo Go) or not enrolled — don't block clock-in
      if (!isAvailable || !_LocalAuthentication) return true;

      const result = await _LocalAuthentication.authenticateAsync({
        promptMessage:          reason,
        fallbackLabel:          'Use PIN',
        cancelLabel:            'Cancel',
        disableDeviceFallback:  false,
      });

      return result.success;
    },
    [isAvailable],
  );

  return { isAvailable, biometricType, authenticate };
}
