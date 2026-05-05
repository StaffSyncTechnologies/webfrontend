import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme, useTheme } from '../contexts';
import { H2, H3, Body, Caption, Button, Input } from '../components/ui';
import { useGetMyRecurringSchedulesQuery, useCreateScheduleChangeRequestMutation, RecurringSchedule } from '../store/api/workerApi';

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_ENUMS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
const DAY_INDEX_MAP: Record<string, number> = { MON: 0, TUE: 1, WED: 2, THU: 3, FRI: 4, SAT: 5, SUN: 6 };

export function ScheduleChangeRequestScreen({ navigation }: RootStackScreenProps<'ScheduleChangeRequest'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();

  const { data: recurringSchedulesResponse } = useGetMyRecurringSchedulesQuery();
  const recurringSchedules = recurringSchedulesResponse || [];
  const [createRequest, { isLoading }] = useCreateScheduleChangeRequestMutation();

  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  const [dayTimes, setDayTimes] = useState<Record<number, { startTime: string; endTime: string }>>({});
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [workerNote, setWorkerNote] = useState('');

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayIndex)) {
        newSet.delete(dayIndex);
        const newTimes = { ...dayTimes };
        delete newTimes[dayIndex];
        setDayTimes(newTimes);
      } else {
        newSet.add(dayIndex);
        setDayTimes(prev => ({ ...prev, [dayIndex]: { startTime: '06:00', endTime: '14:00' } }));
      }
      return newSet;
    });
  };

  const updateTime = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setDayTimes(prev => ({ ...prev, [dayIndex]: { ...prev[dayIndex], [field]: value } }));
  };

  const handleSubmit = async () => {
    if (!selectedScheduleId) {
      Alert.alert('Error', 'Please select a recurring schedule');
      return;
    }
    if (selectedDays.size === 0) {
      Alert.alert('Error', 'Please select at least one day');
      return;
    }
    if (!startDate) {
      Alert.alert('Error', 'Please select a start date');
      return;
    }

    const proposedDays = Array.from(selectedDays).map(dayIndex => ({
      dayOfWeek: DAY_ENUMS[dayIndex] as any,
      ...dayTimes[dayIndex],
    }));

    const requestData = {
      recurringScheduleId: selectedScheduleId,
      proposedStartDate: startDate.toISOString().split('T')[0],
      proposedDays,
      workerNote: workerNote || undefined,
    };

    try {
      await createRequest(requestData).unwrap();
      Alert.alert('Success', 'Your schedule change request has been submitted for approval', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || error?.data?.error || 'Failed to submit request');
    }
  };

  const selectedSchedule = recurringSchedules.find((s: RecurringSchedule) => s.id === selectedScheduleId);

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000035'} />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <H2>Request Schedule Change</H2>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Body color="secondary" className="mb-6">
          Select a recurring schedule and propose changes to your working days and times.
        </Body>

        {/* Select Recurring Schedule */}
        <Body className="font-outfit-semibold mb-2">
          Recurring Schedule<Body style={{ color: '#DC2626' }}>*</Body>
        </Body>
        <TouchableOpacity
          className="flex-row items-center justify-between px-4 py-3.5 rounded-xl mb-5"
          style={{ borderWidth: 1, borderColor: '#E2E8F0' }}
        >
          <Body color={selectedSchedule ? 'primary' : 'muted'}>
            {selectedSchedule?.title || 'Select a schedule'}
          </Body>
          <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {recurringSchedules.map((schedule: RecurringSchedule) => (
          <TouchableOpacity
            key={schedule.id}
            onPress={() => setSelectedScheduleId(schedule.id)}
            className={`mb-3 p-4 rounded-xl border ${
              selectedScheduleId === schedule.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white'
            }`}
          >
            <Body className="font-outfit-semibold mb-1">{schedule.title}</Body>
            <Caption color="secondary">{schedule.role || 'No role'}</Caption>
            <View className="flex-row flex-wrap gap-1 mt-2">
              {schedule.days.map(day => (
                <View key={day.dayOfWeek} className="px-2 py-1 bg-gray-100 rounded">
                  <Caption>{DAY_LABELS[DAY_INDEX_MAP[day.dayOfWeek]]}</Caption>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}

        {/* Start Date */}
        <Body className="font-outfit-semibold mb-2">
          Effective From<Body style={{ color: '#DC2626' }}>*</Body>
        </Body>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="flex-row items-center justify-between px-4 py-3.5 rounded-xl mb-5"
          style={{ borderWidth: 1, borderColor: '#E2E8F0' }}
        >
          <Body color={startDate ? 'primary' : 'muted'}>
            {startDate ? startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Select start date'}
          </Body>
          <Ionicons name="calendar-outline" size={20} color="#6B7280" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (event.type === 'set' && selectedDate) {
                setStartDate(selectedDate);
              }
            }}
            minimumDate={new Date()}
          />
        )}

        {/* Working Days */}
        <Body className="font-outfit-semibold mb-2">
          Working Days<Body style={{ color: '#DC2626' }}>*</Body>
        </Body>
        <View className="flex-row flex-wrap gap-2 mb-5">
          {DAY_LABELS.map((label, index) => (
            <TouchableOpacity
              key={label}
              onPress={() => toggleDay(index)}
              className={`px-4 py-2 rounded-lg border ${
                selectedDays.has(index)
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <Body
                style={{
                  color: selectedDays.has(index) ? '#FFFFFF' : '#6B7280',
                  fontWeight: '600',
                }}
              >
                {label}
              </Body>
            </TouchableOpacity>
          ))}
        </View>

        {/* Day Times */}
        {selectedDays.size > 0 && (
          <View className="mb-5">
            <Body className="font-outfit-semibold mb-2">
              Shift Times
            </Body>
            {Array.from(selectedDays).map(dayIndex => (
              <View key={dayIndex} className="mb-3 p-3 bg-gray-50 rounded-xl">
                <Body className="font-outfit-semibold mb-2">{DAY_LABELS[dayIndex]}</Body>
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Caption className="mb-1">Start Time</Caption>
                    <Input
                      placeholder="06:00"
                      value={dayTimes[dayIndex]?.startTime || '06:00'}
                      onChangeText={(value) => updateTime(dayIndex, 'startTime', value)}
                      containerClassName="mb-0"
                    />
                  </View>
                  <View className="flex-1">
                    <Caption className="mb-1">End Time</Caption>
                    <Input
                      placeholder="14:00"
                      value={dayTimes[dayIndex]?.endTime || '14:00'}
                      onChangeText={(value) => updateTime(dayIndex, 'endTime', value)}
                      containerClassName="mb-0"
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Note */}
        <Input
          label="Note (optional)"
          placeholder="Add a note for your manager"
          value={workerNote}
          onChangeText={setWorkerNote}
          multiline
          numberOfLines={4}
          containerClassName="mb-6"
        />

        <View className="h-10" />
      </ScrollView>

      {/* Submit Button */}
      <View className="px-5 pb-8 pt-3">
        <Button onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : 'Submit Request'}
        </Button>
      </View>
    </View>
  );
}

export default ScheduleChangeRequestScreen;
