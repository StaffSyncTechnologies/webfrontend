import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme } from '../contexts';
import { H2, Body, Button } from '../components/ui';

export function ShiftConfirmedScreen({ route, navigation }: RootStackScreenProps<'ShiftConfirmed'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { shiftTitle, date, time, location } = route.params;

  return (
    <View
      className="flex-1 bg-light-background-primary dark:bg-dark-background-primary px-5"
      style={{ paddingTop: insets.top }}
    >
      {/* Centered Content */}
      <View className="flex-1 items-center justify-center pb-20">
        {/* Checkmark */}
        <View className="mb-6">
          <Ionicons name="checkmark" size={72} color="#22C55E" />
        </View>

        {/* Title */}
        <H2 className="mb-4 text-center">Shift Confirmed</H2>

        {/* Description */}
        <Body color="secondary" className="text-center px-4 leading-6">
          You are booked as a <Body className="font-outfit-bold">{shiftTitle}</Body> on{' '}
          {date} from {time} at{' '}
          <Body className="font-outfit-bold">{location}</Body>.
        </Body>
      </View>

      {/* Bottom Buttons */}
      <View className="pb-10">
        <Button
          onPress={() => {
            navigation.navigate('Main', { screen: 'Schedule' });
          }}
          className="mb-3"
        >
          View my schedules
        </Button>

        <Button
          variant="outline"
          onPress={() => {
            navigation.navigate('Main', { screen: 'Shifts' });
          }}
        >
          Find more shifts
        </Button>
      </View>
    </View>
  );
}

export default ShiftConfirmedScreen;
