import { useGetUnreadCountQuery } from '../store/api/notificationsApi';
import { useAppSelector } from '../store/hooks';

export function useNotificationBadge() {
  const isAuthenticated = useAppSelector((state) => state?.auth.isAuthenticated);

  const { data: unreadCount, isLoading, error, refetch } = useGetUnreadCountQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    skip: !isAuthenticated,
  });

  const count = unreadCount || 0;
  const hasUnread = count > 0;

  return {
    count,
    isLoading,
    hasUnread,
    error,
    refetch,
    isAuthenticated,
  };
}
