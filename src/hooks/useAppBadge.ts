import { useEffect, useCallback } from 'react';
import { useNotifications } from './useNotifications';
import { useGetUnreadCountQuery } from '../store/api/notificationsApi';
import { useAppSelector } from '../store/hooks';

export function useAppBadge() {
  const { setBadgeCount, clearBadgeCount } = useNotifications();
  const { data: unreadCount, isLoading } = useGetUnreadCountQuery();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Update badge count when unread count changes
  useEffect(() => {
    if (!isAuthenticated || isLoading) {
      return;
    }

    const count = unreadCount || 0;
    setBadgeCount(count);
  }, [unreadCount, isAuthenticated, isLoading, setBadgeCount]);

  // Clear badge when user logs out
  const clearBadgeOnLogout = useCallback(() => {
    clearBadgeCount();
  }, [clearBadgeCount]);

  // Manual badge control
  const updateBadge = useCallback((count: number) => {
    setBadgeCount(count);
  }, [setBadgeCount]);

  return {
    updateBadge,
    clearBadgeOnLogout,
    currentCount: unreadCount || 0,
  };
}
