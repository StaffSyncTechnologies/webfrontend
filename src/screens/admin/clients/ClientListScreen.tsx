import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useOrgTheme } from '../../../contexts';
import { H2, Body, Caption, Card } from '../../../components/ui';
import { PaginatedCardList } from '../../../components/ui/PaginatedCardList';
import { useGetClientListQuery } from '../../../store/api/clientApi';
import { AddClientModal } from './AddClientModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientListItem {
  id: string;
  name: string;
  contactEmail: string | null;
  contactPhone: string | null;
  city: string | null;
  industry: string | null;
  status: string;
  totalShifts: number;
  totalInvoices: number;
  activeShifts: {
    filled: number;
    needed: number;
    percentage: number;
  };
  billingStatus: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'CL';

const AVATAR_PALETTES = [
  { bg: '#DBEAFE', text: '#1D4ED8' },
  { bg: '#D1FAE5', text: '#065F46' },
  { bg: '#EDE9FE', text: '#5B21B6' },
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#FCE7F3', text: '#9D174D' },
  { bg: '#E0F2FE', text: '#0369A1' },
];

const getAvatarPalette = (name: string) =>
  AVATAR_PALETTES[name.charCodeAt(0) % AVATAR_PALETTES.length];

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  ACTIVE:   { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: 'Active' },
  INACTIVE: { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF', label: 'Inactive' },
  PENDING:  { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'Pending' },
};

const BILLING_CONFIG: Record<string, { color: string; label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  PAID:    { color: '#10B981', label: 'Paid',    icon: 'checkmark-circle-outline' },
  OVERDUE: { color: '#EF4444', label: 'Overdue', icon: 'alert-circle-outline' },
  DRAFT:   { color: '#F59E0B', label: 'Draft',   icon: 'document-outline' },
  SENT:    { color: '#3B82F6', label: 'Sent',    icon: 'send-outline' },
};

const FILTER_OPTIONS = [
  { label: 'Active',   value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Pending',  value: 'PENDING' },
];

// ─── Fill Bar ─────────────────────────────────────────────────────────────────

const FillBar: React.FC<{ filled: number; needed: number; percentage: number }> = ({
  filled, needed, percentage,
}) => {
  const color = percentage >= 80 ? '#10B981' : percentage >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <View className="gap-1 mt-2">
      <View className="flex-row justify-between">
        <Caption color="secondary" className="text-xs">Shift fill rate</Caption>
        <Caption className="text-xs font-outfit-semibold" style={{ color }}>
          {filled}/{needed} ({percentage}%)
        </Caption>
      </View>
      <View
        className="h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: '#F3F4F6' }}
      >
        <View style={{ width: `${percentage}%`, height: 4, backgroundColor: color, borderRadius: 4 }} />
      </View>
    </View>
  );
};

// ─── Client Card ──────────────────────────────────────────────────────────────

interface ClientCardProps {
  item: ClientListItem;
  onPress: () => void;
  isDark: boolean;
}

const ClientCard: React.FC<ClientCardProps> = ({ item, onPress, isDark }) => {
  const palette    = getAvatarPalette(item.name);
  const statusCfg  = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.INACTIVE;
  const billingCfg = BILLING_CONFIG[item.billingStatus] ?? null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.72}>
      <Card className="overflow-hidden p-0">

        {/* Status accent bar */}
        <View style={{ height: 3, backgroundColor: statusCfg.dot }} />

        <View className="p-4">

          {/* Row 1 — Avatar + name + status badge */}
          <View className="flex-row items-center mb-3">
            <View
              className="w-11 h-11 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: palette.bg }}
            >
              <Body className="text-base font-outfit-bold" style={{ color: palette.text }}>
                {getInitials(item.name)}
              </Body>
            </View>

            <View className="flex-1 gap-0.5">
              <Body
                className="text-base font-outfit-semibold"
                style={{ color: isDark ? '#F9FAFB' : '#111827' }}
              >
                {item.name}
              </Body>
              {item.industry ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="business-outline" size={11} color="#9CA3AF" />
                  <Caption color="secondary" className="text-xs">{item.industry}</Caption>
                </View>
              ) : null}
            </View>

            {/* Status pill */}
            <View
              className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ backgroundColor: statusCfg.bg }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusCfg.dot }} />
              <Caption className="text-xs font-outfit-semibold" style={{ color: statusCfg.text }}>
                {statusCfg.label}
              </Caption>
            </View>
          </View>

          {/* Row 2 — Contact info */}
          <View
            className="flex-row flex-wrap gap-x-4 gap-y-1 pb-3 mb-3"
            style={{ borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#F3F4F6' }}
          >
            {item.contactEmail ? (
              <View className="flex-row items-center gap-1">
                <Ionicons name="mail-outline" size={12} color="#9CA3AF" />
                <Caption
                  color="secondary"
                  className="text-xs"
                  numberOfLines={1}
                  style={{ maxWidth: 160 }}
                >
                  {item.contactEmail}
                </Caption>
              </View>
            ) : null}
            {item.city ? (
              <View className="flex-row items-center gap-1">
                <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                <Caption color="secondary" className="text-xs">{item.city}</Caption>
              </View>
            ) : null}
            {item.contactPhone ? (
              <View className="flex-row items-center gap-1">
                <Ionicons name="call-outline" size={12} color="#9CA3AF" />
                <Caption color="secondary" className="text-xs">{item.contactPhone}</Caption>
              </View>
            ) : null}
          </View>

          {/* Row 3 — Stat pills */}
          <View className="flex-row flex-wrap gap-2 mb-1">
            <View
              className="flex-row items-center gap-1 px-2.5 py-1 rounded-full"
              style={{ backgroundColor: '#EFF6FF' }}
            >
              <Ionicons name="briefcase-outline" size={11} color="#3B82F6" />
              <Caption className="text-xs font-outfit-semibold" style={{ color: '#3B82F6' }}>
                {item.totalShifts} Shifts
              </Caption>
            </View>

            <View
              className="flex-row items-center gap-1 px-2.5 py-1 rounded-full"
              style={{ backgroundColor: '#ECFDF5' }}
            >
              <Ionicons name="receipt-outline" size={11} color="#10B981" />
              <Caption className="text-xs font-outfit-semibold" style={{ color: '#10B981' }}>
                {item.totalInvoices} Invoices
              </Caption>
            </View>

            {billingCfg ? (
              <View
                className="flex-row items-center gap-1 px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${billingCfg.color}18` }}
              >
                <Ionicons name={billingCfg.icon} size={11} color={billingCfg.color} />
                <Caption className="text-xs font-outfit-semibold" style={{ color: billingCfg.color }}>
                  {billingCfg.label}
                </Caption>
              </View>
            ) : null}
          </View>

          {/* Row 4 — Fill bar (only when active shifts exist) */}
          {item.activeShifts?.needed > 0 && (
            <FillBar
              filled={item.activeShifts.filled}
              needed={item.activeShifts.needed}
              percentage={item.activeShifts.percentage}
            />
          )}
        </View>

        {/* Card footer */}
        <View
          className="flex-row items-center justify-end px-4 py-2.5"
          style={{ borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#F9FAFB' }}
        >
          <Caption color="secondary" className="text-xs mr-1">View details</Caption>
          <Ionicons name="chevron-forward" size={13} color="#9CA3AF" />
        </View>

      </Card>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface ClientListScreenProps {
  navigation: any;
}

export const ClientListScreen: React.FC<ClientListScreenProps> = ({ navigation }) => {
  const { top }    = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { primaryColor } = useOrgTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: response, isLoading, refetch } = useGetClientListQuery({});
  const clients: ClientListItem[] = response?.data?.clients ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: isDark ? '#111827' : '#F3F4F6' }}>

      {/* Safe-area top */}
      <View style={{ height: top, backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }} />

      {/* ── Header ── */}
      <View
        className="flex-row items-center justify-between px-4 py-3.5"
        style={{
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#374151' : '#E5E7EB',
        }}
      >
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color={isDark ? '#F9FAFB' : '#111827'} />
          </TouchableOpacity>
          <H2 style={{ color: isDark ? '#F9FAFB' : '#111827' }}>Clients</H2>
        </View>

        <View className="flex-row items-center gap-2">
          {/* Total count badge — hidden while loading */}
          {!isLoading && clients.length > 0 && (
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: isDark ? '#374151' : '#EFF6FF' }}
            >
              <Caption
                className="text-xs font-outfit-semibold"
                style={{ color: isDark ? '#93C5FD' : '#1D4ED8' }}
              >
                {clients.length} total
              </Caption>
            </View>
          )}
          {/* Add Client button */}
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            className="flex-row items-center gap-1 px-3 py-2 rounded-lg"
            style={{ backgroundColor: primaryColor }}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Body className="font-outfit-semibold" style={{ color: '#fff', fontSize: 13 }}>Add Client</Body>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── PaginatedCardList ── */}
     <ScrollView
  className="flex-1"
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: 24 }}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={primaryColor}
      colors={[primaryColor]}
    />
  }
>
  <PaginatedCardList<ClientListItem>
    data={clients}
    defaultPageSize={5}
    pageSizeOptions={[3, 5, 10]}
    searchKeys={['name', 'city', 'industry', 'contactEmail']}
    searchPlaceholder="Search by name, city or industry…"
    filterOptions={FILTER_OPTIONS}
    filterKey="status"
    sectionLabel="Clients"
    emptyTitle="No clients found"
    emptySubtitle="Try adjusting your search or filters."
    className="px-4 pt-4 pb-6"
    renderItem={(item) => (
      <ClientCard
        item={item}
        isDark={isDark}
        onPress={() =>
          navigation.navigate('ClientDetails', { clientId: item.id })
        }
      />
    )}
  />
</ScrollView>

      {/* ── Add Client Modal ── */}
      <AddClientModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

    </View>
  );
};

export default ClientListScreen;