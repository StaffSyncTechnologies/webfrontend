import React, { useCallback } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme } from '../contexts';
import { H2, Body, Caption } from '../components/ui';
import { useTranslation } from 'react-i18next';
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  NotificationItem,
} from '../store/api/notificationsApi';
import type { RootStackScreenProps } from '../types/navigation';

type Props = RootStackScreenProps<'Notifications'>;

const NOTIFICATION_ICONS: Record<string, { name: string; color: string; bg: string }> = {
  SHIFT_ASSIGNED: { name: 'briefcase', color: '#3B82F6', bg: '#EFF6FF' },
  SHIFT_BROADCAST: { name: 'megaphone', color: '#8B5CF6', bg: '#F5F3FF' },
  SHIFT_REMINDER: { name: 'alarm', color: '#F59E0B', bg: '#FFFBEB' },
  RTW_APPROVED: { name: 'checkmark-circle', color: '#10B981', bg: '#ECFDF5' },
  RTW_REJECTED: { name: 'close-circle', color: '#EF4444', bg: '#FEF2F2' },
  PAYSLIP_READY: { name: 'cash', color: '#10B981', bg: '#ECFDF5' },
  HOLIDAY_APPROVED: { name: 'airplane', color: '#10B981', bg: '#ECFDF5' },
  HOLIDAY_DENIED: { name: 'airplane', color: '#EF4444', bg: '#FEF2F2' },
  GENERAL: { name: 'notifications', color: '#6B7280', bg: '#F3F4F6' },
};

function getIcon(type: string) {
  return NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.GENERAL;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function NotificationsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { t } = useTranslation();
  const { data, isLoading, refetch, isFetching } = useGetNotificationsQuery({ page: 1, limit: 50 });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const handlePress = useCallback(async (item: NotificationItem) => {
    if (!item.isRead) {
      await markAsRead(item.id);
    }
    // Navigate based on notification type
    if (item.referenceId) {
      switch (item.referenceType) {
        case 'SHIFT':
          navigation.navigate('ShiftDetails', { shiftId: item.referenceId });
          break;
        case 'PAYSLIP':
          navigation.navigate('PayslipDetail', { payslipId: item.referenceId });
          break;
        case 'HOLIDAY':
          navigation.navigate('HolidayDetail', { holidayId: item.referenceId });
          break;
      }
    }
  }, [markAsRead, navigation]);

  const handleMarkAllRead = useCallback(async () => {
    if (unreadCount > 0) {
      await markAllAsRead();
    }
  }, [markAllAsRead, unreadCount]);

  const renderItem = useCallback(({ item }: { item: NotificationItem }) => {
    const icon = getIcon(item.type);
    return (
      <TouchableOpacity
        className="flex-row px-5 py-4"
        style={{
          backgroundColor: item.isRead ? 'transparent' : `${primaryColor}06`,
          borderBottomWidth: 0.5,
          borderBottomColor: '#E5E7EB',
        }}
        onPress={() => handlePress(item)}
        activeOpacity={0.6}
      >
        {/* Icon */}
        <View
          className="w-11 h-11 rounded-full items-center justify-center mr-3.5"
          style={{ backgroundColor: icon.bg }}
        >
          <Ionicons name={icon.name as any} size={20} color={icon.color} />
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-0.5">
            <Body
              className={`flex-1 mr-2 ${!item.isRead ? 'font-outfit-semibold' : 'font-outfit-medium'}`}
              numberOfLines={1}
            >
              {item.title}
            </Body>
            <Caption color="muted">{timeAgo(item.createdAt)}</Caption>
          </View>
          <Caption color="secondary" numberOfLines={2} className="leading-5">
            {item.message}
          </Caption>
        </View>

        {/* Unread dot */}
        {!item.isRead && (
          <View className="ml-2 mt-1.5">
            <View
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: primaryColor }}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  }, [handlePress, primaryColor]);

  return (
    <View
      className="flex-1 bg-light-background-primary dark:bg-dark-background-primary"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-light-border-light">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center mr-2"
          >
            <Ionicons name="arrow-back" size={22} color="#374151" />
          </TouchableOpacity>
          <H2>{t('notifications.title')}</H2>
          {unreadCount > 0 && (
            <View
              className="ml-2 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              <Caption className="text-white font-outfit-semibold text-xs">{unreadCount}</Caption>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Caption style={{ color: primaryColor }} className="font-outfit-semibold">
              {t('notifications.markAllRead')}
            </Caption>
          </TouchableOpacity>
        )}
      </View>

      {/* Notification List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-light-background-secondary items-center justify-center mb-4">
            <Ionicons name="notifications-off-outline" size={36} color="#9CA3AF" />
          </View>
          <Body color="secondary" className="text-center font-outfit-medium mb-1">
            {t('notifications.empty')}
          </Body>
          <Caption color="muted" className="text-center">
            {t('notifications.emptyDesc')}
          </Caption>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={primaryColor} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

export default NotificationsScreen;
