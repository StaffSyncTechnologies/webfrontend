import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function NetworkStatusBanner() {
  const { isConnected, isServerReachable, isOnline } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(100)).current;
  const isVisible = useRef(false);

  useEffect(() => {
    if (!isOnline && !isVisible.current) {
      isVisible.current = true;
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else if (isOnline && isVisible.current) {
      // Brief delay to show "Back online" before hiding
      setTimeout(() => {
        Animated.timing(translateY, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          isVisible.current = false;
        });
      }, 1500);
    }
  }, [isOnline, translateY]);

  const message = !isConnected
    ? 'No internet connection'
    : !isServerReachable
    ? 'Server unavailable'
    : 'Back online';

  const icon = !isConnected
    ? 'wifi-outline'
    : !isServerReachable
    ? 'cloud-offline-outline'
    : 'checkmark-circle-outline';

  const bgColor = isOnline ? '#22C55E' : '#EF4444';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: bgColor,
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.content}>
        <Ionicons name={icon as any} size={16} color="#FFFFFF" />
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Outfit_600SemiBold',
    letterSpacing: 0.2,
  },
});

export default NetworkStatusBanner;
