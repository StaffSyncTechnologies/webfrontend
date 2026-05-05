import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme, useTheme } from '../contexts';
import { H2, H3, Body, Caption, Button, Input, DatePickerModal } from '../components/ui';
import { useRequestHolidayMutation } from '../store';

const LEAVE_TYPES = [
  { value: 'ANNUAL', label: 'Annual Leave' },
  { value: 'SICK', label: 'Sick Leave' },
  { value: 'UNPAID', label: 'Unpaid Leave' },
  { value: 'COMPASSIONATE', label: 'Compassionate Leave' },
  { value: 'MATERNITY', label: 'Maternity Leave' },
];

export function RequestHolidayScreen({ navigation }: RootStackScreenProps<'RequestHoliday'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();

  const [leaveType, setLeaveType] = useState('');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startDateDate, setStartDateDate] = useState<Date | undefined>();
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [endDateDate, setEndDateDate] = useState<Date | undefined>();
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [reason, setReason] = useState('');
  const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [requestHoliday] = useRequestHolidayMutation();

  const handleSubmit = async () => {
    // Validation
    if (!leaveType) {
      Alert.alert('Error', 'Please select a leave type');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your request');
      return;
    }
    if (!startDateDate) {
      Alert.alert('Error', 'Please select a start date');
      return;
    }
    if (!endDateDate) {
      Alert.alert('Error', 'Please select an end date');
      return;
    }

    setIsSubmitting(true);
    try {
      await requestHoliday({
        leaveType: leaveType,
        title: title.trim(),
        startDate: startDateDate.toISOString(),
        endDate: endDateDate.toISOString(),
        reason: reason.trim() || undefined,
      } as any).unwrap();
      navigation.navigate('HolidayRequestSubmitted');
    } catch (error: any) {
      console.error('Holiday request submission error:', error);
      Alert.alert('Error', error?.data?.message || error?.message || 'Failed to submit holiday request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000035'} />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <H2>Request Holiday</H2>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Holiday Details */}
        <H3 className="mb-2 mt-2">Holiday Details</H3>
        <Body color="secondary" className="mb-6">
          Select the dates and submit your holiday request for approval.
        </Body>

        {/* Title */}
        <Input
          label="Title"
          required
          placeholder="Enter a title for your request"
          value={title}
          onChangeText={setTitle}
          containerClassName="mb-5"
        />

        {/* Leave Type */}
        <Body className="font-outfit-semibold mb-2">
          Leave Type<Body style={{ color: '#DC2626' }}>*</Body>
        </Body>
        <TouchableOpacity
          className="flex-row items-center justify-between px-4 py-3.5 rounded-xl mb-5"
          style={{ borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }}
          activeOpacity={0.7}
          onPress={() => {
            console.log('Leave type pressed, showing modal');
            setShowLeaveTypeModal(true);
          }}
        >
          <Body color={leaveType ? 'primary' : 'muted'}>
            {leaveType ? LEAVE_TYPES.find(t => t.value === leaveType)?.label : 'Select the type of leave'}
          </Body>
          <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Start Date */}
        <Input
          label="Start Date"
          required
          placeholder="Select start date (dd/mm/yy)"
          value={startDate}
          onPressIn={() => setShowStartDatePicker(true)}
          editable={false}
          rightIcon={<Ionicons name="calendar-outline" size={20} color="#6B7280" />}
          containerClassName="mb-5"
        />

        {/* End Date */}
        <Input
          label="End Date"
          required
          placeholder="Select end date  (dd/mm/yy)"
          value={endDate}
          onPressIn={() => setShowEndDatePicker(true)}
          editable={false}
          rightIcon={<Ionicons name="calendar-outline" size={20} color="#6B7280" />}
          containerClassName="mb-5"
        />

        <DatePickerModal
          visible={showStartDatePicker}
          onClose={() => setShowStartDatePicker(false)}
          onConfirm={(date) => {
            const dd = date.getDate().toString().padStart(2, '0');
            const mm = (date.getMonth() + 1).toString().padStart(2, '0');
            const yyyy = date.getFullYear();
            setStartDateDate(date);
            setStartDate(`${dd}/${mm}/${yyyy}`);
            setShowStartDatePicker(false);
          }}
          initialDate={startDateDate || new Date()}
          minimumDate={new Date()}
        />

        <DatePickerModal
          visible={showEndDatePicker}
          onClose={() => setShowEndDatePicker(false)}
          onConfirm={(date) => {
            const dd = date.getDate().toString().padStart(2, '0');
            const mm = (date.getMonth() + 1).toString().padStart(2, '0');
            const yyyy = date.getFullYear();
            setEndDateDate(date);
            setEndDate(`${dd}/${mm}/${yyyy}`);
            setShowEndDatePicker(false);
          }}
          initialDate={endDateDate || (startDateDate || new Date())}
          minimumDate={startDateDate || new Date()}
        />

        {/* Reason */}
        <Input
          label="Reason for leave (optional)"
          placeholder="Enter your reason for requesting leave"
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={4}
          containerClassName="mb-6"
        />

        <View className="h-10" />
      </ScrollView>

      {/* Submit Button */}
      <View className="px-5 pb-8 pt-3">
        <Button onPress={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </View>

      {/* Leave Type Modal */}
      <Modal
        visible={showLeaveTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          console.log('Modal request close');
          setShowLeaveTypeModal(false);
        }}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-5">
            <View className="flex-row items-center justify-between mb-4">
              <H3>Select Leave Type</H3>
              <TouchableOpacity onPress={() => setShowLeaveTypeModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>
            {LEAVE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                className="flex-row items-center py-4 border-b border-gray-200 dark:border-gray-700"
                onPress={() => {
                  setLeaveType(type.value);
                  setShowLeaveTypeModal(false);
                }}
              >
                <View className="flex-1">
                  <Body color={isDark ? 'primary' : 'primary'} className="text-base">{type.label}</Body>
                </View>
                {leaveType === type.value && (
                  <Ionicons name="checkmark-circle" size={24} color={primaryColor} />
                )}
              </TouchableOpacity>
            ))}
            <View className="h-4" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default RequestHolidayScreen;
