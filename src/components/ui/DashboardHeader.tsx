import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrgTheme } from '../../contexts';
import { Body, Caption } from './Typography';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  showLogo?: boolean;
  showOrgName?: boolean;
}

export function DashboardHeader({
  title,
  subtitle,
  rightAction,
  showLogo = true,
  showOrgName = true,
}: DashboardHeaderProps) {
  const { primaryColor, orgTheme } = useOrgTheme();
  const workerName = orgTheme?.organizationName || 'StaffSync';

  return (
    <View className="bg-light-background-primary dark:bg-dark-background-primary px-5 pt-4 pb-3">
      <View className="flex-row items-center justify-between">
        {/* Left side - Logo and Organization Name */}
        <View className="flex-1 flex-row items-center">
          {showLogo && (
            <>
              {orgTheme?.logoUrl ? (
                <Image
                  source={{ uri: `${orgTheme.logoUrl}?t=${Date.now()}` }}
                  className="w-9 h-9 rounded-xl mr-3"
                  resizeMode="contain"
                />
              ) : (
                <View
                  className="w-9 h-9 rounded-xl mr-3 items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Caption className="text-white font-outfit-bold text-[14px]">
                    {(orgTheme?.organizationName || 'S').charAt(0).toUpperCase()}
                  </Caption>
                </View>
              )}
            </>
          )}
          {showOrgName && orgTheme?.organizationName && (
            <View>
              <Body className="font-outfit-semibold text-lg">{orgTheme.organizationName}</Body>
              <Caption color="secondary" className="text-[11px]">Worker Portal</Caption>
            </View>
          )}
        </View>

        {/* Right side - Action */}
        {rightAction && (
          <View className="ml-3">{rightAction}</View>
        )}
      </View>
    </View>
  );
}

export default DashboardHeader;
