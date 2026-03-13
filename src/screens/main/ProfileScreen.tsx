import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabScreenProps } from '../../types/navigation';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useAuth } from '../../hooks/useAuth';
import { H2, H3, Body, Caption } from '../../components/ui';
import { useGetMeQuery } from '../../store/api/authApi';
import { useGetMyRTWQuery } from '../../store/api/workerApi';

import { useTranslation } from 'react-i18next';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  subtitle?: string;
  subtitleColor?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

function getRTWSubtitle(status?: string, expiresAt?: string | null): { subtitle: string; subtitleColor: string } {
  if (status === 'APPROVED') {
    if (expiresAt) {
      const d = new Date(expiresAt);
      const label = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase();
      return { subtitle: `VALID UNTIL ${label}`, subtitleColor: '#16A34A' };
    }
    return { subtitle: 'VERIFIED', subtitleColor: '#16A34A' };
  }
  if (status === 'PENDING') return { subtitle: 'PENDING', subtitleColor: '#D97706' };
  if (status === 'REJECTED') return { subtitle: 'REJECTED', subtitleColor: '#DC2626' };
  if (status === 'EXPIRED') return { subtitle: 'EXPIRED', subtitleColor: '#DC2626' };
  return { subtitle: 'NOT STARTED', subtitleColor: '#6B7280' };
}

// Static sections built inside the component to use translations

export function ProfileScreen({ navigation }: MainTabScreenProps<'Profile'>) {
  const insets = useSafeAreaInsets();
  const worker = useAppSelector((state) => state.auth.worker);
  const { logout } = useAuth();
  const { data: profile } = useGetMeQuery();
  const { data: rtw } = useGetMyRTWQuery();
  const { t } = useTranslation();

  const displayName = profile?.data?.fullName || worker?.fullName || 'Worker';
  const employeeId = profile?.data?.id ? profile.data.id.slice(-8).toUpperCase() : '--------';
  const profilePicUrl = worker?.profilePicUrl || null;

  const handleLogout = () => {
    logout();
  };

  const rtwData = rtw?.data;
  const rtwInfo = getRTWSubtitle(rtwData?.rtwStatus, rtwData?.rtwExpiresAt);

  const MENU_SECTIONS: MenuSection[] = [
    {
      title: t('profile.personalInfo'),
      items: [
        { icon: 'person-outline', label: t('profile.profileDetails'), route: 'ProfileDetails' },
        { icon: 'settings-outline', label: t('profile.skillsCertificate'), route: 'SkillsCertificate' },
        { icon: 'document-outline', label: t('profile.rightToWork'), route: 'RightToWork', subtitle: rtwInfo.subtitle, subtitleColor: rtwInfo.subtitleColor },
      ],
    },
    {
      title: t('profile.generalSettings'),
      items: [
        { icon: 'lock-closed-outline', label: t('profile.changePassword'), route: 'ChangePassword' },
        { icon: 'notifications-outline', label: t('profile.notification'), route: 'NotificationSettings' },
        { icon: 'globe-outline', label: t('profile.language'), route: 'Language' },
        { icon: 'color-palette-outline', label: t('profile.appearance'), route: 'Appearance' },
      ],
    },
    {
      title: t('profile.support'),
      items: [
        { icon: 'headset-outline', label: t('profile.chatManager'), route: 'ChatList' },
        { icon: 'shield-outline', label: t('profile.privacyPolicy'), route: 'PrivacyPolicy' },
        { icon: 'document-text-outline', label: t('profile.termsCondition'), route: 'PrivacyPolicy' },
      ],
    },
  ];



  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center py-4">
          <H2>{t('profile.title')}</H2>
        </View>

        {/* Avatar + Name */}
        <View className="flex-row items-center px-5 pb-5">
          <View className="relative mr-4">
            <View className="w-16 h-16 rounded-full bg-gray-300 items-center justify-center overflow-hidden">
              {profilePicUrl ? (
                <Image source={{ uri: profilePicUrl }} className="w-16 h-16" />
              ) : (
                <Ionicons name="person" size={28} color="#6B7280" />
              )}
            </View>
          </View>
          <View>
            <View className="flex-row items-center gap-1.5">
              <H3 className="text-lg">{displayName}</H3>
              <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
            </View>
            <Caption color="secondary">{t('profile.employeeId')}: {employeeId}</Caption>
          </View>
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} className="px-5 mb-4">
            <Caption color="secondary" className="font-outfit-semibold mb-2">{section.title}</Caption>

            {section.items.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="flex-row items-center py-3.5"
                onPress={() => navigation.getParent()?.navigate(item.route as any)}
                activeOpacity={0.6}
              >
                <View className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#F3F4F6' }}>
                  <Ionicons name={item.icon} size={18} color="#374151" />
                </View>
                <View className="flex-1">
                  <Body>{item.label}</Body>
                  {item.subtitle && (
                    <Caption className="font-outfit-semibold" style={{ color: item.subtitleColor || '#6B7280' }}>
                      {item.subtitle}
                    </Caption>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout */}
        <View className="px-5 pt-4 pb-10">
          <TouchableOpacity
            className="flex-row items-center justify-center py-3.5 rounded-xl"
            style={{ borderWidth: 1, borderColor: '#DC2626' }}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={18} color="#DC2626" />
            <Body className="font-outfit-semibold ml-2" style={{ color: '#DC2626' }}>{t('profile.logout')}</Body>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

export default ProfileScreen;
