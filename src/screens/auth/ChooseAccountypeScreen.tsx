import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, useOrgTheme } from '../../contexts';
import { Container, H1, H2, Body, Caption, Button } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import type { AuthStackScreenProps } from '../../types/navigation';

type Props = AuthStackScreenProps<'ChooseAccountType'>;

type AccountType = 'worker' | 'agency';

const ACCOUNT_TYPE_KEY = '@staffsync_account_type';

export function ChooseAccountTypeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { primaryColor } = useOrgTheme();
  const [selectedType, setSelectedType] = useState<AccountType | null>(null);

  // Restore last chosen account type so the user doesn't have to re-pick every launch
  useEffect(() => {
    AsyncStorage.getItem(ACCOUNT_TYPE_KEY).then((saved) => {
      if (saved === 'worker' || saved === 'agency') {
        setSelectedType(saved);
      }
    });
  }, []);

  const handleContinue = () => {
    if (selectedType === 'worker') {
      AsyncStorage.setItem(ACCOUNT_TYPE_KEY, 'worker');
      navigation.navigate('Login', { role: 'worker' });
    } else if (selectedType === 'agency') {
      AsyncStorage.setItem(ACCOUNT_TYPE_KEY, 'agency');
      navigation.navigate('AgencyLogin');
    }
  };

  return (
    <View
      className="flex-1 bg-light-background-primary dark:bg-dark-background-primary"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Container keyboard padding="lg">
        {/* Logo & Header */}
        <View className="items-center pt-8 pb-6">
          <Image
            source={require('../../../assets/logo.png')}
            className="w-20 h-20 mb-6"
            resizeMode="contain"
          />
          <H1 className="text-center mb-2">{t('auth.chooseAccountType')}</H1>
          <Body color="secondary" className="text-center leading-6 px-4">
            {t('auth.selectAccountType')}
          </Body>
        </View>

        {/* Account Type Cards */}
        <View className="flex-1 gap-4">
          {/* Worker Card */}
          <TouchableOpacity
            className={`p-6 rounded-2xl border-2 ${
              selectedType === 'worker'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-200 bg-white dark:bg-dark-background-secondary dark:border-gray-700'
            }`}
            onPress={() => setSelectedType('worker')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              {/* Icon/Avatar */}
              <View
                className="w-20 h-20 rounded-2xl items-center justify-center mr-4"
                style={{
                  backgroundColor: selectedType === 'worker' ? '#3B82F6' : '#F3F4F6',
                }}
              >
                <Ionicons
                  name="person-outline"
                  size={40}
                  color={selectedType === 'worker' ? '#FFFFFF' : '#6B7280'}
                />
              </View>

              {/* Content */}
              <View className="flex-1">
                <H2 className="mb-1">{t('auth.worker')}</H2>
                <Caption color="secondary" className="leading-5">
                  {t('auth.workerDescription')}
                </Caption>
              </View>

              {/* Selection Indicator */}
              <View
                className="w-6 h-6 rounded-full items-center justify-center"
                style={{
                  borderWidth: 2,
                  borderColor: selectedType === 'worker' ? '#3B82F6' : '#D1D5DB',
                  backgroundColor: selectedType === 'worker' ? '#3B82F6' : 'transparent',
                }}
              >
                {selectedType === 'worker' && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
            </View>

            {/* Features */}
            <View className="flex-row gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Caption color="secondary" className="ml-1">{t('auth.shifts')}</Caption>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="cash-outline" size={16} color="#6B7280" />
                <Caption color="secondary" className="ml-1">{t('auth.payroll')}</Caption>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Caption color="secondary" className="ml-1">{t('auth.timesheets')}</Caption>
              </View>
            </View>
          </TouchableOpacity>

          {/* Agency/Company Card */}
          <TouchableOpacity
            className={`p-6 rounded-2xl border-2 ${
              selectedType === 'agency'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-200 bg-white dark:bg-dark-background-secondary dark:border-gray-700'
            }`}
            onPress={() => setSelectedType('agency')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              {/* Icon/Avatar */}
              <View
                className="w-20 h-20 rounded-2xl items-center justify-center mr-4"
                style={{
                  backgroundColor: selectedType === 'agency' ? '#3B82F6' : '#F3F4F6',
                }}
              >
                <Ionicons
                  name="business-outline"
                  size={40}
                  color={selectedType === 'agency' ? '#FFFFFF' : '#6B7280'}
                />
              </View>

              {/* Content */}
              <View className="flex-1">
                <H2 className="mb-1">{t('auth.agency')}</H2>
                <Caption color="secondary" className="leading-5">
                  {t('auth.agencyDescription')}
                </Caption>
              </View>

              {/* Selection Indicator */}
              <View
                className="w-6 h-6 rounded-full items-center justify-center"
                style={{
                  borderWidth: 2,
                  borderColor: selectedType === 'agency' ? '#3B82F6' : '#D1D5DB',
                  backgroundColor: selectedType === 'agency' ? '#3B82F6' : 'transparent',
                }}
              >
                {selectedType === 'agency' && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
            </View>

            {/* Features */}
            <View className="flex-row gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <View className="flex-row items-center">
                <Ionicons name="people-outline" size={16} color="#6B7280" />
                <Caption color="secondary" className="ml-1">{t('auth.staffing')}</Caption>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="analytics-outline" size={16} color="#6B7280" />
                <Caption color="secondary" className="ml-1">{t('auth.reporting')}</Caption>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="settings-outline" size={16} color="#6B7280" />
                <Caption color="secondary" className="ml-1">{t('auth.management')}</Caption>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <View className="pb-4">
          <Button onPress={handleContinue} disabled={!selectedType}>
            {t('auth.continue')}
          </Button>
        </View>
      </Container>
    </View>
  );
}

export default ChooseAccountTypeScreen;
