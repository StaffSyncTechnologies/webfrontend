/**
 * ClockResultCard — reusable success / error / offline card
 * shown after any NFC or QR clock-in attempt.
 */

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { H3, Body, Caption } from './ui';

export type ClockResultState =
  | { kind: 'success'; action: 'CLOCK_IN' | 'CLOCK_OUT'; shiftTitle: string; hoursWorked?: number; pointName: string }
  | { kind: 'offline'; recordedAt: string; method: 'NFC' | 'QR' }
  | { kind: 'error'; message: string };

interface Props {
  result: ClockResultState;
  primaryColor: string;
  textColor: string;
  subtextColor: string;
  isDark: boolean;
  onDone: () => void;
  onRetry?: () => void;
}

export function ClockResultCard({ result, primaryColor, textColor, subtextColor, isDark, onDone, onRetry }: Props) {
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';

  if (result.kind === 'success') {
    const isClockedIn = result.action === 'CLOCK_IN';
    const accentColor = isClockedIn ? '#10B981' : '#6366F1';
    const iconName = isClockedIn ? 'checkmark-circle' : 'exit-outline';

    return (
      <View className="w-full rounded-3xl p-8 items-center" style={{ backgroundColor: cardBg }}>
        <View className="w-28 h-28 rounded-full items-center justify-center mb-5" style={{ backgroundColor: `${accentColor}20` }}>
          <Ionicons name={iconName as any} size={64} color={accentColor} />
        </View>

        <H3 className="text-center mb-1" style={{ color: textColor }}>
          {isClockedIn ? 'Clocked In!' : 'Clocked Out!'}
        </H3>
        <Body className="text-center mb-2" style={{ color: subtextColor }}>{result.shiftTitle}</Body>

        {!isClockedIn && result.hoursWorked != null && (
          <View className="px-5 py-3 rounded-xl mb-4" style={{ backgroundColor: '#10B98115' }}>
            <Caption style={{ color: '#10B981', textAlign: 'center' }}>
              Hours worked: {result.hoursWorked.toFixed(2)} hrs
            </Caption>
          </View>
        )}

        <View className="flex-row items-center gap-2 mb-8">
          <Ionicons name="radio-outline" size={13} color={subtextColor} />
          <Caption style={{ color: subtextColor }}>{result.pointName}</Caption>
        </View>

        <TouchableOpacity
          className="w-full py-4 rounded-xl items-center"
          style={{ backgroundColor: primaryColor }}
          onPress={onDone}
        >
          <Body style={{ color: '#FFFFFF', fontWeight: '700' }}>Done</Body>
        </TouchableOpacity>
      </View>
    );
  }

  if (result.kind === 'offline') {
    const time = new Date(result.recordedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return (
      <View className="w-full rounded-3xl p-8 items-center" style={{ backgroundColor: cardBg }}>
        <View className="w-28 h-28 rounded-full items-center justify-center mb-5" style={{ backgroundColor: '#F59E0B20' }}>
          <Ionicons name="cloud-offline-outline" size={60} color="#F59E0B" />
        </View>

        <H3 className="text-center mb-2" style={{ color: textColor }}>Saved Offline</H3>
        <Body className="text-center mb-2" style={{ color: subtextColor }}>
          No connection right now. Your {result.method === 'NFC' ? 'NFC tap' : 'QR scan'} at {time} has been
          saved and will sync automatically when you're back online.
        </Body>

        <View className="flex-row items-center gap-2 px-4 py-2 rounded-full mb-8" style={{ backgroundColor: '#F59E0B20' }}>
          <Ionicons name="time-outline" size={13} color="#F59E0B" />
          <Caption style={{ color: '#F59E0B' }}>Will sync when connected</Caption>
        </View>

        <TouchableOpacity
          className="w-full py-4 rounded-xl items-center"
          style={{ backgroundColor: primaryColor }}
          onPress={onDone}
        >
          <Body style={{ color: '#FFFFFF', fontWeight: '700' }}>OK, Got It</Body>
        </TouchableOpacity>
      </View>
    );
  }

  // error
  return (
    <View className="w-full rounded-3xl p-8 items-center" style={{ backgroundColor: cardBg }}>
      <View className="w-28 h-28 rounded-full items-center justify-center mb-5" style={{ backgroundColor: '#EF444420' }}>
        <Ionicons name="close-circle" size={64} color="#EF4444" />
      </View>

      <H3 className="text-center mb-2" style={{ color: textColor }}>Clock-in Failed</H3>
      <Body className="text-center mb-8" style={{ color: '#EF4444' }}>{result.message}</Body>

      <View className="w-full gap-3">
        {onRetry && (
          <TouchableOpacity
            className="w-full py-4 rounded-xl items-center"
            style={{ backgroundColor: primaryColor }}
            onPress={onRetry}
          >
            <Body style={{ color: '#FFFFFF', fontWeight: '700' }}>Try Again</Body>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="w-full py-4 rounded-xl items-center border"
          style={{ borderColor: subtextColor }}
          onPress={onDone}
        >
          <Body style={{ color: subtextColor, fontWeight: '600' }}>Go to Home</Body>
        </TouchableOpacity>
      </View>
    </View>
  );
}
