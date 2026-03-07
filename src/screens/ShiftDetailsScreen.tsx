import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme } from '../contexts';
import { H2, H3, Body, Caption, Button } from '../components/ui';

export function ShiftDetailsScreen({ route, navigation }: RootStackScreenProps<'ShiftDetails'>) {
  const insets = useSafeAreaInsets();
  const { shiftId } = route.params;
  const { primaryColor } = useOrgTheme();

  const shift = {
    id: shiftId,
    title: 'Warehouse Operative',
    status: 'urgent' as const,
    location: 'New York, London',
    distance: '10km away',
    date: 'Mon, October 4',
    time: '06:00PM - 08:00PM',
    hourlyRate: '£10.00/hr',
    totalPay: '£40.00',
    responsibilities: [
      'Pick and pack customer orders',
      'Load and unload delivery trucks',
      'Maintain warehouse cleanliness and safety standards',
      'Operate handheld scanners and warehouse systems',
    ],
    requirements: [
      'Basic Warehouse Experience (Preferred)',
      'Ability to Lift 20kg Safely',
      'Safety Boots & High Visibility Vest',
      'Right to Work Documentation',
    ],
  };

  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    urgent: { label: 'URGENT', bg: '#DCFCE7', text: '#16A34A' },
    limited_slot: { label: 'LIMITED SLOT', bg: '#DCFCE7', text: '#16A34A' },
    high_pay: { label: 'HIGH PAY', bg: '#DCFCE7', text: '#16A34A' },
    confirmed: { label: 'CONFIRMED', bg: '#DBEAFE', text: '#2563EB' },
  };

  const statusInfo = statusConfig[shift.status];

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color="#000035" />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <H2>Shifts</H2>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Title + Badge */}
        <View className="px-5 pt-2 pb-1">
          <View className="flex-row items-center justify-between mb-2">
            <H2>{shift.title}</H2>
            {statusInfo && (
              <View className="px-2.5 py-1 rounded" style={{ backgroundColor: statusInfo.bg }}>
                <Caption className="font-outfit-bold" style={{ color: statusInfo.text, fontSize: 10 }}>
                  {statusInfo.label}
                </Caption>
              </View>
            )}
          </View>

          {/* Location */}
          <View className="flex-row items-center gap-1.5 mb-1.5">
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Body color="secondary">{shift.location} • {shift.distance}</Body>
          </View>

          {/* Date & Time */}
          <View className="flex-row items-center gap-1.5 mb-4">
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Body color="secondary">{shift.date} • {shift.time}</Body>
          </View>
        </View>

        {/* Divider */}
        <View className="h-px bg-light-border-light dark:bg-dark-border-light mx-5" />

        {/* Pay Rate */}
        <View className="px-5 py-5">
          <H3 className="mb-3">Pay Rate</H3>
          <View className="flex-row">
            <View className="flex-1 pr-4 border-r border-light-border-light dark:border-dark-border-light">
              <Caption color="secondary" className="mb-1 underline">Hourly pay per shift</Caption>
              <H2>{shift.hourlyRate}</H2>
            </View>
            <View className="flex-1 pl-4">
              <Caption color="secondary" className="mb-1 underline">Total Pay per shift</Caption>
              <H2>{shift.totalPay}</H2>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View className="h-2 bg-light-background-secondary dark:bg-dark-background-secondary" />

        {/* Location Map */}
        <View className="px-5 py-5">
          <H3 className="mb-3">Location</H3>
          <View className="h-44 rounded-xl overflow-hidden bg-light-background-secondary dark:bg-dark-background-secondary">
            <Image
              source={{ uri: 'https://maps.googleapis.com/maps/api/staticmap?center=Washington,DC&zoom=9&size=600x300&maptype=roadmap&key=placeholder' }}
              className="w-full h-full"
              resizeMode="cover"
            />
            {/* Map placeholder overlay */}
            <View className="absolute inset-0 items-center justify-center bg-light-background-secondary dark:bg-dark-background-secondary">
              <Ionicons name="map-outline" size={40} color="#9CA3AF" />
              <Caption color="muted" className="mt-1">Map View</Caption>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View className="h-2 bg-light-background-secondary dark:bg-dark-background-secondary" />

        {/* Responsibilities */}
        <View className="px-5 py-5">
          <H3 className="mb-4">Responsibilities</H3>
          {shift.responsibilities.map((item, index) => (
            <View key={index} className="flex-row items-start gap-3 mb-3">
              <Ionicons name="checkmark" size={20} color="#6B7280" style={{ marginTop: 2 }} />
              <Body color="secondary" className="flex-1">{item}</Body>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View className="h-2 bg-light-background-secondary dark:bg-dark-background-secondary" />

        {/* Requirements */}
        <View className="px-5 py-5">
          <H3 className="mb-4">Requirements</H3>
          {shift.requirements.map((item, index) => (
            <View key={index} className="flex-row items-start gap-3 mb-3">
              <Ionicons name="checkmark" size={20} color="#6B7280" style={{ marginTop: 2 }} />
              <Body color="secondary" className="flex-1">{item}</Body>
            </View>
          ))}
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Accept Shift Button */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-3 bg-light-background-primary dark:bg-dark-background-primary border-t border-light-border-light dark:border-dark-border-light">
        <Button onPress={() => navigation.navigate('ShiftConfirmed', {
          shiftTitle: shift.title,
          date: 'Wednesday, 04 Oct',
          time: '06:00 PM to 08:00 PM',
          location: shift.location,
        })}>
          Accept Shift
        </Button>
      </View>
    </View>
  );
}

export default ShiftDetailsScreen;
