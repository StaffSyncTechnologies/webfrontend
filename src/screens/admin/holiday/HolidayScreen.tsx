import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOrgTheme, useTheme, useToast } from '../../../contexts';
import { H2, H3, Body, Caption, Card, Badge, PaginatedCardList, FilterOption } from '../../../components/ui';
import { useAppSelector } from '../../../store/hooks';
import { useGetAdminRequestsQuery, useReviewLeaveRequestMutation, Holiday, AdminLeaveRequestsResponse } from '../../../store/slices/adminSlices/holidaySlice';

// ─── Types ─────────────────────────────────────────────────────────────────

type TabKey = 'history' | 'pending' | 'balances';

type HolidayRequest = Holiday;

// ─── Helpers ───────────────────────────────────────────────────────────────

const STATUS_FILTERS: FilterOption[] = [
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Pending',  value: 'PENDING'  },
  { label: 'Denied',   value: 'DENIED'   },
];

const LEAVE_TYPE_FILTERS: FilterOption[] = [
  { label: 'Annual',        value: 'ANNUAL'        },
  { label: 'Sick',          value: 'SICK'          },
  { label: 'Unpaid',        value: 'UNPAID'        },
  { label: 'Compassionate', value: 'COMPASSIONATE' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

const getStatusVariant = (s: string) => {
  if (s === 'APPROVED') return 'success';
  if (s === 'PENDING')  return 'warning';
  if (s === 'DENIED')   return 'error';
  return 'default';
};

const getLeaveTypeLabel = (t: string) => {
  const map: Record<string, string> = {
    ANNUAL: 'Annual', SICK: 'Sick', UNPAID: 'Unpaid',
    COMPASSIONATE: 'Compassionate', MATERNITY: 'Maternity', PATERNITY: 'Paternity',
  };
  return map[t] ?? t;
};

const getLeaveTypeStyle = (t: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    ANNUAL:        { bg: '#DBEAFE', color: '#2563EB' },
    SICK:          { bg: '#FFE4E6', color: '#EF4444' },
    UNPAID:        { bg: '#F3F4F6', color: '#6B7280' },
    COMPASSIONATE: { bg: '#EDE9FE', color: '#7C3AED' },
    MATERNITY:     { bg: '#FCE7F3', color: '#DB2777' },
    PATERNITY:     { bg: '#ECFDF5', color: '#059669' },
  };
  return map[t] ?? { bg: '#F3F4F6', color: '#6B7280' };
};

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const getTrendIcon  = (trend: string) => trend === 'up' ? 'arrow-up-outline' : 'arrow-down-outline';
const getTrendColor = (trend: string) => trend === 'up' ? '#10B981' : '#EF4444';

// ─── Screen ────────────────────────────────────────────────────────────────

const formatDate = (iso: string) => {
  try { return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
};

export function HolidayScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const navigation = useNavigation();
  const adminRole = useAppSelector((state) => state?.auth.admin?.role);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabKey>('history');

  const { data: requestsData, isLoading: requestsLoading, isError: requestsError, refetch: refetchRequests } =
    useGetAdminRequestsQuery({ page: 1, limit: 100 }, { refetchOnMountOrArgChange: true });

  const [reviewLeaveRequest] = useReviewLeaveRequestMutation();

  const adminData: AdminLeaveRequestsResponse | undefined = requestsData;
  const requests: HolidayRequest[] = adminData?.requests ?? [];
  const apiStats = adminData?.stats;

  console.log('Holiday Requests:', requests);
  console.log('API Stats:', apiStats);

  const pendingRequests = requests.filter(r => r.status === 'PENDING');

  const stats = {
    totalRequests: { value: apiStats ? apiStats.pending + apiStats.approved + apiStats.denied : requests.length, change: 0, trend: 'up' as const },
    approved:      { value: apiStats?.approved ?? requests.filter(r => r.status === 'APPROVED').length, change: 0, trend: 'up' as const },
    denied:        { value: apiStats?.denied ?? requests.filter(r => r.status === 'DENIED').length, change: 0, trend: 'down' as const },
    pending:       { value: apiStats?.pending ?? pendingRequests.length, change: 0, trend: 'up' as const },
  };

  const handleApprove = async (requestId: string) => {
    try {
      await reviewLeaveRequest({ id: requestId, status: 'APPROVED' }).unwrap();
      showToast('Holiday request approved', 'success');
      refetchRequests();
    } catch (e: any) {
      showToast(e?.data?.message ?? 'Failed to approve request', 'error');
    }
  };

  const handleDeny = async (requestId: string) => {
    try {
      await reviewLeaveRequest({ id: requestId, status: 'DENIED' }).unwrap();
      showToast('Holiday request denied', 'success');
      refetchRequests();
    } catch (e: any) {
      showToast(e?.data?.message ?? 'Failed to deny request', 'error');
    }
  };

  // ── Request card renderer ──────────────────────────────────────────────
  const renderRequest = (request: HolidayRequest) => {
    const leaveType = request.leaveType;
    const leaveStyle = getLeaveTypeStyle(leaveType);
    const isPending  = request.status === 'PENDING';
    const workerName = request.worker?.fullName || 'Unknown Worker';
    const workerEmail = request.worker?.email || '';

    return (
      <Card className="p-4">
        {/* Top row */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center gap-3 flex-1 pr-3">
            <View
              className="w-10 h-10 rounded-full items-center justify-center shrink-0"
              style={{ backgroundColor: leaveStyle.bg }}
            >
              <Body className="text-xs font-outfit-bold" style={{ color: leaveStyle.color }}>
                {getInitials(workerName)}
              </Body>
            </View>
            <View className="flex-1">
              <Body className="font-outfit-semibold text-sm" numberOfLines={1}>
                {workerName}
              </Body>
              <View
                className="px-2 py-0.5 rounded-full self-start mt-0.5"
                style={{ backgroundColor: leaveStyle.bg }}
              >
                <Caption className="text-[10px] font-outfit-medium" style={{ color: leaveStyle.color }}>
                  {getLeaveTypeLabel(leaveType)}
                </Caption>
              </View>
            </View>
          </View>
          <Badge variant={getStatusVariant(request.status) as any} className="text-[10px] shrink-0">
            {request.status}
          </Badge>
        </View>

        {/* Date & duration strip */}
        <View
          className="flex-row items-center gap-3 px-3 py-2.5 rounded-xl mb-3"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}
        >
          <View className="flex-row items-center gap-1.5 flex-1">
            <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
            <Caption color="secondary" className="text-xs">{formatDate(request.startDate)}</Caption>
          </View>
          <Ionicons name="arrow-forward" size={12} color="#9CA3AF" />
          <View className="flex-row items-center gap-1.5 flex-1">
            <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
            <Caption color="secondary" className="text-xs">{formatDate(request.endDate)}</Caption>
          </View>
          <View
            className="px-2.5 py-1 rounded-full"
            style={{ backgroundColor: leaveStyle.bg }}
          >
            <Caption className="text-[10px] font-outfit-bold" style={{ color: leaveStyle.color }}>
              {request.days}d
            </Caption>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row gap-2 pt-3 border-t border-light-border-light dark:border-dark-border-light">
          <TouchableOpacity className="flex-row items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-light-background-secondary dark:bg-dark-background-secondary">
            <Ionicons name="eye-outline" size={14} color={isDark ? '#FFF' : '#374151'} />
            <Body className="text-xs">View</Body>
          </TouchableOpacity>

          {isPending && (
            <>
              <TouchableOpacity
                onPress={() => handleApprove(request.id)}
                className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl"
                style={{ backgroundColor: primaryColor }}
              >
                <Ionicons name="checkmark-outline" size={14} color="#FFF" />
                <Body className="text-xs text-white font-outfit-medium">Approve</Body>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeny(request.id)}
                className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl"
                style={{ backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : '#FFE4E6' }}
              >
                <Ionicons name="close-outline" size={14} color="#EF4444" />
                <Body className="text-xs font-outfit-medium" style={{ color: '#EF4444' }}>Deny</Body>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Card>
    );
  };

  // ── Tabs config ────────────────────────────────────────────────────────
  const tabs: { key: TabKey; label: string; badge?: number }[] = [
    { key: 'history',  label: 'All Requests'                     },
    { key: 'pending',  label: 'Pending', badge: pendingRequests.length },
    { key: 'balances', label: 'Balances'                          },
  ];

  return (
    <View
      className="flex-1 bg-light-background-primary dark:bg-dark-background-primary"
      style={{ paddingTop: insets.top }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <View className="px-5 pt-2 pb-4">
        <View className="flex-row items-center">
          {adminRole !== 'COMPLIANCE_OFFICER' && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-light-background-secondary dark:bg-dark-background-secondary"
            >
              <Ionicons name="chevron-back" size={20} color={isDark ? '#FFF' : '#374151'} />
            </TouchableOpacity>
          )}
          <View>
            <H2>Holiday</H2>
            <Caption color="secondary">Review requests, track approvals and manage balances</Caption>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* ── Stat Cards ─────────────────────────────────────────── */}
        <View className="px-5 mb-6">
          {/* Hero — total requests */}
          <Card className="p-5 mb-3" style={{ backgroundColor: primaryColor }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Caption className="text-white/70 text-xs mb-1">Total Requests This Year</Caption>
                <View className="flex-row items-end gap-2">
                  <H2 className="text-white text-4xl font-outfit-bold">{stats.totalRequests.value}</H2>
                  <View className="flex-row items-center gap-1 mb-1">
                    <Ionicons name={getTrendIcon(stats.totalRequests.trend)} size={13} color="rgba(255,255,255,0.85)" />
                    <Caption className="text-white/85 text-xs">
                      {Math.abs(stats.totalRequests.change)}% this month
                    </Caption>
                  </View>
                </View>
                {/* Approved vs pending progress */}
                <View className="mt-3">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Caption className="text-white/70 text-[10px]">
                      {stats.approved.value} approved · {stats.pending.value} pending
                    </Caption>
                    <Caption className="text-white/70 text-[10px]">
                      {Math.round((stats.approved.value / stats.totalRequests.value) * 100)}%
                    </Caption>
                  </View>
                  <View className="h-1.5 rounded-full bg-white/20">
                    <View
                      className="h-1.5 rounded-full bg-white"
                      style={{ width: `${Math.round((stats.approved.value / stats.totalRequests.value) * 100)}%` }}
                    />
                  </View>
                </View>
              </View>
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center ml-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
              >
                <Ionicons name="sunny" size={26} color="#FFF" />
              </View>
            </View>
          </Card>

          {/* Three small cards */}
          <View className="flex-row gap-3">
            {[
              { icon: 'checkmark-circle', bg: '#D1FAE5', color: '#10B981', stat: stats.approved, label: 'Approved'  },
              { icon: 'time-outline',     bg: '#FEF3C7', color: '#F59E0B', stat: stats.pending,  label: 'Pending'   },
              { icon: 'close-circle',     bg: '#FFE4E6', color: '#EF4444', stat: stats.denied,   label: 'Denied'    },
            ].map((s, i) => (
              <Card key={i} className="flex-1 p-4">
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center mb-3"
                  style={{ backgroundColor: s.bg }}
                >
                  <Ionicons name={s.icon as any} size={18} color={s.color} />
                </View>
                <H3 className="text-xl font-outfit-bold mb-0.5">{s.stat.value}</H3>
                <Caption color="secondary" className="text-xs">{s.label}</Caption>
                <View className="flex-row items-center gap-1 mt-2">
                  <Ionicons name={getTrendIcon(s.stat.trend)} size={11} color={getTrendColor(s.stat.trend)} />
                  <Caption className="text-[10px]" style={{ color: getTrendColor(s.stat.trend) }}>
                    {Math.abs(s.stat.change)}%
                  </Caption>
                </View>
              </Card>
            ))}
          </View>
        </View>

        {/* ── Tab bar ─────────────────────────────────────────────── */}
        <View className="px-5 mb-4">
          <View className="flex-row border-b border-light-border-light dark:border-dark-border-light">
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className="flex-1 py-3 items-center relative"
                style={{
                  borderBottomWidth: activeTab === tab.key ? 2 : 0,
                  borderBottomColor: primaryColor,
                }}
              >
                <View className="flex-row items-center gap-1.5">
                  <Body
                    className="font-outfit-semibold text-xs"
                    style={{ color: activeTab === tab.key ? primaryColor : (isDark ? '#9CA3AF' : '#6B7280') }}
                  >
                    {tab.label}
                  </Body>
                  {!!tab.badge && tab.badge > 0 && (
                    <View
                      className="w-4 h-4 rounded-full items-center justify-center"
                      style={{ backgroundColor: '#EF4444' }}
                    >
                      <Caption className="text-[9px] text-white font-outfit-bold">{tab.badge}</Caption>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Tab: All Requests ───────────────────────────────────── */}
        {activeTab === 'history' && (
          requestsLoading ? (
            <View className="items-center justify-center py-16 px-5 gap-3">
              <ActivityIndicator size="large" color={primaryColor} />
              <Caption color="secondary" className="text-xs">Loading requests…</Caption>
            </View>
          ) : requestsError ? (
            <View className="items-center justify-center py-16 px-5 gap-3">
              <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
              <Body className="font-outfit-semibold text-sm">Failed to load requests</Body>
              <TouchableOpacity
                onPress={() => refetchRequests()}
                className="px-5 py-3 rounded-xl flex-row items-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                <Ionicons name="refresh-outline" size={16} color="#FFF" />
                <Body className="text-white font-outfit-semibold text-sm">Retry</Body>
              </TouchableOpacity>
            </View>
          ) : (
          <PaginatedCardList<HolidayRequest>
            data={requests}
            defaultPageSize={4}
            pageSizeOptions={[4, 8, 15]}
            renderItem={renderRequest}
            searchKeys={['workerName', 'leaveType', 'status']}
            searchPlaceholder="Search by worker or leave type…"
            filterOptions={STATUS_FILTERS}
            filterKey="status"
            sectionLabel="Leave Requests"
            emptyTitle="No requests found"
            emptySubtitle="Try adjusting your search or filter"
            className="px-5 mb-6"
          />
          )
        )}

        {/* ── Tab: Pending ────────────────────────────────────────── */}
        {activeTab === 'pending' && (
          pendingRequests.length === 0 ? (
            <View className="items-center justify-center py-16 px-5 gap-3">
              <View
                className="w-16 h-16 rounded-2xl items-center justify-center"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6' }}
              >
                <Ionicons name="checkmark-done-outline" size={30} color="#10B981" />
              </View>
              <Body className="font-outfit-semibold text-sm">All caught up!</Body>
              <Caption color="secondary" className="text-xs text-center">
                No pending requests to review right now.
              </Caption>
            </View>
          ) : (
            <PaginatedCardList<HolidayRequest>
              data={pendingRequests}
              defaultPageSize={4}
              pageSizeOptions={[4, 8]}
              renderItem={renderRequest}
              searchKeys={['workerName', 'leaveType']}
              searchPlaceholder="Search pending requests…"
              filterOptions={LEAVE_TYPE_FILTERS}
              filterKey="leaveType"
              sectionLabel="Pending"
              emptyTitle="No matches"
              emptySubtitle="Try a different search or leave type filter"
              className="px-5 mb-6"
            />
          )
        )}

        {/* ── Tab: Balances ───────────────────────────────────────── */}
        {activeTab === 'balances' && (
          <View className="items-center justify-center py-16 px-5 gap-3">
            <Ionicons name="information-circle-outline" size={32} color="#9CA3AF" />
            <Body className="font-outfit-semibold text-sm">Balances Coming Soon</Body>
            <Caption color="secondary" className="text-xs text-center">
              Worker holiday balances will be available in a future update.
            </Caption>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}

export default HolidayScreen;