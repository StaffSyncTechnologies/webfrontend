import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme } from '../contexts';
import { H2, H3, Body, Caption, Button } from '../components/ui';

export function RequestHolidayScreen({ navigation }: RootStackScreenProps<'RequestHoliday'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();

  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color="#000035" />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <H2>Request Holiday</H2>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Profile Details */}
        <H2 className="mb-2 mt-2">Profile Details</H2>
        <Body color="secondary" className="mb-6">
          Select the dates and submit your holiday request for approval.
        </Body>

        {/* Leave Type */}
        <Body className="font-outfit-semibold mb-2">
          Leave Type<Body style={{ color: '#DC2626' }}>*</Body>
        </Body>
        <TouchableOpacity
          className="flex-row items-center justify-between px-4 py-3.5 rounded-xl mb-5"
          style={{ borderWidth: 1, borderColor: '#E2E8F0' }}
        >
          <Body color={leaveType ? 'primary' : 'muted'}>
            {leaveType || 'Select the type of leave'}
          </Body>
          <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Start Date */}
        <Body className="font-outfit-semibold mb-2">
          Start Date<Body style={{ color: '#DC2626' }}>*</Body>
        </Body>
        <View
          className="flex-row items-center justify-between px-4 py-3.5 rounded-xl mb-5"
          style={{ borderWidth: 1, borderColor: '#E2E8F0' }}
        >
          <TextInput
            className="flex-1 font-outfit text-base"
            placeholder="Select start date (dd/mm/yy)"
            placeholderTextColor="#9CA3AF"
            value={startDate}
            onChangeText={setStartDate}
          />
          <Ionicons name="calendar-outline" size={20} color="#6B7280" />
        </View>

        {/* End Date */}
        <Body className="font-outfit-semibold mb-2">
          End Date<Body style={{ color: '#DC2626' }}>*</Body>
        </Body>
        <View
          className="flex-row items-center justify-between px-4 py-3.5 rounded-xl mb-5"
          style={{ borderWidth: 1, borderColor: '#E2E8F0' }}
        >
          <TextInput
            className="flex-1 font-outfit text-base"
            placeholder="Select end date  (dd/mm/yy)"
            placeholderTextColor="#9CA3AF"
            value={endDate}
            onChangeText={setEndDate}
          />
          <Ionicons name="calendar-outline" size={20} color="#6B7280" />
        </View>

        {/* Reason */}
        <Body className="font-outfit-semibold mb-2">
          Reason for leave (optional)
        </Body>
        <View
          className="px-4 pt-3.5 pb-16 rounded-xl mb-6"
          style={{ borderWidth: 1, borderColor: '#E2E8F0' }}
        >
          <TextInput
            className="font-outfit text-base"
            placeholder="Enter your reason for requesting leave"
            placeholderTextColor="#9CA3AF"
            value={reason}
            onChangeText={setReason}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View className="h-10" />
      </ScrollView>

      {/* Submit Button */}
      <View className="px-5 pb-8 pt-3">
        <Button onPress={() => navigation.navigate('HolidayRequestSubmitted')}>
          Submit Request
        </Button>
      </View>
    </View>
  );
}

export default RequestHolidayScreen;
