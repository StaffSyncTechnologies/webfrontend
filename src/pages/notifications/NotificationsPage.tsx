import { useState, useCallback } from 'react';
import { Box, styled, CircularProgress } from '@mui/material';
import { Check, Warning, CheckCircle, AccessTime, Info, Chat, NotificationsOff } from '@mui/icons-material';
import { colors } from '../../utilities/colors';
import { DashboardContainer } from '../../components/layout/DashboardContainer';
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from '../../store/slices/notificationSlice';
import type { NotificationItem } from '../../store/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

// ============ TYPES ============
type FilterType = 'all' | 'unread' | 'shift' | 'payroll' | 'holiday' | 'chat' | 'system';

// ============ STYLED COMPONENTS ============
const PageContainer = styled(Box)({
  padding: '32px',
  maxWidth: '900px',
});

const PageHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '24px',
});

const PageTitle = styled('h1')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '28px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: 0,
});

const PageSubtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: '4px 0 0',
});

const MarkAllReadBtn = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.navy,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#F9FAFB' },
});

const FilterTabs = styled(Box)({
  display: 'flex',
  gap: '8px',
  marginBottom: '24px',
  flexWrap: 'wrap',
});

const FilterTab = styled('button', {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  padding: '8px 16px',
  borderRadius: '20px',
  border: active ? 'none' : '1px solid #E5E7EB',
  backgroundColor: active ? colors.primary.navy : colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: active ? colors.secondary.white : colors.text.secondary,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: active ? colors.primary.navy : '#F9FAFB',
  },
}));

const NotificationsList = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

const NotificationCard = styled(Box)({
  display: 'flex',
  gap: '16px',
  padding: '20px',
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #F3F4F6',
});

const IconWrapper = styled(Box)<{ variant: 'error' | 'success' | 'warning' }>(({ variant }) => {
  const bgColors = {
    error: '#FEE2E2',
    success: '#D1FAE5',
    warning: '#FEF3C7',
  };
  const iconColors = {
    error: colors.status.error,
    success: colors.status.success,
    warning: '#D97706',
  };
  return {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: bgColors[variant],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    '& svg': {
      fontSize: '20px',
      color: iconColors[variant],
    },
  };
});

const NotificationContent = styled(Box)({
  flex: 1,
});

const NotificationTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: 0,
});

const NotificationDescription = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: '4px 0 12px',
});

const NotificationActions = styled(Box)({
  display: 'flex',
  gap: '8px',
});

const ActionButton = styled('button')<{ variant: 'primary' | 'secondary' }>(({ variant }) => ({
  padding: '8px 16px',
  borderRadius: '6px',
  border: variant === 'secondary' ? '1px solid #E5E7EB' : 'none',
  backgroundColor: variant === 'primary' ? colors.primary.navy : colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  fontWeight: 500,
  color: variant === 'primary' ? colors.secondary.white : colors.primary.navy,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: variant === 'primary' ? '#1a2d4a' : '#F9FAFB',
  },
}));

const NotificationTime = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
  flexShrink: 0,
});

const LoadMoreBtn = styled('button')({
  display: 'block',
  margin: '24px auto 0',
  padding: '12px 24px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.navy,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#F9FAFB' },
});

const filterLabels: Record<FilterType, string> = {
  all: 'All',
  unread: 'Unread',
  shift: 'Shift Alert',
  payroll: 'Payroll',
  holiday: 'Holiday',
  chat: 'Chat',
  system: 'System',
};

// ============ HELPER FUNCTIONS ============
const getIconVariant = (type: string): 'error' | 'success' | 'warning' => {
  const t = type.toUpperCase();
  if (t.includes('SHIFT') || t.includes('ALERT') || t.includes('CANCELLED')) return 'error';
  if (t.includes('PAYROLL') || t.includes('PAYSLIP') || t.includes('APPROVED')) return 'success';
  return 'warning';
};

const getIcon = (type: string) => {
  const t = type.toUpperCase();
  if (t.includes('SHIFT') || t.includes('ALERT') || t.includes('CANCELLED')) return <Warning />;
  if (t.includes('PAYROLL') || t.includes('PAYSLIP') || t.includes('APPROVED')) return <CheckCircle />;
  if (t.includes('HOLIDAY') || t.includes('LEAVE')) return <AccessTime />;
  if (t.includes('CHAT') || t.includes('MESSAGE')) return <Chat />;
  return <Info />;
};

const getCategory = (type: string): string => {
  const t = type.toUpperCase();
  if (t.includes('SHIFT') || t.includes('ATTENDANCE') || t.includes('TIMESHEET')) return 'shift';
  if (t.includes('PAYROLL') || t.includes('PAYSLIP')) return 'payroll';
  if (t.includes('HOLIDAY') || t.includes('LEAVE')) return 'holiday';
  if (t.includes('CHAT') || t.includes('MESSAGE')) return 'chat';
  return 'system';
};

const formatTime = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

// ============ COMPONENT ============
export function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useGetNotificationsQuery({ page, limit: 30 });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: markingAllRead }] = useMarkAllAsReadMutation();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;
  const pagination = data?.pagination;

  const filteredNotifications = notifications.filter((n: NotificationItem) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.isRead;
    return getCategory(n.type) === activeFilter;
  });

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const navigate = useNavigate();

  const handleNotificationClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await markAsRead(id).unwrap();
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  const handleViewDetails = useCallback((notification: NotificationItem) => {
    // Mark as read first
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    const t = notification.type.toUpperCase();
    if (t.includes('CHAT') || t.includes('MESSAGE')) {
      navigate('/chat');
    } else if (t.includes('SHIFT') || t.includes('ATTENDANCE') || t.includes('TIMESHEET')) {
      navigate(notification.referenceId ? `/shifts/${notification.referenceId}` : '/shifts');
    } else if (t.includes('PAYROLL') || t.includes('PAYSLIP')) {
      navigate(notification.referenceId ? `/payroll/${notification.referenceId}` : '/payroll');
    } else if (t.includes('HOLIDAY') || t.includes('LEAVE')) {
      navigate(notification.referenceId ? `/holiday/${notification.referenceId}` : '/holiday');
    } else {
      navigate('/notifications');
    }
  }, [markAsRead, navigate]);

  const handleDismiss = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await markAsRead(id).unwrap();
    } catch (error) {
      console.error('Failed to dismiss:', error);
    }
  }, [markAsRead]);

  return (
    <DashboardContainer>
      <PageContainer>
        <PageHeader>
          <Box>
            <PageTitle>Notifications</PageTitle>
            <PageSubtitle>
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'Stay updated with the latest agency activities and alerts'}
            </PageSubtitle>
          </Box>
          <MarkAllReadBtn onClick={handleMarkAllRead} disabled={markingAllRead || unreadCount === 0}>
            <Check sx={{ fontSize: 18 }} />
            {markingAllRead ? 'Marking...' : 'Mark all as read'}
          </MarkAllReadBtn>
        </PageHeader>

        <FilterTabs>
          {(Object.keys(filterLabels) as FilterType[]).map((filter) => (
            <FilterTab
              key={filter}
              active={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            >
              {filterLabels[filter]}
            </FilterTab>
          ))}
        </FilterTabs>

        <NotificationsList>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={32} />
            </Box>
          ) : filteredNotifications.length === 0 ? (
            <Box sx={{
              textAlign: 'center', py: 8,
              fontFamily: "'Outfit', sans-serif", color: colors.text.secondary,
            }}>
              <NotificationsOff sx={{ fontSize: 48, color: '#D1D5DB', mb: 2 }} />
              <Box sx={{ fontSize: '16px', fontWeight: 600, color: colors.primary.navy, mb: 1 }}>
                {activeFilter === 'all' ? 'No notifications yet' : `No ${filterLabels[activeFilter].toLowerCase()} notifications`}
              </Box>
              <Box sx={{ fontSize: '14px' }}>
                Notifications will appear here when there are updates
              </Box>
            </Box>
          ) : (
            filteredNotifications.map((notification: NotificationItem) => (
              <NotificationCard
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                sx={{
                  backgroundColor: notification.isRead ? 'transparent' : '#F0F9FF',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <IconWrapper variant={getIconVariant(notification.type)}>
                  {getIcon(notification.type)}
                </IconWrapper>
                <NotificationContent>
                  <NotificationTitle>{notification.title}</NotificationTitle>
                  <NotificationDescription>{notification.message}</NotificationDescription>
                  <NotificationActions>
                    <ActionButton variant="primary" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleViewDetails(notification); }}>View Details</ActionButton>
                    {!notification.isRead && (
                      <ActionButton variant="secondary" onClick={(e: React.MouseEvent) => handleDismiss(e, notification.id)}>Dismiss</ActionButton>
                    )}
                  </NotificationActions>
                </NotificationContent>
                <NotificationTime>{formatTime(notification.createdAt)}</NotificationTime>
              </NotificationCard>
            ))
          )}
        </NotificationsList>

        {pagination && pagination.pages > page && (
          <LoadMoreBtn onClick={() => setPage((p) => p + 1)}>
            Load previous notifications
          </LoadMoreBtn>
        )}
      </PageContainer>
    </DashboardContainer>
  );
}

export default NotificationsPage;
