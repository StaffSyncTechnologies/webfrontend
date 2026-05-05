import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOrgTheme, useTheme } from '../../../contexts';
import { H2, Body, Caption, Card, Badge, PaginatedCardList, FilterOption } from '../../../components/ui';
import RTWVerificationModal from './RTWVerificationModal';
import ViewDocumentsModal from './ViewDocumentsModal';
import { useGetComplianceStatsQuery, useListComplianceWorkersQuery, ComplianceWorker } from '../../../store/slices/adminSlices/complianceSlice';
import { useAppSelector } from '../../../store/hooks';

// ─── Types ─────────────────────────────────────────────────────────────────

type Worker = ComplianceWorker;

const STATUS_FILTERS: FilterOption[] = [
  { label: 'Approved',       value: 'APPROVED'        },
  { label: 'Pending',        value: 'PENDING'         },
  { label: 'Expired',        value: 'EXPIRED'         },
  { label: 'Needs Review',   value: 'REQUIRES_REVIEW' },
  { label: 'Not Started',    value: 'NOT_STARTED'     },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

const getStatusVariant = (status: string) => {
  const map: Record<string, string> = {
    APPROVED: 'success', PENDING: 'warning',
    REJECTED: 'error',   EXPIRED: 'error',
    REQUIRES_REVIEW: 'default', NOT_STARTED: 'default',
  };
  return (map[status] ?? 'default') as any;
};

const getStatusIcon = (status: string) => {
  const map: Record<string, string> = {
    APPROVED: 'checkmark-circle', PENDING: 'time-outline',
    REJECTED: 'close-circle',     EXPIRED: 'close-circle',
    REQUIRES_REVIEW: 'warning',   NOT_STARTED: 'ellipse-outline',
  };
  return (map[status] ?? 'help-circle') as any;
};

const getStatusIconColor = (status: string) => {
  const map: Record<string, string> = {
    APPROVED: '#10B981', PENDING: '#F59E0B',
    REJECTED: '#EF4444', EXPIRED: '#EF4444',
    REQUIRES_REVIEW: '#F97316', NOT_STARTED: '#9CA3AF',
  };
  return map[status] ?? '#9CA3AF';
};

const formatStatus = (status: string) =>
  status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

// Avatar background per status
const getAvatarStyle = (status: string) => {
  const map: Record<string, { bg: string; text: string }> = {
    APPROVED:        { bg: '#D1FAE5', text: '#059669' },
    PENDING:         { bg: '#FEF3C7', text: '#D97706' },
    REJECTED:        { bg: '#FFE4E6', text: '#EF4444' },
    EXPIRED:         { bg: '#FFE4E6', text: '#EF4444' },
    REQUIRES_REVIEW: { bg: '#FFEDD5', text: '#F97316' },
    NOT_STARTED:     { bg: '#F3F4F6', text: '#6B7280' },
  };
  return map[status] ?? { bg: '#F3F4F6', text: '#6B7280' };
};

// ─── Info chip ─────────────────────────────────────────────────────────────

function InfoChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { isDark } = useTheme();
  return (
    <View className="flex-1 min-w-[45%]">
      <Caption color="secondary" className="text-[10px] mb-0.5">{label}</Caption>
      <View className="flex-row items-center gap-1">
        <Ionicons name={icon as any} size={11} color="#9CA3AF" />
        <Body className="text-xs" numberOfLines={1}>{value}</Body>
      </View>
    </View>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────

const formatDate = (iso: string | null) => {
  if (!iso) return null;
  try { return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
};

export function RTWScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const navigation = useNavigation();
  const adminRole = useAppSelector((state) => state.auth.admin?.role);

  const [showVerifyModal,    setShowVerifyModal]    = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [selectedWorker,     setSelectedWorker]     = useState<Worker | null>(null);

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } =
    useGetComplianceStatsQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: workersData, isLoading: workersLoading, isError: workersError, refetch: refetchWorkers } =
    useListComplianceWorkersQuery({ page: 1, limit: 100 }, { refetchOnMountOrArgChange: true });

  const workers: Worker[] = workersData?.workers ?? [];

  const stats = {
    approved:        statsData?.approved        ?? workers.filter(w => w.rtwStatus === 'APPROVED').length,
    pending:         statsData?.pending         ?? workers.filter(w => w.rtwStatus === 'PENDING').length,
    rejectedExpired: (statsData ? (statsData.rejected + statsData.expired) : workers.filter(w => ['REJECTED','EXPIRED'].includes(w.rtwStatus)).length),
    expiringSoon:    statsData?.expiringSoon    ?? 0,
  };

  const handleVerifyWorker   = (w: Worker) => { setSelectedWorker(w); setShowVerifyModal(true); };
  const handleViewDocuments  = (w: Worker) => { setSelectedWorker(w); setShowDocumentsModal(true); };
  const handleVerificationDone = () => { refetchWorkers(); refetchStats(); };

  // ── Worker card renderer ──────────────────────────────────────────────
  const renderWorker = (worker: Worker) => {
    const avatarStyle   = getAvatarStyle(worker.rtwStatus);
    const iconColor     = getStatusIconColor(worker.rtwStatus);
    const needsAction   = ['PENDING', 'REQUIRES_REVIEW', 'NOT_STARTED', 'EXPIRED'].includes(worker.rtwStatus);

    return (
      <Card className="p-4">
        {/* ── Header row ── */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center gap-3 flex-1 pr-3">
            {/* Status-tinted avatar */}
            <View className="relative">
              <View
                className="w-11 h-11 rounded-full items-center justify-center"
                style={{ backgroundColor: avatarStyle.bg }}
              >
                <Body className="text-sm font-outfit-bold" style={{ color: avatarStyle.text }}>
                  {getInitials(worker.fullName)}
                </Body>
              </View>
              {/* Status dot */}
              <View
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full items-center justify-center border-2"
                style={{
                  backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF',
                  borderColor:     isDark ? '#1A1A2E' : '#FFFFFF',
                }}
              >
                <Ionicons name={getStatusIcon(worker.rtwStatus)} size={11} color={iconColor} />
              </View>
            </View>

            <View className="flex-1">
              <Body className="font-outfit-semibold text-sm" numberOfLines={1}>
                {worker.fullName}
              </Body>
              <Caption color="secondary" className="text-[10px]" numberOfLines={1}>
                {worker.email}
              </Caption>
            </View>
          </View>
          <Badge variant={getStatusVariant(worker.rtwStatus)} className="text-[10px] shrink-0">
            {formatStatus(worker.rtwStatus)}
          </Badge>
        </View>

        {/* ── Attention banner for actionable statuses ── */}
        {needsAction && (
          <View
            className="flex-row items-center gap-2 px-3 py-2 rounded-xl mb-3"
            style={{
              backgroundColor: worker.rtwStatus === 'EXPIRED'
                ? (isDark ? 'rgba(239,68,68,0.12)'  : '#FEE2E2')
                : worker.rtwStatus === 'REQUIRES_REVIEW'
                ? (isDark ? 'rgba(249,115,22,0.12)' : '#FFF7ED')
                : worker.rtwStatus === 'PENDING'
                ? (isDark ? 'rgba(245,158,11,0.12)' : '#FFFBEB')
                : (isDark ? 'rgba(255,255,255,0.06)' : '#F9FAFB'),
            }}
          >
            <Ionicons
              name={worker.rtwStatus === 'EXPIRED' ? 'alert-circle-outline' : 'information-circle-outline'}
              size={14}
              color={iconColor}
            />
            <Caption className="text-[10px] flex-1" style={{ color: iconColor }}>
              {worker.rtwStatus === 'EXPIRED'         && 'RTW has expired — re-verification required'}
              {worker.rtwStatus === 'REQUIRES_REVIEW' && 'Documents require manual review'}
              {worker.rtwStatus === 'PENDING'         && 'Awaiting RTW check'}
              {worker.rtwStatus === 'NOT_STARTED'     && 'No RTW check initiated yet'}
            </Caption>
          </View>
        )}

        {/* ── Info grid ── */}
        <View
          className="rounded-xl p-3 mb-3"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}
        >
          <View className="flex-row flex-wrap gap-y-2.5">
            <InfoChip
              icon="key-outline"
              label="Share Code"
              value={worker.rtwShareCode ?? '—'}
            />
            <InfoChip
              icon="shield-checkmark-outline"
              label="Checked By"
              value={worker.rtwCheckedBy ?? '—'}
            />
            <InfoChip
              icon="calendar-outline"
              label="Checked"
              value={formatDate(worker.rtwCheckedAt) ?? '—'}
            />
            <InfoChip
              icon="time-outline"
              label="Expires"
              value={formatDate(worker.rtwExpiresAt) ?? '—'}
            />
          </View>
        </View>

        {/* ── Actions ── */}
        <View className="flex-row gap-2 pt-3 border-t border-light-border-light dark:border-dark-border-light">
          <TouchableOpacity
            onPress={() => handleViewDocuments(worker)}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-light-background-secondary dark:bg-dark-background-secondary"
          >
            <Ionicons name="document-text-outline" size={14} color={isDark ? '#FFF' : '#374151'} />
            <Body className="text-xs">Documents</Body>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleVerifyWorker(worker)}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl"
            style={{ backgroundColor: needsAction ? '#EF4444' : primaryColor }}
          >
            <Ionicons
              name={needsAction ? 'shield-outline' : 'shield-checkmark-outline'}
              size={14}
              color="#FFF"
            />
            <Body className="text-xs text-white font-outfit-medium">
              {needsAction ? 'Verify Now' : 'Re-verify'}
            </Body>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <View
      className="flex-1 bg-light-background-primary dark:bg-dark-background-primary"
      style={{ paddingTop: insets.top }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <View className="flex-row items-center flex-1">
          {adminRole !== 'COMPLIANCE_OFFICER' && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-light-background-secondary dark:bg-dark-background-secondary"
            >
              <Ionicons name="chevron-back" size={20} color={isDark ? '#FFF' : '#374151'} />
            </TouchableOpacity>
          )}
          <View>
            <H2>RTW Compliance</H2>
            <Caption color="secondary">Right to work verification</Caption>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => { refetchWorkers(); refetchStats(); }}
          className="w-10 h-10 rounded-full items-center justify-center bg-light-background-secondary dark:bg-dark-background-secondary"
        >
          {(workersLoading || statsLoading)
            ? <ActivityIndicator size="small" color={primaryColor} />
            : <Ionicons name="refresh-outline" size={18} color={isDark ? '#FFF' : '#374151'} />}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* ── Stat Cards ─────────────────────────────────────────── */}
        <View className="px-5 mb-6">
          {/* Hero: approved — full width */}
          <Card
            className="p-5 mb-3"
            style={{ borderLeftWidth: 4, borderLeftColor: '#10B981' }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Caption color="secondary" className="text-xs mb-1">Approved Workers</Caption>
                <View className="flex-row items-end gap-2">
                  <Body className="text-4xl font-outfit-bold">{stats.approved}</Body>
                  <Caption color="secondary" className="text-xs mb-1">
                    of {stats.approved + stats.pending + stats.rejectedExpired} total
                  </Caption>
                </View>
                {/* Compliance bar */}
                <View className="mt-3">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Caption color="secondary" className="text-[10px]">Compliance rate</Caption>
                    <Caption className="text-[10px] font-outfit-semibold" style={{ color: '#10B981' }}>
                      {Math.round((stats.approved / (stats.approved + stats.pending + stats.rejectedExpired)) * 100)}%
                    </Caption>
                  </View>
                  <View
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB' }}
                  >
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round((stats.approved / (stats.approved + stats.pending + stats.rejectedExpired)) * 100)}%`,
                        backgroundColor: '#10B981',
                      }}
                    />
                  </View>
                </View>
              </View>
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center ml-4"
                style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}
              >
                <Ionicons name="shield-checkmark" size={26} color="#10B981" />
              </View>
            </View>
          </Card>

          {/* Three small stat cards */}
          <View className="flex-row gap-3">
            {[
              { icon: 'time-outline',    color: '#F59E0B', bg: '#FEF3C7', count: stats.pending,         label: 'Pending\nReview'   },
              { icon: 'close-circle',    color: '#EF4444', bg: '#FFE4E6', count: stats.rejectedExpired, label: 'Rejected /\nExpired' },
              { icon: 'warning-outline', color: primaryColor, bg: primaryColor + '20', count: stats.expiringSoon, label: 'Expiring\nSoon' },
            ].map((s, i) => (
              <Card key={i} className="flex-1 p-3" style={{ borderLeftWidth: 3, borderLeftColor: s.color }}>
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mb-2"
                  style={{ backgroundColor: s.bg }}
                >
                  <Ionicons name={s.icon as any} size={16} color={s.color} />
                </View>
                <Body className="text-xl font-outfit-bold mb-0.5">{s.count}</Body>
                <Caption color="secondary" className="text-[10px] leading-tight">{s.label}</Caption>
              </Card>
            ))}
          </View>
        </View>

        {/* ── Workers list ────────────────────────────────────────── */}
        {workersLoading ? (
          <View className="items-center justify-center py-16">
            <ActivityIndicator size="large" color={primaryColor} />
            <Caption color="secondary" className="text-xs mt-3">Loading workers…</Caption>
          </View>
        ) : workersError ? (
          <View className="items-center justify-center py-16 px-5 gap-3">
            <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
            <Body className="font-outfit-semibold text-sm">Failed to load workers</Body>
            <TouchableOpacity
              onPress={() => refetchWorkers()}
              className="px-5 py-3 rounded-xl flex-row items-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Ionicons name="refresh-outline" size={16} color="#FFF" />
              <Body className="text-white font-outfit-semibold text-sm">Retry</Body>
            </TouchableOpacity>
          </View>
        ) : null}

        {!workersLoading && !workersError && (
        <PaginatedCardList<Worker>
          data={workers}
          defaultPageSize={4}
          pageSizeOptions={[4, 8, 15]}
          renderItem={renderWorker}
          searchKeys={['fullName', 'email', 'rtwShareCode', 'rtwCheckedBy']}
          searchPlaceholder="Search by name, email or share code…"
          filterOptions={STATUS_FILTERS}
          filterKey="rtwStatus"
          sectionLabel="Workers"
          emptyTitle="No workers found"
          emptySubtitle="Try adjusting your search or filter"
          className="px-5 mb-6"
        />
        )}

        <View className="h-24" />
      </ScrollView>

      <RTWVerificationModal
        visible={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        worker={selectedWorker}
        onSubmit={handleVerificationDone}
      />
      <ViewDocumentsModal
        visible={showDocumentsModal}
        onClose={() => setShowDocumentsModal(false)}
        worker={selectedWorker}
      />
    </View>
  );
}

export default RTWScreen;
