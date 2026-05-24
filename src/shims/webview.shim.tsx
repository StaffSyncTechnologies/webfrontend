/**
 * webview.shim.tsx
 *
 * react-native-webview is a community package whose native module (RNCWebView)
 * is not shipped with Expo Go. Importing it directly causes:
 *   "Cannot find native module 'RNCWebView'" at runtime.
 *
 * This shim lazy-requires the real module and exports a no-op stub component
 * when the native module is unavailable, so screens render gracefully in
 * Expo Go instead of crashing.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type WebViewProps = {
  source?: { uri?: string; html?: string };
  style?: any;
  onLoad?: () => void;
  onError?: (e: any) => void;
  [key: string]: any;
};

// ─── Stub rendered when native module is absent ───────────────────────────────

function WebViewStub({ style }: WebViewProps) {
  return (
    <View style={[styles.stub, style]}>
      <Text style={styles.text}>
        WebView not available in Expo Go.{'\n'}Use a development build to view this content.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stub: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 24,
  },
  text: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 20,
  },
});

// ─── Lazy-load the real module ────────────────────────────────────────────────

let _WebView: React.ComponentType<WebViewProps> = WebViewStub;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('react-native-webview');
  _WebView = mod.WebView as React.ComponentType<WebViewProps>;
} catch {
  // Expo Go — stub stays active
}

export const WebView = _WebView;
export const isWebViewAvailable: boolean = _WebView !== WebViewStub;
