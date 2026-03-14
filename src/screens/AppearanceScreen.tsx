import React, { useState } from 'react';
import { View, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme } from '../contexts';
import { H2, Body } from '../components/ui';

type ThemeMode = 'default' | 'light' | 'dark';

export function AppearanceScreen({ navigation }: RootStackScreenProps<'Appearance'>) {
  const insets = useSafeAreaInsets();
  const { secondaryColor } = useOrgTheme();
  const [mode, setMode] = useState<ThemeMode>('default');

  const trackColor = secondaryColor || '#38BDF8';

  const options: { label: string; value: ThemeMode }[] = [
    { label: 'Default mode', value: 'default' },
    { label: 'Light mode', value: 'light' },
    { label: 'Dark mode', value: 'dark' },
  ];

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color="#000035" />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <H2>Appearance</H2>
        </View>
      </View>

      <View className="px-5 pt-2">
        {options.map((option) => (
          <View key={option.value} className="flex-row items-center justify-between py-4">
            <Body className="font-outfit-semibold">{option.label}</Body>
            <Switch
              value={mode === option.value}
              onValueChange={() => setMode(option.value)}
              trackColor={{ false: '#E2E8F0', true: trackColor }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E2E8F0"
            />
          </View>
        ))}
      </View>
    </View>
  );
}

export default AppearanceScreen;
