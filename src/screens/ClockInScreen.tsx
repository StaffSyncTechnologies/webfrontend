import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme } from '../contexts';
import { H2, H3, Body, Caption, Button } from '../components/ui';

type ClockState = 'idle' | 'clocked_in' | 'clocked_out';

const CLOCK_STORAGE_KEY = '@staffsync_clock_state';

interface PersistedClockData {
  shiftId: string;
  startTimestamp: number; // Date.now() when clocked in
  state: ClockState;
}

function padZero(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function ClockInScreen({ route, navigation }: RootStackScreenProps<'ClockIn'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor, secondaryColor } = useOrgTheme();
  const { shiftId } = route.params;

  const [clockState, setClockState] = useState<ClockState>('idle');
  const [seconds, setSeconds] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRestored, setIsRestored] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimestampRef = useRef<number | null>(null);

  const shift = {
    title: 'Warehouse Operative',
    location: 'New York, London',
    date: 'Mon, October 4',
    time: '06:00PM - 08:00PM',
    hourlyRate: '£10.00/hr',
    totalPay: '£40.00',
  };

  // Restore persisted clock state on mount
  useEffect(() => {
    const restoreClockState = async () => {
      try {
        const stored = await AsyncStorage.getItem(CLOCK_STORAGE_KEY);
        if (stored) {
          const data: PersistedClockData = JSON.parse(stored);
          if (data.shiftId === shiftId && data.state === 'clocked_in') {
            startTimestampRef.current = data.startTimestamp;
            const elapsed = Math.floor((Date.now() - data.startTimestamp) / 1000);
            setSeconds(Math.max(0, elapsed));
            setClockState('clocked_in');
          }
        }
      } catch (e) {
        // ignore restore errors
      }
      setIsRestored(true);
    };
    restoreClockState();
  }, [shiftId]);

  // Recalculate elapsed time when app comes back to foreground
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active' && startTimestampRef.current && clockState === 'clocked_in') {
        const elapsed = Math.floor((Date.now() - startTimestampRef.current) / 1000);
        setSeconds(Math.max(0, elapsed));
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [clockState]);

  // Tick the timer every second while clocked in
  useEffect(() => {
    if (clockState === 'clocked_in') {
      intervalRef.current = setInterval(() => {
        if (startTimestampRef.current) {
          const elapsed = Math.floor((Date.now() - startTimestampRef.current) / 1000);
          setSeconds(Math.max(0, elapsed));
        } else {
          setSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [clockState]);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const handleButtonPress = () => {
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    if (clockState === 'idle') {
      const now = Date.now();
      startTimestampRef.current = now;
      setSeconds(0);
      setClockState('clocked_in');
      // Persist clock-in start time
      const data: PersistedClockData = { shiftId, startTimestamp: now, state: 'clocked_in' };
      await AsyncStorage.setItem(CLOCK_STORAGE_KEY, JSON.stringify(data));
    } else if (clockState === 'clocked_in') {
      setClockState('clocked_out');
      // Clear persisted state on clock-out
      await AsyncStorage.removeItem(CLOCK_STORAGE_KEY);
    }
  };

  const headerTitle = clockState === 'idle' ? 'Clock-In' : 'Clock-Out';

  // ── Clocked Out Success View ──
  if (clockState === 'clocked_out') {
    return (
      <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#000035" />
          </TouchableOpacity>
          <H2>Clock-Out</H2>
          <TouchableOpacity>
            <Ionicons name="information-circle-outline" size={24} color="#000035" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Success Banner */}
          <View className="mx-5 mb-5 px-4 py-3.5 rounded-xl" style={{ backgroundColor: '#DCFCE7' }}>
            <View className="flex-row items-center gap-2 mb-1">
              <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
              <Body className="font-outfit-bold" style={{ color: '#166534' }}>Clock Out Successful</Body>
            </View>
            <Body style={{ color: '#166534', fontSize: 13 }}>
              Your shift has been submitted and is awaiting approval.
            </Body>
          </View>

          {/* Shift Info */}
          <View className="px-5 pb-4">
            <H2 className="mb-2">{shift.title}</H2>
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Body color="secondary">{shift.location}</Body>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Body color="secondary">{shift.date} • {shift.time}</Body>
            </View>
          </View>

          {/* Divider */}
          <View className="h-px bg-light-border-light dark:bg-dark-border-light mx-5" />

          {/* Shift Timer (frozen) */}
          <View className="items-center py-6 mx-5">
            <View className="w-full rounded-2xl border border-light-border-light dark:border-dark-border-light py-5 items-center">
              <Ionicons name="timer-outline" size={28} color="#6B7280" />
              <Caption color="secondary" className="mt-1 mb-3">Shift Timer</Caption>
              <H2 className="text-3xl font-outfit-bold">
                {padZero(hours)}h : {padZero(minutes)}m : {padZero(secs)}s
              </H2>
              <Caption color="muted" className="mt-2">Total time worked today</Caption>
            </View>
          </View>

          {/* Earnings */}
          <View className="mx-5 rounded-2xl border border-light-border-light dark:border-dark-border-light p-4 mb-6">
            <H3 className="mb-3">Earnings</H3>
            <View className="flex-row">
              <View className="flex-1 pr-4 border-r border-light-border-light dark:border-dark-border-light">
                <Caption color="secondary" className="mb-1">Hourly pay per shift</Caption>
                <H2>{shift.hourlyRate}</H2>
              </View>
              <View className="flex-1 pl-4">
                <Caption color="secondary" className="mb-1">Total Earning made</Caption>
                <H2>{shift.totalPay}</H2>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View className="px-5 pb-10">
            <Button
              onPress={() => navigation.navigate('Main', { screen: 'Payslip' })}
              className="mb-3"
            >
              View  pay-slip (when available)
            </Button>
            <Button
              variant="outline"
              onPress={() => navigation.navigate('Main', { screen: 'Schedule' })}
            >
              Back to Schedule
            </Button>
          </View>

          <View className="h-5" />
        </ScrollView>
      </View>
    );
  }

  // ── Clock In / Clock Out Active View ──
  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000035" />
        </TouchableOpacity>
        <H2>{headerTitle}</H2>
        <TouchableOpacity>
          <Ionicons name="information-circle-outline" size={24} color="#000035" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* GPS Location Banner */}
        <View className="mx-5 mb-4 px-4 py-2.5 rounded-full flex-row items-center justify-between" style={{ backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#BBF7D0' }}>
          <View className="flex-row items-center gap-2">
            <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <Body className="font-outfit-semibold" style={{ color: '#166534' }}>
              At Location: {shift.location}
            </Body>
          </View>
          <Body className="font-outfit-bold" style={{ color: '#DC2626' }}>GPS Verified</Body>
        </View>

        {/* Shift Info */}
        <View className="px-5 pb-4">
          <H2 className="mb-2">{shift.title}</H2>
          <View className="flex-row items-center gap-1.5 mb-1.5">
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Body color="secondary">{shift.location}</Body>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Body color="secondary">{shift.date} • {shift.time}</Body>
          </View>
        </View>

        {/* Divider */}
        <View className="h-px bg-light-border-light dark:bg-dark-border-light mx-5" />

        {/* Shift Timer */}
        <View className="items-center py-6 mx-5">
          <View className="w-full rounded-2xl border border-light-border-light dark:border-dark-border-light py-5 items-center">
            <Ionicons name="timer-outline" size={28} color="#6B7280" />
            <Caption color="secondary" className="mt-1 mb-3">Shift Timer</Caption>
            <H2 className="text-3xl font-outfit-bold">
              {padZero(hours)}h : {padZero(minutes)}m : {padZero(secs)}s
            </H2>
            <Caption color="muted" className="mt-2">
              {clockState === 'clocked_in' ? 'Total time worked today' : 'Time worked today'}
            </Caption>
          </View>
        </View>

        {/* Clock In / Out Button */}
        <View className="items-center py-4">
          <TouchableOpacity
            onPress={handleButtonPress}
            activeOpacity={0.8}
            className="items-center justify-center"
            style={{
              width: 180,
              height: 180,
              borderRadius: 90,
              backgroundColor: primaryColor || '#38BDF8',
            }}
          >
            <Ionicons
              name={clockState === 'clocked_in' ? 'stop' : 'power-outline'}
              size={48}
              color="#FFFFFF"
            />
            <Body className="font-outfit-bold mt-1" style={{ color: '#FFFFFF', fontSize: 18 }}>
              {clockState === 'clocked_in' ? 'CLOCK OUT' : 'CLOCK IN'}
            </Body>
          </TouchableOpacity>
        </View>

        {/* Earnings */}
        <View className="px-5 py-5">
          <H3 className="mb-3">Earnings</H3>
          <View className="flex-row">
            <View className="flex-1 pr-4 border-r border-light-border-light dark:border-dark-border-light">
              <Caption color="secondary" className="mb-1">Hourly pay per shift</Caption>
              <H2>{shift.hourlyRate}</H2>
            </View>
            <View className="flex-1 pl-4">
              <Caption color="secondary" className="mb-1">Total Earning made</Caption>
              <H2>{shift.totalPay}</H2>
            </View>
          </View>
        </View>

        <View className="h-5" />
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white dark:bg-dark-background-primary rounded-2xl mx-8 p-6 w-80">
            <View className="items-center mb-4">
              <View
                className="w-14 h-14 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: clockState === 'idle' ? '#DCFCE7' : '#FEF3C7' }}
              >
                <Ionicons
                  name={clockState === 'idle' ? 'log-in-outline' : 'log-out-outline'}
                  size={28}
                  color={clockState === 'idle' ? '#16A34A' : '#D97706'}
                />
              </View>
              <H3 className="text-center mb-2">
                {clockState === 'idle' ? 'Clock In?' : 'Clock Out?'}
              </H3>
              <Body color="secondary" className="text-center">
                {clockState === 'idle'
                  ? 'Are you sure you want to clock in for this shift? Your timer will start immediately.'
                  : 'Are you sure you want to clock out? Your shift time will be submitted for approval.'}
              </Body>
            </View>

            <Button onPress={handleConfirm} className="mb-2.5">
              {clockState === 'idle' ? 'Yes, Clock In' : 'Yes, Clock Out'}
            </Button>
            <Button variant="outline" onPress={() => setShowConfirm(false)}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default ClockInScreen;
