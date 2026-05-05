import React from 'react';
import { View, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme, useTheme } from '../contexts';
import { H2, Body } from '../components/ui';

export function AppearanceScreen({ navigation }: RootStackScreenProps<'Appearance'>) {
  const insets = useSafeAreaInsets();
  const { secondaryColor } = useOrgTheme();
  const { themeMode, setThemeMode, isDark, theme } = useTheme();

  const trackColor = secondaryColor || '#38BDF8';

  const options: { label: string; value: 'light' | 'dark' | 'system' }[] = [
    { label: 'System default', value: 'system' },
    { label: 'Light mode', value: 'light' },
    { label: 'Dark mode', value: 'dark' },
  ];

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    console.log('Changing theme to:', mode);
    setThemeMode(mode);
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000035'} />
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
              value={themeMode === option.value}
              onValueChange={() => handleThemeChange(option.value)}
              trackColor={{ false: isDark ? '#2D2D44' : '#E2E8F0', true: '#38BDF8' }}
              thumbColor={themeMode === option.value ? '#FFFFFF' : (isDark ? '#E2E8F0' : '#FFFFFF')}
              ios_backgroundColor={isDark ? '#2D2D44' : '#E2E8F0'}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

export default AppearanceScreen;
