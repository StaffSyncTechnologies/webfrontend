import React, { useState, useMemo, useEffect} from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOrgTheme, useTheme, useToast } from '../../../contexts';
import { H2, H3, Body, Caption, Card, Badge } from '../../../components/ui';
import { useGetPendingApprovalsQuery, useGetAdminStatsQuery, useGetRecentActivityQuery } from '../../../store/slices/adminSlices/dashboardSlice';
import { useInviteWorkerMutation } from '../../../store/slices/adminSlices/workerSlice';
import { useGetUnreadCountQuery } from '../../../store/slices/adminSlices/notificationSlice';
import { useGetSubscriptionSummaryQuery } from '../../../store/api/subscriptionApi';
import { useAppSelector } from '../../../store/hooks';
import InviteWorkerModal  from '../worker/InviteWorkerModal';
import { API_BASE_ROOT } from '../../../services/endpoints';

export function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const toast = useToast();
  const navigation = useNavigation();
  const { data: pendingData, isLoading: pendingLoading } = useGetPendingApprovalsQuery();
  const { data: subscriptionData, isLoading: subscriptionLoading } = useGetSubscriptionSummaryQuery();
  const { data: statsData, isLoading: statsLoading } = useGetAdminStatsQuery();
  const { data: activityData, isLoading: activityLoading } = useGetRecentActivityQuery({ limit: 10 });
  const [inviteWorker] = useInviteWorkerMutation();
  const organizationName = useAppSelector((state) => state.auth.admin?.organizationName || state.auth.admin?.organization?.name);
  const organizationLogo = useAppSelector((state) => {
    const logoUrl = state.auth.admin?.logoUrl || state.auth.admin?.organization?.logoUrl;
    // Prepend base URL if logoUrl is a relative path
    if (logoUrl && !logoUrl.startsWith('http')) {
      return `${API_BASE_ROOT}${logoUrl}`;
    }
    return logoUrl;
  });
  const adminRole = useAppSelector((state) => state.auth.admin?.role);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { data: unreadData } = useGetUnreadCountQuery(undefined, { pollingInterval: 60000 });
  const unreadCount = (unreadData as any)?.count ?? (unreadData as any)?.data?.count ?? (typeof unreadData === 'number' ? unreadData : 0);

  // Process stats data
  const stats = useMemo(() => ({
    totalWorkers: statsData?.totalWorkers?.value ?? 0,
    totalClients: statsData?.totalClients?.value ?? 0,
    totalRevenue: statsData?.totalRevenue?.value ?? 0,
    shiftsToday: statsData?.shiftsToday?.value ?? 0,
    changes: {
      workers: statsData?.totalWorkers?.change ?? 0,
      clients: statsData?.totalClients?.change ?? 0,
      revenue: statsData?.totalRevenue?.change ?? 0,
      shifts: statsData?.shiftsToday?.change ?? 0,
    },
  }), [statsData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatShiftTime = (clockIn: string, clockOut: string) => {
    const inDate = new Date(clockIn);
    const outDate = new Date(clockOut);
    const inTime = inDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const outTime = outDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return `${inTime} - ${outTime}`;
  };

  const handleInviteWorker = async (workerData: any) => {
    console.log('Inviting worker:', workerData);
    try {
      await inviteWorker(workerData).unwrap();
      setShowInviteModal(false);
       toast.success('Worker invited successfully');
    } catch (error) {
      console.error('Failed to invite worker:', error);
      toast.error('Failed to invite worker');
    }
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-5 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1 flex-row items-center">
            {organizationLogo ? (
              <Image 
                source={{ uri: organizationLogo }} 
                className="w-10 h-10 rounded-full mr-3"
                resizeMode="contain"
              />
            ) : (
              <View className="w-10 h-10 rounded-full mr-3 bg-light-background-secondary dark:bg-dark-background-secondary items-center justify-center">
                <Ionicons name="business-outline" size={20} color="#9CA3AF" />
              </View>
            )}
            <View>
              <H3>{organizationName || 'Admin Dashboard'}</H3>
              {adminRole && <Caption color="secondary">{adminRole}</Caption>}
            </View>
          </View>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-light-background-secondary dark:bg-dark-background-secondary items-center justify-center"
            onPress={() => (navigation as any).navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color={isDark ? '#FFFFFF' : '#000035'} />
            {unreadCount > 0 && (
              <View style={{
                position: 'absolute', top: -2, right: -2,
                backgroundColor: '#EF4444', borderRadius: 10,
                minWidth: 18, height: 18,
                alignItems: 'center', justifyContent: 'center',
                paddingHorizontal: 4,
              }}>
                <Caption className="text-white font-outfit-bold" style={{ fontSize: 10, lineHeight: 12 }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Caption>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Subscription Info */}
        <Card className="p-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Caption color="secondary" className="mb-1">Subscription Plan</Caption>
            <Body className="font-outfit-semibold">
              {subscriptionLoading ? 'Loading...' : (subscriptionData?.planName || 'Free Trial')}
              {!subscriptionLoading && subscriptionData?.daysRemaining !== null && subscriptionData?.daysRemaining !== undefined && (
                <Caption color={subscriptionData.daysRemaining <= 30 ? 'warning' : 'secondary'} className="ml-2">
                  ({subscriptionData.daysRemaining} days left)
                </Caption>
              )}
            </Body>
          </View>
          <TouchableOpacity className="px-4 py-2 rounded-lg" style={{ backgroundColor: primaryColor }}>
            <Body className="text-white font-outfit-semibold text-sm">View Plans</Body>
          </TouchableOpacity>
        </Card>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {/* Total Workers */}
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="people-outline" size={24} color={primaryColor} />
              <Badge variant={stats.changes.workers >= 0 ? 'success' : 'error'} className="text-[10px]">
                {stats.changes.workers > 0 ? '+' : ''}{stats.changes.workers}%
              </Badge>
            </View>
            <H3 className="text-2xl">{statsLoading ? '-' : stats.totalWorkers}</H3>
            <Caption color="secondary">Total Workers</Caption>
          </Card>

          {/* Total Clients */}
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="people-outline" size={24} color="#F59E0B" />
              <Badge variant={stats.changes.clients >= 0 ? 'success' : 'error'} className="text-[10px]">
                {stats.changes.clients > 0 ? '+' : ''}{stats.changes.clients}%
              </Badge>
            </View>
            <H3 className="text-2xl">{statsLoading ? '-' : stats.totalClients}</H3>
            <Caption color="secondary">Total Clients</Caption>
          </Card>

          {/* Total Revenue */}
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="cash-outline" size={24} color="#10B981" />
              <Badge variant={stats.changes.revenue >= 0 ? 'success' : 'error'} className="text-[10px]">
                {stats.changes.revenue > 0 ? '+' : ''}{stats.changes.revenue}%
              </Badge>
            </View>
            <H3 className="text-2xl">{statsLoading ? '-' : formatCurrency(stats.totalRevenue)}</H3>
            <Caption color="secondary">Total Revenue</Caption>
          </Card>

          {/* Shifts Today */}
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="calendar-outline" size={24} color="#F97316" />
              <Badge variant={stats.changes.shifts >= 0 ? 'success' : 'error'} className="text-[10px]">
                {stats.changes.shifts > 0 ? '+' : ''}{stats.changes.shifts}%
              </Badge>
            </View>
            <H3 className="text-2xl">{statsLoading ? '-' : stats.shiftsToday}</H3>
            <Caption color="secondary">Shifts Today</Caption>
          </Card>
        </View>

        {/* Quick Actions */}
        <H3 className="mb-3">Quick Actions</H3>
        <View className="gap-3 mb-6">
          <TouchableOpacity 
            className="flex-row items-center p-4 bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl"
            onPress={() => setShowInviteModal(true)}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: primaryColor }}>
              <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Body className="font-outfit-semibold">Invite New Worker</Body>
              <Caption color="secondary">Invite worker to your organization</Caption>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center p-4 bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl"
            onPress={() => navigation.navigate('HR' as never)}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#16A34A' }}>
              <Ionicons name="people-outline" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Body className="font-outfit-semibold">Manage Staff</Body>
              <Caption color="secondary">View and manage all staff</Caption>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center p-4 bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl"
            onPress={() => navigation.navigate('Shifts' as never)}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#3B82F6' }}>
              <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Body className="font-outfit-semibold">Shift Management</Body>
              <Caption color="secondary">View and manage shifts</Caption>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Pending Approvals */}
        <H3 className="mb-3">Pending Approvals</H3>
        <Card className="p-4 mb-6">
          {pendingLoading ? (
            <View className="flex-row items-center justify-center py-4">
              <ActivityIndicator size="small" color={primaryColor} />
              <Body className="ml-2">Loading...</Body>
            </View>
          ) : pendingData && (pendingData.counts?.workers > 0 || pendingData.counts?.timesheets > 0 || pendingData.counts?.clients > 0) ? (
            <View className="gap-3">
              {pendingData.counts?.workers > 0 && (
                <TouchableOpacity 
                  className="flex-row items-center p-3 bg-light-background-secondary dark:bg-dark-background-secondary rounded-lg"
                  onPress={() => navigation.navigate('Workers' as never)}
                >
                  <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#FEF3C7' }}>
                    <Ionicons name="person-outline" size={20} color="#D97706" />
                  </View>
                  <View className="flex-1">
                    <Body className="font-outfit-semibold">Worker Approvals</Body>
                    <Caption color="secondary">{pendingData.counts.workers} pending</Caption>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
              {pendingData.counts?.timesheets > 0 && (
                <TouchableOpacity 
                  className="flex-row items-center p-3 bg-light-background-secondary dark:bg-dark-background-secondary rounded-lg"
                  onPress={() => navigation.navigate('AdminTimesheet' as never)}
                >
                  <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#DBEAFE' }}>
                    <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Body className="font-outfit-semibold">Timesheet Approvals</Body>
                    <Caption color="secondary">{pendingData.counts.timesheets} pending</Caption>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
              {pendingData.counts?.clients > 0 && (
                <TouchableOpacity 
                  className="flex-row items-center p-3 bg-light-background-secondary dark:bg-dark-background-secondary rounded-lg"
                  onPress={() => navigation.navigate('AdminHoliday' as never)}
                >
                  <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#D1FAE5' }}>
                    <Ionicons name="business-outline" size={20} color="#16A34A" />
                  </View>
                  <View className="flex-1">
                    <Body className="font-outfit-semibold">Client Approvals</Body>
                    <Caption color="secondary">{pendingData.counts.clients} pending</Caption>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View className="flex-col items-center justify-center py-6">
              <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
              <Body className="mt-2" color="secondary">All caught up!</Body>
              <Caption color="secondary">No pending approvals</Caption>
            </View>
          )}
        </Card>

        {/* Recent Activity */}
        <H3 className="mb-3">Recent Activity</H3>
        <Card className="p-4 mb-6">
          {activityLoading ? (
            <View className="flex-col items-center justify-center py-6">
              <ActivityIndicator size="small" color={primaryColor} />
            </View>
          ) : activityData?.activities && activityData.activities.length > 0 ? (
              activityData.activities.slice(0, 5).map((activity, index) => (
                <View key={activity.id} className={`flex-row items-start ${index < activityData.activities.slice(0, 5).length - 1 ? 'mb-4' : ''}`}>
                  <View
                    className="w-2 h-2 rounded-full mr-3 mt-2"
                    style={{ backgroundColor: index === 0 ? primaryColor : '#9CA3AF' }}
                  />
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      {activity.worker.avatar && (
                        <Image 
                          source={{ uri: activity.worker.avatar.startsWith('http') ? activity.worker.avatar : `${API_BASE_ROOT}${activity.worker.avatar}` }} 
                          className="w-6 h-6 rounded-full mr-2"
                        />
                      )}
                      <Body className="font-outfit-semibold">{activity.shiftTitle}</Body>
                    </View>
                    <Caption color="secondary">{activity.worker.name} • {activity.location}</Caption>
                    <Caption color="secondary">{formatShiftTime(activity.clockIn, activity.clockOut)}</Caption>
                    <View className="flex-row items-center mt-1">
                      <Badge 
                        variant={activity.status === 'Completed' ? 'success' : activity.status === 'In Progress' ? 'warning' : 'default'} 
                        className="text-[10px] mr-2"
                      >
                        {activity.status}
                      </Badge>
                      <Caption color="secondary" className="text-xs">{formatRelativeTime(activity.clockOut)}</Caption>
                    </View>
                  </View>
                </View>
              ))
            ) : (
            <View className="flex-col items-center justify-center py-6">
              <Ionicons name="information-circle-outline" size={48} color="#9CA3AF" />
              <Body className="mt-2" color="secondary">No recent activity</Body>
            </View>
          )}
        </Card>

        <View className="h-24" />
      </ScrollView>

      {/* Invite Worker Modal */}
      <InviteWorkerModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteWorker}
      />
    </View>
  );
}

export default AdminDashboardScreen;
