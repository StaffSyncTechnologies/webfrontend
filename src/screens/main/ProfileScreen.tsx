import React from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabScreenProps } from '../../types/navigation';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useAuth } from '../../hooks/useAuth';
import { H2, H3, Body, Caption, TabScreenHeader } from '../../components/ui';
import { AuthenticatedImage } from '../../components/ui/AuthenticatedImage';
import { useGetMeQuery } from '../../store/api/authApi';
import { useGetMyRTWQuery, useDeleteMyAccountMutation } from '../../store/api/workerApi';
import { API_BASE } from '../../services/endpoints';

import { useTranslation } from 'react-i18next';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route?: string;
  subtitle?: string;
  subtitleColor?: string;
  onPress?: () => void;
  destructive?: boolean;
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
  const isDark = useColorScheme() === 'dark';
  const workerData = useAppSelector((state) => state.auth.worker);
  const { logout } = useAuth();
  const { data: profile, refetch: refetchMe } = useGetMeQuery();
  const { data: rtw } = useGetMyRTWQuery();
  const { t } = useTranslation();
  const [deleteMyAccount, { isLoading: isDeleting }] = useDeleteMyAccountMutation();

  // Use fresh data from API if available, fallback to Redux store
  const worker = profile?.data || workerData;

  const displayName = profile?.data?.fullName || workerData?.fullName || 'Worker';
  const employeeId = profile?.data?.id && typeof profile.data.id === 'string' 
    ? profile.data.id.slice(-8).toUpperCase() 
    : workerData?.id && typeof workerData.id === 'string'
      ? workerData.id.slice(-8).toUpperCase()
      : '--------';
  const profilePicUrl = worker?.profilePicUrl && typeof worker.profilePicUrl === 'string'
    ? (worker.profilePicUrl.startsWith('http') 
        ? worker.profilePicUrl 
        : `${API_BASE}${worker.profilePicUrl}`)
    : null;

  // Force refetch on component mount to get latest data
  React.useEffect(() => {
    refetchMe();
  }, [refetchMe]);

  // Check if current user has profile picture
  React.useEffect(() => {
    if (worker?.email && !worker?.profilePicUrl) {
      refetchMe();
    }
  }, [worker, refetchMe]);

  const handleLogout = () => {
    logout();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMyAccount().unwrap();
              // Logout after successful deletion
              logout();
            } catch (error: any) {
              Alert.alert(
                'Deletion Failed',
                error?.data?.message || 'Failed to delete account. Please try again.'
              );
            }
          },
        },
      ]
    );
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
    {
      title: 'Danger Zone',
      items: [
        { icon: 'trash-outline', label: 'Delete Account', onPress: handleDeleteAccount, destructive: true },
      ],
    },
  ];



  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TabScreenHeader
          title={t('profile.title')}
          subtitle="Manage your account and settings"
          showOrgBranding={true}
        />

        {/* Avatar + Name */}
        <View className="flex-row items-center px-5 pb-5">
          <View className="relative mr-4">
            <View className="w-16 h-16 rounded-full bg-gray-300 items-center justify-center overflow-hidden">
              {profilePicUrl ? (
                <Image 
                  source={{ uri: profilePicUrl }} 
                  className="w-16 h-16" 
                />
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
                onPress={item.onPress || (() => navigation.getParent()?.navigate(item.route as any))}
                activeOpacity={0.6}
                disabled={isDeleting}
              >
                <View className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${item.destructive ? 'bg-red-100 dark:bg-red-900/30' : ''}`} style={{ backgroundColor: item.destructive ? undefined : (isDark ? '#2D2D44' : '#F3F4F6') }}>
                  <Ionicons name={item.icon} size={18} color={item.destructive ? '#DC2626' : (isDark ? '#E5E7EB' : '#374151')} />
                </View>
                <View className="flex-1">
                  <Body style={{ color: item.destructive ? '#DC2626' : undefined }}>{item.label}</Body>
                  {item.subtitle && (
                    <Caption className="font-outfit-semibold" style={{ color: item.subtitleColor || '#6B7280' }}>
                      {item.subtitle}
                    </Caption>
                  )}
                </View>
                {item.destructive ? (
                  <Ionicons name="chevron-forward" size={18} color="#DC2626" />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={isDark ? '#6B6B80' : '#9CA3AF'} />
                )}
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
