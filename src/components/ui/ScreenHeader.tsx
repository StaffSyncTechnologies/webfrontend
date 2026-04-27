import React, { useState } from 'react';
import { View, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrgTheme } from '../../contexts';
import { H2, Body, Caption } from './Typography';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  showOrgBranding?: boolean;
  rightAction?: React.ReactNode;
  subtitle?: string;
}

export function ScreenHeader({
  title,
  onBack,
  showOrgBranding = true,
  rightAction,
  subtitle,
}: ScreenHeaderProps) {
  const { primaryColor, orgTheme } = useOrgTheme();
  const isDark = useColorScheme() === 'dark';
  const [logoError, setLogoError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleImageError = () => {
    console.log('Logo image failed to load, attempt:', retryCount + 1);
    if (retryCount < 2) {
      setRetryCount(retryCount + 1);
      // Retry by toggling the error state
      setLogoError(false);
      setTimeout(() => setLogoError(true), 100);
    } else {
      setLogoError(true);
    }
  };

  return (
    <View className="bg-light-background-primary dark:bg-dark-background-primary px-5 pt-4 pb-3">
      <View className="flex-row items-center">
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            className="w-9 h-9 rounded-full items-center justify-center mr-3"
          >
            <Ionicons name="arrow-back" size={22} color={isDark ? '#E5E7EB' : '#111827'} />
          </TouchableOpacity>
        )}

        {showOrgBranding && (
          <>
            {orgTheme?.logoUrl && !logoError ? (
              <Image
                key={`logo-${retryCount}`} // Force remount on retry
                source={{ uri: `${orgTheme.logoUrl}?t=${Date.now()}` }}
                className="w-8 h-8 rounded-lg mr-2.5"
                resizeMode="contain"
                onError={handleImageError}
              />
            ) : (
              <View
                className="w-8 h-8 rounded-lg mr-2.5 items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <Caption className="text-white font-outfit-bold text-[12px]">
                  {(orgTheme?.organizationName || 'S').charAt(0).toUpperCase()}
                </Caption>
              </View>
            )}
          </>
        )}

        <View className="flex-1">
          <H2>{title}</H2>
          {subtitle ? (
            <Caption color="secondary" className="text-[11px]">{subtitle}</Caption>
          ) : showOrgBranding && orgTheme?.organizationName ? (
            <Caption color="secondary" className="text-[11px]">{orgTheme.organizationName}</Caption>
          ) : null}
        </View>

        {rightAction && (
          <View className="ml-3">{rightAction}</View>
        )}
      </View>
    </View>
  );
}

export default ScreenHeader;
