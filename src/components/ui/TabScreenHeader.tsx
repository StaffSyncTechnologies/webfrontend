import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrgTheme } from '../../contexts';
import { H2, Body, Caption } from './Typography';

interface TabScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  showOrgBranding?: boolean;
}

export function TabScreenHeader({
  title,
  subtitle,
  rightAction,
  showOrgBranding = false,
}: TabScreenHeaderProps) {
  const { primaryColor, orgTheme } = useOrgTheme();

  return (
    <View className="bg-light-background-primary dark:bg-dark-background-primary px-5 pt-4 pb-3">
      <View className="flex-row items-center justify-between">
        {/* Left side - Title and optional branding */}
        <View className="flex-1 flex-row items-center">
          {showOrgBranding && (
            <>
              {orgTheme?.logoUrl ? (
                <Image
                  source={{ uri: `${orgTheme.logoUrl}?t=${Date.now()}` }}
                  className="w-7 h-7 rounded-lg mr-2.5"
                  resizeMode="contain"
                />
              ) : (
                <View
                  className="w-7 h-7 rounded-lg mr-2.5 items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Caption className="text-white font-outfit-bold text-[10px]">
                    {(orgTheme?.organizationName || 'S').charAt(0).toUpperCase()}
                  </Caption>
                </View>
              )}
            </>
          )}
          <View>
            <H2 className="text-2xl">{title}</H2>
            {subtitle && (
              <Caption color="secondary" className="text-[11px] mt-0.5">{subtitle}</Caption>
            )}
          </View>
        </View>

        {/* Right side - Action */}
        {rightAction && (
          <View className="ml-3">{rightAction}</View>
        )}
      </View>
    </View>
  );
}

export default TabScreenHeader;
