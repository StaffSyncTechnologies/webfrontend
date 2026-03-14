import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { H2, Body, Button } from '../components/ui';

export function HolidayRequestSubmittedScreen({ navigation }: RootStackScreenProps<'HolidayRequestSubmitted'>) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-light-background-primary dark:bg-dark-background-primary px-5"
      style={{ paddingTop: insets.top }}
    >
      {/* Centered Content */}
      <View className="flex-1 items-center justify-center pb-20">
        <View className="mb-6">
          <Ionicons name="checkmark" size={72} color="#22C55E" />
        </View>

        <H2 className="mb-4 text-center">Request Submitted</H2>

        <Body color="secondary" className="text-center px-4 leading-6">
          Your request will be sent to your manager for approval. You'll be notified once it's reviewed.
        </Body>
      </View>

      {/* Bottom Buttons */}
      <View className="pb-10">
        <Button
          onPress={() => navigation.navigate('Holidays')}
          className="mb-3"
        >
          View my request
        </Button>

        <Button
          variant="outline"
          onPress={() => navigation.navigate('Holidays')}
        >
          Back to holiday
        </Button>
      </View>
    </View>
  );
}

export default HolidayRequestSubmittedScreen;
