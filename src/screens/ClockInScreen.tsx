import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, AppState, AppStateStatus, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme } from '../contexts';
import { useToast } from '../contexts/ToastContext';
import { useLocation } from '../hooks/useLocation';
import { isWithinGeofence, formatDistance, DEFAULT_GEOFENCE_RADIUS } from '../utils/geofence';
import { useGetByIdQuery, useClockInMutation, useClockOutMutation } from '../store/api/shiftsApi';
import { H2, H3, Body, Caption, Button } from '../components/ui';

type ClockState = 'idle' | 'clocked_in' | 'clocked_out';

const CLOCK_STORAGE_KEY = '@staffsync_clock_state';

interface PersistedClockData {
  shiftId: string;
  startTimestamp: number;
  state: ClockState;
}

function padZero(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function ClockInScreen({ route, navigation }: RootStackScreenProps<'ClockIn'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { shiftId } = route.params;

  const [clockState, setClockState] = useState<ClockState>('idle');
  const [seconds, setSeconds] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRestored, setIsRestored] = useState(false);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [geofenceStatus, setGeofenceStatus] = useState<{ within: boolean; distance?: number } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimestampRef = useRef<number | null>(null);

  const { warning } = useToast();
  const { getCurrentLocation, latitude, longitude, isLoading: locationLoading } = useLocation();

  // Clock-in/out mutations
  const [clockInMutation, { isLoading: isClockingIn }] = useClockInMutation();
  const [clockOutMutation, { isLoading: isClockingOut }] = useClockOutMutation();

  // Fetch shift data from backend
  const { data: shiftResponse, isLoading: shiftLoading, error: shiftError } = useGetByIdQuery(shiftId);

  // Extract the shift object from the API response wrapper { success, data }
  const shift = shiftResponse?.data ?? null;

  // Derive geofence data from the shift
  const geofenceData = useMemo(() => {
    if (!shift) return null;
    const siteLat = shift.siteLat ? Number(shift.siteLat) : shift.location?.latitude ? Number(shift.location.latitude) : null;
    const siteLng = shift.siteLng ? Number(shift.siteLng) : shift.location?.longitude ? Number(shift.location.longitude) : null;
    const geofenceRadius = shift.geofenceRadius ?? shift.location?.geofenceRadius ?? DEFAULT_GEOFENCE_RADIUS;
    return { siteLat, siteLng, geofenceRadius };
  }, [shift]);

  // Derive display values from the shift
  const shiftDisplay = useMemo(() => {
    if (!shift) return null;
    const start = new Date(shift.startAt);
    const end = new Date(shift.endAt);
    return {
      title: shift.title,
      location: shift.location?.address || shift.siteLocation || 'Unknown location',
      locationName: shift.location?.name || shift.siteLocation || 'Work Site',
      client: shift.clientCompany?.name || '',
      date: start.toLocaleDateString(),
      time: `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      hourlyRate: Number(shift.hourlyRate || shift.payRate || 0),
    };
  }, [shift]);

  // Check geofence status
  const checkGeofenceStatus = useCallback(async () => {
    if (!latitude || !longitude || !geofenceData?.siteLat || !geofenceData?.siteLng) return;

    setIsCheckingLocation(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        const result = isWithinGeofence(
          location.latitude,
          location.longitude,
          geofenceData.siteLat,
          geofenceData.siteLng,
          geofenceData.geofenceRadius
        );
        setGeofenceStatus(result);
        if (!result.within) {
          warning(
            `You are ${formatDistance(result.distance)} away from the work site. Please move within ${geofenceData.geofenceRadius}m to clock in.`,
            { duration: 5000, vibrate: true }
          );
        }
      }
    } catch (error) {
      console.error('Geofence check failed:', error);
    } finally {
      setIsCheckingLocation(false);
    }
  }, [latitude, longitude, geofenceData, getCurrentLocation, warning]);

  // Check geofence when location is available (for both clock-in and clock-out)
  useEffect(() => {
    if (latitude && longitude && (clockState === 'idle' || clockState === 'clocked_in')) {
      checkGeofenceStatus();
    }
  }, [latitude, longitude, clockState, checkGeofenceStatus]);

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

  const isOutsideGeofence = geofenceStatus !== null && !geofenceStatus.within;
  const isShiftExpired = shift ? new Date(shift.endAt) < new Date() : false;

  const handleButtonPress = () => {
    // Check if shift has expired
    if (clockState === 'idle' && isShiftExpired) {
      Alert.alert(
        'Shift Ended',
        'This shift has already ended. You cannot clock in.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Block both clock-in and clock-out when outside geofence
    if (isOutsideGeofence) {
      const action = clockState === 'idle' ? 'Clock In' : 'Clock Out';
      Alert.alert(
        'Too Far From Work Site',
        `You are ${formatDistance(geofenceStatus!.distance || 0)} away from the work site. You must be within ${geofenceData?.geofenceRadius || DEFAULT_GEOFENCE_RADIUS}m to ${action.toLowerCase()}.`,
        [{ text: 'OK' }]
      );
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    
    if (clockState === 'idle') {
      // Clock in
      try {
        await clockInMutation({ 
          shiftId, 
          lat: latitude || undefined, 
          lng: longitude || undefined 
        }).unwrap();
        
        const now = Date.now();
        startTimestampRef.current = now;
        setSeconds(0);
        setClockState('clocked_in');
        
        // Persist clock-in start time
        const data: PersistedClockData = { shiftId, startTimestamp: now, state: 'clocked_in' };
        await AsyncStorage.setItem(CLOCK_STORAGE_KEY, JSON.stringify(data));
      } catch (error: any) {
        // Show error message from backend
        Alert.alert('Clock In Failed', error?.data?.message || 'Failed to clock in. Please try again.');
        return;
      }
    } else if (clockState === 'clocked_in') {
      // Clock out
      try {
        await clockOutMutation({ 
          shiftId, 
          lat: latitude || undefined, 
          lng: longitude || undefined 
        }).unwrap();
        
        setClockState('clocked_out');
        // Clear persisted state on clock-out
        await AsyncStorage.removeItem(CLOCK_STORAGE_KEY);
      } catch (error: any) {
        // Show error message from backend
        Alert.alert('Clock Out Failed', error?.data?.message || 'Failed to clock out. Please try again.');
        return;
      }
    }
  };

  const headerTitle = clockState === 'idle' ? 'Clock-In' : 'Clock-Out';
  const hourlyRate = shiftDisplay?.hourlyRate ?? 0;
  const totalEarnings = (hourlyRate * (seconds / 3600)).toFixed(2);

  // Show loading state while shift data is being fetched
  if (shiftLoading) {
    return (
      <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary items-center justify-center" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Body className="mt-4">Loading shift details...</Body>
      </View>
    );
  }

  // Show error state if API call failed
  if (shiftError) {
    const errorData = (shiftError as any)?.data;
    const isAccessDenied = errorData?.code === 'ACCESS_DENIED';
    return (
      <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary items-center justify-center px-8" style={{ paddingTop: insets.top }}>
        <Ionicons name={isAccessDenied ? 'lock-closed-outline' : 'alert-circle-outline'} size={48} color={isAccessDenied ? '#F59E0B' : '#EF4444'} />
        <H2 className="mt-4 mb-2">{isAccessDenied ? 'Access Denied' : 'Error Loading Shift'}</H2>
        <Body className="text-center mb-4">
          {isAccessDenied
            ? 'You do not have permission to access this shift.'
            : errorData?.error || 'Failed to load shift details. Please try again.'}
        </Body>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  // Show not-found state
  if (!shift || !shiftDisplay) {
    return (
      <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary items-center justify-center px-8" style={{ paddingTop: insets.top }}>
        <Ionicons name="document-outline" size={48} color="#6B7280" />
        <H2 className="mt-4 mb-2">Shift Not Found</H2>
        <Body className="text-center mb-4">The requested shift could not be found.</Body>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  // ── Clocked Out Success View ──
  if (clockState === 'clocked_out') {
    return (
      <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
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
            <H2 className="mb-2">{shiftDisplay.title}</H2>
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Body color="secondary">{shiftDisplay.location}</Body>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Body color="secondary">{shiftDisplay.date} • {shiftDisplay.time}</Body>
            </View>
          </View>

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
                <H2>${hourlyRate}/hr</H2>
              </View>
              <View className="flex-1 pl-4">
                <Caption color="secondary" className="mb-1">Total Earning made</Caption>
                <H2>${totalEarnings}</H2>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View className="px-5 pb-10">
            <Button
              onPress={() => navigation.navigate('Main', { screen: 'Payslip' })}
              className="mb-3"
            >
              View pay-slip (when available)
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
        <View className={`mx-5 mb-4 px-4 py-2.5 rounded-full flex-row items-center justify-between ${
          geofenceStatus?.within ? 'bg-green-100' : 'bg-red-100'
        }`} style={{ 
          borderWidth: 1, 
          borderColor: geofenceStatus?.within ? '#BBF7D0' : '#FECACA' 
        }}>
          <View className="flex-row items-center gap-2">
            <View className={`w-2.5 h-2.5 rounded-full ${
              geofenceStatus?.within ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <Body className="font-outfit-semibold" style={{ 
              color: geofenceStatus?.within ? '#166534' : '#DC2626' 
            }}>
              {locationLoading || isCheckingLocation
                ? 'Checking location...'
                : geofenceStatus
                  ? geofenceStatus.within
                    ? `At Location: ${shiftDisplay.locationName}`
                    : `${formatDistance(geofenceStatus.distance || 0)} away`
                  : 'Location unavailable'}
            </Body>
          </View>
          <Body className="font-outfit-bold" style={{ 
            color: geofenceStatus?.within ? '#16A34A' : '#DC2626' 
          }}>
            {geofenceStatus?.within ? 'GPS Verified' : 'Too Far'}
          </Body>
        </View>

        {/* Shift Info */}
        <View className="px-5 pb-4">
          <H2 className="mb-2">{shiftDisplay.title}</H2>
          <View className="flex-row items-center gap-1.5 mb-1.5">
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Body color="secondary">{shiftDisplay.location}</Body>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Body color="secondary">{shiftDisplay.date} • {shiftDisplay.time}</Body>
          </View>
        </View>

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
            disabled={isClockingIn || isClockingOut || isOutsideGeofence}
            activeOpacity={0.8}
            className="items-center justify-center"
            style={{
              width: 180,
              height: 180,
              borderRadius: 90,
              backgroundColor: isOutsideGeofence || isClockingIn || isClockingOut ? '#9CA3AF' : primaryColor || '#38BDF8',
              opacity: isOutsideGeofence || isClockingIn || isClockingOut ? 0.6 : 1,
            }}
          >
            {(isClockingIn || isClockingOut) ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <Ionicons
                name={clockState === 'clocked_in' ? 'stop' : 'power-outline'}
                size={48}
                color="#FFFFFF"
              />
            )}
            <Body className="font-outfit-bold mt-1" style={{ color: '#FFFFFF', fontSize: 18 }}>
              {isClockingIn || isClockingOut
                ? 'PROCESSING...'
                : isOutsideGeofence
                ? 'OUT OF RANGE' 
                : clockState === 'clocked_in' 
                ? 'CLOCK OUT' 
                : 'CLOCK IN'
              }
            </Body>
          </TouchableOpacity>
          {isOutsideGeofence && (
            <Caption color="secondary" className="mt-2 text-center px-8">
              Move within {geofenceData?.geofenceRadius || 300}m of the work site to {clockState === 'clocked_in' ? 'clock out' : 'clock in'}
            </Caption>
          )}
        </View>

        {/* Earnings */}
        <View className="px-5 py-5">
          <H3 className="mb-3">Earnings</H3>
          <View className="flex-row">
            <View className="flex-1 pr-4 border-r border-light-border-light dark:border-dark-border-light">
              <Caption color="secondary" className="mb-1">Hourly pay per shift</Caption>
              <H2>${hourlyRate}/hr</H2>
            </View>
            <View className="flex-1 pl-4">
              <Caption color="secondary" className="mb-1">Total Earning made</Caption>
              <H2>${totalEarnings}</H2>
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
