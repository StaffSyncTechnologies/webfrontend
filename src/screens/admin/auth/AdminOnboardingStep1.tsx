import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useOrgTheme } from '../../../contexts';
import { Body, Caption } from '../../../components/ui';

interface Props {
  accountType: 'company' | 'agency' | 'team' | null;
  setAccountType: (type: 'company' | 'agency' | 'team' | null) => void;
}

export function AdminOnboardingStep1({ accountType, setAccountType }: Props) {
  const { isDark } = useTheme();
  const { primaryColor } = useOrgTheme();

  return (
    <View className="gap-4">
      <View className="grid grid-cols-2 gap-4">
        <TouchableOpacity
          className={`p-4 rounded-xl border-2 ${accountType === 'company' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 bg-white dark:bg-dark-background-secondary dark:border-gray-700'}`}
          onPress={() => setAccountType('company')}
        >
          <View className="w-12 h-12 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: primaryColor }}>
            <Ionicons name="business-outline" size={24} color="#FFFFFF" />
          </View>
          <Body className="font-outfit-bold text-xs mb-1">COMPANY</Body>
          <Body className="text-sm font-outfit-semibold mb-2">I hire workers</Body>
          <Caption color="secondary" className="text-xs">Direct hiring</Caption>
        </TouchableOpacity>

        <TouchableOpacity
          className={`p-4 rounded-xl border-2 ${accountType === 'agency' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 bg-white dark:bg-dark-background-secondary dark:border-gray-700'}`}
          onPress={() => setAccountType('agency')}
        >
          <View className="w-12 h-12 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: primaryColor }}>
            <Ionicons name="business-outline" size={24} color="#FFFFFF" />
          </View>
          <Body className="font-outfit-bold text-xs mb-1">AGENCY</Body>
          <Body className="text-sm font-outfit-semibold mb-2">I supply workers</Body>
          <Caption color="secondary" className="text-xs">Multiple clients</Caption>
        </TouchableOpacity>

        <TouchableOpacity
          className={`p-4 rounded-xl border-2 ${accountType === 'team' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 bg-white dark:bg-dark-background-secondary dark:border-gray-700'}`}
          onPress={() => setAccountType('team')}
        >
          <View className="w-12 h-12 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: primaryColor }}>
            <Ionicons name="people-outline" size={24} color="#FFFFFF" />
          </View>
          <Body className="font-outfit-bold text-xs mb-1">TEAM MEMBER</Body>
          <Body className="text-sm font-outfit-semibold mb-2">Join with invite code</Body>
          <Caption color="secondary" className="text-xs">Join existing team</Caption>
        </TouchableOpacity>
      </View>
    </View>
  );
}
