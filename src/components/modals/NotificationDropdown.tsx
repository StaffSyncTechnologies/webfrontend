import { useState, useCallback } from 'react';
import { Box, styled, Modal, CircularProgress } from '@mui/material';
import { Warning, CheckCircle, AccessTime, Check, Info, Chat } from '@mui/icons-material';
import { colors } from '../../utilities/colors';
import { useGetNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from '../../store/slices/notificationSlice';
import type { NotificationItem } from '../../store/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

// ============ TYPES ============
type NotificationType = 'SHIFT_ALERT' | 'SHIFT_ASSIGNED' | 'SHIFT_CANCELLED' | 'PAYROLL' | 'PAYSLIP_READY' | 'HOLIDAY' | 'HOLIDAY_APPROVED' | 'HOLIDAY_REJECTED' | 'SYSTEM' | 'TIMESHEET' | 'ATTENDANCE' | string;
type FilterType = 'all' | 'unread' | 'shift' | 'payroll' | 'holiday' | 'chat' | 'system';

// ============ STYLED COMPONENTS ============
const DropdownOverlay = styled(Box)({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-end',
  paddingTop: '72px',
  paddingRight: '80px',
});

const DropdownCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '16px',
  width: '480px',
  maxWidth: '95vw',
  maxHeight: 'calc(100vh - 100px)',
  display: 'flex',
  flexDirection: 'column',
  outline: 'none',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  marginTop: '8px',
  overflow: 'hidden',
});

const DropdownHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '24px 24px 16px',
  borderBottom: '1px solid #F3F4F6',
});

const HeaderLeft = styled(Box)({});

const DropdownTitle = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '20px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: 0,
});

const DropdownSubtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
  margin: '4px 0 0',
});

const MarkAllReadBtn = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  fontWeight: 500,
  color: colors.primary.navy,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  '&:hover': { backgroundColor: '#F9FAFB' },
});

const FilterTabs = styled(Box)({
  display: 'flex',
  gap: '6px',
  padding: '12px 24px',
  flexWrap: 'wrap',
  borderBottom: '1px solid #F3F4F6',
});

const FilterTab = styled('button', {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  padding: '6px 14px',
  borderRadius: '16px',
  border: active ? 'none' : '1px solid #E5E7EB',
  backgroundColor: active ? colors.primary.navy : colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  fontWeight: 500,
  color: active ? colors.secondary.white : colors.text.secondary,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: active ? colors.primary.navy : '#F9FAFB',
  },
}));

const NotificationsList = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  padding: '8px 0',
});

const NotificationCard = styled(Box)({
  display: 'flex',
  gap: '12px',
  padding: '16px 24px',
  borderBottom: '1px solid #F9FAFB',
  '&:hover': { backgroundColor: '#FAFAFA' },
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
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: bgColors[variant],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    '& svg': {
      fontSize: '18px',
      color: iconColors[variant],
    },
  };
});

const NotificationContent = styled(Box)({
  flex: 1,
  minWidth: 0,
});

const NotificationTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: 0,
});

const NotificationDescription = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
  margin: '2px 0 10px',
});

const NotificationActions = styled(Box)({
  display: 'flex',
  gap: '8px',
});

const ActionButton = styled('button')<{ variant: 'primary' | 'secondary' }>(({ variant }) => ({
  padding: '6px 14px',
  borderRadius: '6px',
  border: variant === 'secondary' ? '1px solid #E5E7EB' : 'none',
  backgroundColor: variant === 'primary' ? colors.primary.navy : colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 500,
  color: variant === 'primary' ? colors.secondary.white : colors.primary.navy,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: variant === 'primary' ? '#1a2d4a' : '#F9FAFB',
  },
}));

const NotificationTime = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  color: colors.text.secondary,
  flexShrink: 0,
});

const LoadMoreBtn = styled('button')({
  display: 'block',
  width: 'calc(100% - 48px)',
  margin: '12px 24px 16px',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
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
  const upperType = type.toUpperCase();
  if (upperType.includes('SHIFT') || upperType.includes('ALERT') || upperType.includes('CANCELLED')) {
    return 'error';
  }
  if (upperType.includes('PAYROLL') || upperType.includes('PAYSLIP') || upperType.includes('APPROVED')) {
    return 'success';
  }
  return 'warning';
};

const getIcon = (type: string) => {
  const upperType = type.toUpperCase();
  if (upperType.includes('SHIFT') || upperType.includes('ALERT') || upperType.includes('CANCELLED')) {
    return <Warning />;
  }
  if (upperType.includes('PAYROLL') || upperType.includes('PAYSLIP') || upperType.includes('APPROVED')) {
    return <CheckCircle />;
  }
  if (upperType.includes('HOLIDAY')) {
    return <AccessTime />;
  }
  if (upperType.includes('CHAT') || upperType.includes('MESSAGE')) {
    return <Chat />;
  }
  return <Info />;
};

const getNotificationCategory = (type: string): string => {
  const upperType = type.toUpperCase();
  if (upperType.includes('SHIFT') || upperType.includes('ATTENDANCE') || upperType.includes('TIMESHEET')) {
    return 'shift';
  }
  if (upperType.includes('PAYROLL') || upperType.includes('PAYSLIP')) {
    return 'payroll';
  }
  if (upperType.includes('HOLIDAY') || upperType.includes('LEAVE')) {
    return 'holiday';
  }
  if (upperType.includes('CHAT') || upperType.includes('MESSAGE')) {
    return 'chat';
  }
  return 'system';
};

// ============ PROPS ============
interface NotificationDropdownProps {
  open: boolean;
  onClose: () => void;
}

// ============ COMPONENT ============
export function NotificationDropdown({ open, onClose }: NotificationDropdownProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  
  const { data, isLoading, refetch } = useGetNotificationsQuery({ page, limit: 20 }, { skip: !open });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: markingAllRead }] = useMarkAllAsReadMutation();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.isRead;
    return getNotificationCategory(n.type) === activeFilter;
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

  const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await markAsRead(notificationId).unwrap();
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  const handleViewDetails = useCallback((notification: NotificationItem) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    onClose();
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
  }, [markAsRead, navigate, onClose]);

  const handleDismiss = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await markAsRead(id).unwrap();
    } catch (error) {
      console.error('Failed to dismiss:', error);
    }
  }, [markAsRead]);

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <DropdownOverlay onClick={onClose}>
        <DropdownCard onClick={(e) => e.stopPropagation()}>
          <DropdownHeader>
            <HeaderLeft>
              <DropdownTitle>Notifications</DropdownTitle>
              <DropdownSubtitle>
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </DropdownSubtitle>
            </HeaderLeft>
            <MarkAllReadBtn onClick={handleMarkAllRead} disabled={markingAllRead || unreadCount === 0}>
              <Check sx={{ fontSize: 16 }} />
              {markingAllRead ? 'Marking...' : 'Mark all as read'}
            </MarkAllReadBtn>
          </DropdownHeader>

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
              <Box sx={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                <CircularProgress size={32} />
              </Box>
            ) : filteredNotifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', padding: '48px', color: colors.text.secondary, fontFamily: "'Outfit', sans-serif" }}>
                {activeFilter === 'all' ? 'No notifications yet' : `No ${filterLabels[activeFilter].toLowerCase()} notifications`}
              </Box>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationCard 
                  key={notification.id} 
                  onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                  sx={{ 
                    backgroundColor: notification.isRead ? 'transparent' : '#F0F9FF',
                    cursor: 'pointer',
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

          {data?.pagination && data.pagination.pages > page && (
            <LoadMoreBtn onClick={() => setPage(p => p + 1)}>
              Load previous notifications
            </LoadMoreBtn>
          )}
        </DropdownCard>
      </DropdownOverlay>
    </Modal>
  );
}

export default NotificationDropdown;
