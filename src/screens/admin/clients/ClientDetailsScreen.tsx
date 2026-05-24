import React, { useState } from 'react';
import {
  View, ScrollView, TouchableOpacity, ActivityIndicator,
  Modal, Alert, FlatList, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useToast } from '../../../contexts';
import { H2, H3, Body, Caption, Card } from '../../../components/ui';
import { PaginatedCardList } from '../../../components/ui/PaginatedCardList';
import {
  useGetClientDetailsQuery,
  useGetClientWorkersQuery,
  useBulkAssignWorkersMutation,
  useRemoveWorkerAssignmentMutation,
  useGetClientShiftsQuery,
  useGetClientInvoicesQuery,
  useGetClientTimesheetQuery,
  type ClientWorker,
  type ClientShift,
  type ClientInvoice,
  type WeekData,
} from '../../../store/api/clientApi';
import { useGetWorkersQuery } from '../../../store/slices/adminSlices/workerSlice';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = 'overview' | 'workers' | 'shifts' | 'invoices' | 'timesheet';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'CL';

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '–';

const fmtCurrency = (n: number | null) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(n ?? 0));

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

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE:    { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  INACTIVE:  { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' },
  PENDING:   { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  COMPLETED: { bg: '#DBEAFE', text: '#1D4ED8', dot: '#3B82F6' },
  CANCELLED: { bg: '#FFE4E6', text: '#9F1239', dot: '#EF4444' },
  OPEN:      { bg: '#EDE9FE', text: '#5B21B6', dot: '#8B5CF6' },
  FILLED:    { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
};

const INVOICE_STATUS: Record<string, { bg: string; text: string }> = {
  PAID:    { bg: '#D1FAE5', text: '#065F46' },
  OVERDUE: { bg: '#FFE4E6', text: '#DC2626' },
  SENT:    { bg: '#DBEAFE', text: '#1D4ED8' },
  DRAFT:   { bg: '#FEF3C7', text: '#D97706' },
};

const TABS: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'overview',   label: 'Overview',   icon: 'grid-outline' },
  { key: 'workers',    label: 'Workers',    icon: 'people-outline' },
  { key: 'shifts',     label: 'Shifts',     icon: 'briefcase-outline' },
  { key: 'invoices',   label: 'Invoices',   icon: 'receipt-outline' },
  { key: 'timesheet',  label: 'Timesheet',  icon: 'time-outline' },
];

// ─── Reusable atoms ───────────────────────────────────────────────────────────

const Divider: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <View style={{ height: 1, backgroundColor: isDark ? '#374151' : '#F3F4F6', marginVertical: 12 }} />
);

const InfoRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  isDark: boolean;
}> = ({ icon, label, value, isDark }) => (
  <View className="flex-row items-start gap-3 mb-3">
    <View
      className="w-8 h-8 rounded-full items-center justify-center"
      style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6', marginTop: 1 }}
    >
      <Ionicons name={icon} size={14} color="#9CA3AF" />
    </View>
    <View className="flex-1">
      <Caption color="secondary" className="text-xs mb-0.5">{label}</Caption>
      <Body className="text-sm" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{value || '–'}</Body>
    </View>
  </View>
);

// Compact horizontal stat pill — icon + value + label in one row
const StatPill: React.FC<{
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  isDark: boolean;
}> = ({ label, value, icon, iconColor, iconBg, isDark }) => (
  <View
    className="flex-1 flex-row items-center gap-2.5 px-3 py-2.5 rounded-xl mx-1"
    style={{ backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderWidth: 1, borderColor: isDark ? '#374151' : '#E5E7EB' }}
  >
    <View
      className="w-8 h-8 rounded-full items-center justify-center"
      style={{ backgroundColor: iconBg }}
    >
      <Ionicons name={icon} size={15} color={iconColor} />
    </View>
    <View>
      <Body className="font-outfit-bold text-sm leading-tight" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
        {value}
      </Body>
      <Caption color="secondary" className="text-xs">{label}</Caption>
    </View>
  </View>
);

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status?.toUpperCase()] ?? STATUS_CONFIG.INACTIVE;
  return (
    <View
      className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ backgroundColor: cfg.bg }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: cfg.dot }} />
      <Caption className="text-xs font-outfit-semibold" style={{ color: cfg.text }}>
        {status}
      </Caption>
    </View>
  );
};

const EmptyState: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  isDark: boolean;
}> = ({ icon, title, subtitle, isDark }) => (
  <View className="flex-1 items-center justify-center py-16 gap-3">
    <View
      className="w-16 h-16 rounded-full items-center justify-center"
      style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
    >
      <Ionicons name={icon} size={30} color={isDark ? '#6B7280' : '#9CA3AF'} />
    </View>
    <Body className="font-outfit-semibold" style={{ color: isDark ? '#D1D5DB' : '#374151' }}>
      {title}
    </Body>
    {subtitle && (
      <Caption color="secondary" className="text-center px-8">{subtitle}</Caption>
    )}
  </View>
);

// ─── Tab: Overview ────────────────────────────────────────────────────────────

const OverviewTab: React.FC<{ client: any; isDark: boolean }> = ({ client, isDark }) => (
  <ScrollView
    className="flex-1"
    contentContainerStyle={{ padding: 16, gap: 12 }}
    showsVerticalScrollIndicator={false}
  >
    {/* About */}
    <Card className="p-4">
      <Body className="font-outfit-semibold mb-3" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
        Company details
      </Body>
      <InfoRow icon="business-outline"  label="Industry"        value={client.industry}     isDark={isDark} />
      <InfoRow icon="location-outline"  label="Address"         value={[client.address, client.city, client.postcode].filter(Boolean).join(', ')} isDark={isDark} />
      <InfoRow icon="person-outline"    label="Contact name"    value={client.contactName}  isDark={isDark} />
      <InfoRow icon="mail-outline"      label="Email"           value={client.contactEmail} isDark={isDark} />
      <InfoRow icon="call-outline"      label="Phone"           value={client.contactPhone} isDark={isDark} />
      <InfoRow icon="receipt-outline"   label="Billing email"   value={client.billingEmail} isDark={isDark} />
      {client.registrationNumber && (
        <InfoRow icon="document-text-outline" label="Reg. number" value={client.registrationNumber} isDark={isDark} />
      )}
    </Card>

    {/* Rate card */}
    {(client.defaultPayRate || client.defaultChargeRate) && (
      <Card className="p-4">
        <Body className="font-outfit-semibold mb-3" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
          Rate information
        </Body>
        <View className="flex-row gap-3">
          {client.defaultPayRate && (
            <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }}>
              <Caption color="secondary" className="text-xs mb-1">Pay rate</Caption>
              <Body className="font-outfit-bold text-base" style={{ color: '#10B981' }}>
                {fmtCurrency(client.defaultPayRate)}<Caption color="secondary">/hr</Caption>
              </Body>
            </View>
          )}
          {client.defaultChargeRate && (
            <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }}>
              <Caption color="secondary" className="text-xs mb-1">Charge rate</Caption>
              <Body className="font-outfit-bold text-base" style={{ color: '#3B82F6' }}>
                {fmtCurrency(client.defaultChargeRate)}<Caption color="secondary">/hr</Caption>
              </Body>
            </View>
          )}
        </View>
      </Card>
    )}
  </ScrollView>
);

// ─── Tab: Workers ─────────────────────────────────────────────────────────────

const WorkersTab: React.FC<{
  clientId: string;
  workers: ClientWorker[];
  workersLoading: boolean;
  isDark: boolean;
  onAssignPress: () => void;
  onRemoveWorker: (id: string) => void;
}> = ({
  clientId,
  workers,
  workersLoading,
  isDark,
  onAssignPress,
  onRemoveWorker,
}) => {
  if (workersLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <PaginatedCardList<ClientWorker>
        data={workers}
        defaultPageSize={5}
        pageSizeOptions={[3, 5, 10]}
        searchKeys={['fullName', 'email']}
        searchPlaceholder="Search workers…"
        sectionLabel="Workers"
        emptyTitle="No workers assigned"
        emptySubtitle='Tap "Assign" to add workers to this client.'
        className="px-4 pt-3 pb-4"
        headerSlot={
          <TouchableOpacity
            onPress={onAssignPress}
            className="flex-row items-center justify-center gap-2 py-3 rounded-xl mb-4"
            style={{ backgroundColor: '#3B82F6' }}
          >
            <Ionicons name="person-add-outline" size={17} color="#fff" />

            <Body
              className="font-outfit-semibold text-sm"
              style={{ color: '#fff' }}
            >
              Assign workers
            </Body>
          </TouchableOpacity>
        }
        renderItem={(item) => {
          const palette = getAvatarPalette(item.fullName);

          return (
            <Card className="p-0 overflow-hidden">
              <View className="flex-row items-center p-4">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: palette.bg }}
                >
                  <Body
                    className="font-outfit-bold text-sm"
                    style={{ color: palette.text }}
                  >
                    {getInitials(item.fullName)}
                  </Body>
                </View>

                <View className="flex-1">
                  <Body
                    className="font-outfit-semibold text-sm"
                    style={{ color: isDark ? '#F9FAFB' : '#111827' }}
                  >
                    {item.fullName}
                  </Body>

                  <Caption color="secondary" className="text-xs mt-0.5">
                    {item.email || '–'}
                  </Caption>
                </View>

                <TouchableOpacity
                  onPress={() => onRemoveWorker(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: '#FEE2E2' }}
                >
                  <Ionicons name="trash-outline" size={14} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </Card>
          );
        }}
      />
    </ScrollView>
  );
};
// ─── Tab: Shifts ──────────────────────────────────────────────────────────────

const ShiftsTab: React.FC<{ shifts: ClientShift[]; loading: boolean; isDark: boolean }> = ({
  shifts,
  loading,
  isDark,
}) => {
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <PaginatedCardList<ClientShift>
        data={shifts}
        defaultPageSize={5}
        pageSizeOptions={[3, 5, 10]}
        searchKeys={['title', 'role', 'siteLocation']}
        searchPlaceholder="Search shifts…"
        filterOptions={[
          { label: 'Open', value: 'OPEN' },
          { label: 'Filled', value: 'FILLED' },
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'Cancelled', value: 'CANCELLED' },
        ]}
        filterKey="status"
        sectionLabel="Shifts"
        emptyTitle="No shifts found"
        emptySubtitle="Shifts assigned to this client will appear here."
        className="px-4 pt-3 pb-4"
        renderItem={(item) => {
          const statusCfg =
            STATUS_CONFIG[item.status?.toUpperCase()] ?? STATUS_CONFIG.OPEN;

          return (
            <Card className="p-0 overflow-hidden">
              <View style={{ height: 3, backgroundColor: statusCfg.dot }} />

              <View className="p-4">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1 mr-3">
                    <Body
                      className="font-outfit-semibold text-sm"
                      style={{ color: isDark ? '#F9FAFB' : '#111827' }}
                    >
                      {item.title || 'Shift'}
                    </Body>

                    {item.role && (
                      <Caption color="secondary" className="text-xs mt-0.5">
                        {item.role}
                      </Caption>
                    )}
                  </View>

                  <StatusPill status={item.status} />
                </View>

                <View className="flex-row flex-wrap gap-x-4 gap-y-1 mt-1">
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
                    <Caption color="secondary" className="text-xs">
                      {fmtDate(item.startAt)}
                    </Caption>
                  </View>

                  {item.siteLocation && (
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                      <Caption color="secondary" className="text-xs">
                        {item.siteLocation}
                      </Caption>
                    </View>
                  )}

                  {item.worker && (
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="person-outline" size={12} color="#9CA3AF" />
                      <Caption color="secondary" className="text-xs">
                        {item.worker.fullName}
                      </Caption>
                    </View>
                  )}
                </View>
              </View>
            </Card>
          );
        }}
      />
    </ScrollView>
  );
};

// ─── Tab: Invoices ────────────────────────────────────────────────────────────

const InvoicesTab: React.FC<{
  invoices: ClientInvoice[];
  loading: boolean;
  isDark: boolean;
}> = ({ invoices, loading, isDark }) => {
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <PaginatedCardList<ClientInvoice>
        data={invoices}
        defaultPageSize={5}
        pageSizeOptions={[3, 5, 10]}
        searchKeys={['invoiceNumber']}
        searchPlaceholder="Search invoices…"
        filterOptions={[
          { label: 'Paid', value: 'PAID' },
          { label: 'Sent', value: 'SENT' },
          { label: 'Overdue', value: 'OVERDUE' },
          { label: 'Draft', value: 'DRAFT' },
        ]}
        filterKey="status"
        sectionLabel="Invoices"
        emptyTitle="No invoices found"
        emptySubtitle="Invoices for this client will appear here."
        className="px-4 pt-3 pb-4"
        renderItem={(item) => {
          const cfg = INVOICE_STATUS[item.status] ?? INVOICE_STATUS.DRAFT;

          return (
            <Card className="p-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: '#EFF6FF' }}
                  >
                    <Ionicons name="receipt-outline" size={15} color="#3B82F6" />
                  </View>

                  <Body
                    className="font-outfit-semibold text-sm"
                    style={{ color: isDark ? '#F9FAFB' : '#111827' }}
                  >
                    {item.invoiceNumber}
                  </Body>
                </View>

                <View
                  className="px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: cfg.bg }}
                >
                  <Caption
                    className="text-xs font-outfit-semibold"
                    style={{ color: cfg.text }}
                  >
                    {item.status}
                  </Caption>
                </View>
              </View>

              <View className="flex-row justify-between items-end">
                <View className="gap-1">
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
                    <Caption color="secondary" className="text-xs">
                      Issued {fmtDate(item.createdAt)}
                    </Caption>
                  </View>

                  <View className="flex-row items-center gap-1">
                    <Ionicons name="time-outline" size={11} color="#9CA3AF" />
                    <Caption color="secondary" className="text-xs">
                      Due {fmtDate(item.dueDate)}
                    </Caption>
                  </View>
                </View>

                <Body
                  className="font-outfit-bold text-base"
                  style={{ color: isDark ? '#F9FAFB' : '#111827' }}
                >
                  {fmtCurrency(item.total)}
                </Body>
              </View>
            </Card>
          );
        }}
      />
    </ScrollView>
  );
};

// ─── Tab: Timesheet ───────────────────────────────────────────────────────────

const TimesheetTab: React.FC<{
  weeks: WeekData[];
  loading: boolean;
  isDark: boolean;
}> = ({ weeks, loading, isDark }) => {
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <PaginatedCardList<WeekData>
        data={weeks}
        defaultPageSize={5}
        pageSizeOptions={[3, 5, 10]}
        searchKeys={['weekLabel']}
        searchPlaceholder="Search weeks…"
        filterOptions={[
          { label: 'Invoiced', value: 'INVOICED' },
          { label: 'Uninvoiced', value: 'UNINVOICED' },
        ]}
        filterKey="status"
        sectionLabel="Weeks"
        emptyTitle="No timesheet data"
        emptySubtitle="Completed shifts will appear here once recorded."
        className="px-4 pt-3 pb-4"
        renderItem={(item) => {
          const isInvoiced = item.status === 'INVOICED';

          return (
            <Card className="p-4">
              <View className="flex-row items-center justify-between mb-3">
                <Body
                  className="font-outfit-semibold text-sm"
                  style={{ color: isDark ? '#F9FAFB' : '#111827' }}
                >
                  {item.weekLabel}
                </Body>

                <View
                  className="px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: isInvoiced ? '#D1FAE5' : '#FEF3C7',
                  }}
                >
                  <Caption
                    className="text-xs font-outfit-semibold"
                    style={{
                      color: isInvoiced ? '#065F46' : '#D97706',
                    }}
                  >
                    {item.status}
                  </Caption>
                </View>
              </View>

              <View className="flex-row items-center gap-1 mb-3">
                <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
                <Caption color="secondary" className="text-xs">
                  {fmtDate(item.weekStart)} – {fmtDate(item.weekEnd)}
                </Caption>
              </View>

              <View
                className="flex-row gap-3 mb-3 pb-3"
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? '#374151' : '#F3F4F6',
                }}
              >
                {[
                  {
                    icon: 'time-outline',
                    value: `${item.totalHours}h`,
                    label: 'Hours',
                  },
                  {
                    icon: 'briefcase-outline',
                    value: item.totalShifts,
                    label: 'Shifts',
                  },
                  {
                    icon: 'people-outline',
                    value: item.totalWorkers,
                    label: 'Workers',
                  },
                ].map((s) => (
                  <View
                    key={s.label}
                    className="flex-1 items-center py-2 rounded-xl"
                    style={{
                      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                    }}
                  >
                    <Ionicons name={s.icon as any} size={13} color="#9CA3AF" />

                    <Body
                      className="font-outfit-bold text-sm mt-1"
                      style={{ color: isDark ? '#F9FAFB' : '#111827' }}
                    >
                      {s.value}
                    </Body>

                    <Caption color="secondary" className="text-xs">
                      {s.label}
                    </Caption>
                  </View>
                ))}
              </View>

              <View className="flex-row items-center justify-between">
                <Body
                  className="font-outfit-bold text-base"
                  style={{ color: isDark ? '#F9FAFB' : '#111827' }}
                >
                  {fmtCurrency(item.totalAmount)}
                </Body>

                {!isInvoiced && item.totalShifts > 0 && (
                  <TouchableOpacity
                    className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl"
                    style={{ backgroundColor: '#3B82F6' }}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={13}
                      color="#fff"
                    />

                    <Caption
                      className="font-outfit-semibold"
                      style={{ color: '#fff' }}
                    >
                      Generate invoice
                    </Caption>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          );
        }}
      />
    </ScrollView>
  );
};

// ─── Assign Workers Modal ─────────────────────────────────────────────────────

const AssignWorkersModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  availableWorkers: ClientWorker[];
  assignedWorkers: ClientWorker[];
  onAssign: (ids: string[]) => void;
  isDark: boolean;
}> = ({ visible, onClose, availableWorkers, assignedWorkers, onAssign, isDark }) => {
  const [selected, setSelected]   = useState<string[]>([]);
  const [search, setSearch]       = useState('');

  const unassigned = availableWorkers.filter(
    (w) => !assignedWorkers.some((a) => a.id === w.id)
  );

  const filtered = unassigned.filter((w) =>
    w.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    w.email?.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const handleConfirm = () => {
    onAssign(selected);
    setSelected([]);
    setSearch('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View
          style={{
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '82%',
          }}
        >
          {/* Handle */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full" style={{ backgroundColor: isDark ? '#4B5563' : '#E5E7EB' }} />
          </View>

          {/* Header */}
          <View
            className="flex-row items-center justify-between px-5 py-4"
            style={{ borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#F3F4F6' }}
          >
            <View>
              <H3 style={{ color: isDark ? '#F9FAFB' : '#111827' }}>Assign workers</H3>
              {selected.length > 0 && (
                <Caption className="text-xs mt-0.5" style={{ color: '#3B82F6' }}>
                  {selected.length} selected
                </Caption>
              )}
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View className="px-5 py-3">
            <View
              className="flex-row items-center gap-2 px-3 h-11 rounded-xl"
              style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6', borderWidth: 1, borderColor: isDark ? '#4B5563' : '#E5E7EB' }}
            >
              <Ionicons name="search-outline" size={16} color="#9CA3AF" />
              <TextInput
                style={{ flex: 1, fontSize: 13, color: isDark ? '#F9FAFB' : '#111827' }}
                placeholder="Search workers…"
                placeholderTextColor="#9CA3AF"
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>

          {/* List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            style={{ flexGrow: 0 }}
            ListEmptyComponent={
              <View className="py-12 items-center gap-2">
                <Ionicons name="people-outline" size={32} color="#9CA3AF" />
                <Caption color="secondary">No workers available</Caption>
              </View>
            }
            renderItem={({ item }) => {
              const isSelected = selected.includes(item.id);
              const palette    = getAvatarPalette(item.fullName);
              return (
                <TouchableOpacity
                  onPress={() => toggle(item.id)}
                  className="flex-row items-center px-5 py-3"
                  style={{
                    backgroundColor: isSelected
                      ? (isDark ? '#1E3A5F' : '#EFF6FF')
                      : 'transparent',
                  }}
                >
                  <View
                    className="w-5 h-5 rounded-md items-center justify-center mr-3"
                    style={{
                      backgroundColor: isSelected ? '#3B82F6' : 'transparent',
                      borderWidth: 2,
                      borderColor: isSelected ? '#3B82F6' : (isDark ? '#4B5563' : '#D1D5DB'),
                    }}
                  >
                    {isSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                  <View
                    className="w-9 h-9 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: palette.bg }}
                  >
                    <Body className="text-xs font-outfit-bold" style={{ color: palette.text }}>
                      {getInitials(item.fullName)}
                    </Body>
                  </View>
                  <View className="flex-1">
                    <Body className="text-sm font-outfit-medium" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
                      {item.fullName}
                    </Body>
                    <Caption color="secondary" className="text-xs">{item.email || '–'}</Caption>
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          {/* Footer */}
          <View
            className="flex-row gap-3 px-5 py-4"
            style={{ borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#F3F4F6' }}
          >
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-3.5 rounded-xl items-center"
              style={{ borderWidth: 1, borderColor: isDark ? '#4B5563' : '#E5E7EB' }}
            >
              <Body className="font-outfit-medium text-sm" style={{ color: isDark ? '#F9FAFB' : '#374151' }}>
                Cancel
              </Body>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={selected.length === 0}
              className="flex-1 py-3.5 rounded-xl items-center"
              style={{ backgroundColor: selected.length > 0 ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB') }}
            >
              <Body
                className="font-outfit-semibold text-sm"
                style={{ color: selected.length > 0 ? '#fff' : '#9CA3AF' }}
              >
                Assign {selected.length > 0 ? `${selected.length} worker${selected.length > 1 ? 's' : ''}` : ''}
              </Body>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface ClientDetailsScreenProps {
  route: { params: { clientId: string } };
  navigation: any;
}

export const ClientDetailsScreen: React.FC<ClientDetailsScreenProps> = ({ route, navigation }) => {
  const { clientId }     = route.params;
  const { top }          = useSafeAreaInsets();
  const { isDark }       = useTheme();
  const { showToast }    = useToast();

  const [activeTab, setActiveTab]           = useState<TabKey>('overview');
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // ── Data ──
  const { data: clientRes,    isLoading: clientLoading }    = useGetClientDetailsQuery(clientId);
  const { data: workersRes,   isLoading: workersLoading }   = useGetClientWorkersQuery(clientId);
  const { data: availableRaw, isLoading: availableLoading, isError: availableError, error: availableErrorDetail } = useGetWorkersQuery({});
  const { data: shiftsRes,  isLoading: shiftsLoading }    = useGetClientShiftsQuery(clientId);
  const { data: invoices = [], isLoading: invoicesLoading } = useGetClientInvoicesQuery(clientId);
  const { data: timesheetRes, isLoading: timesheetLoading }= useGetClientTimesheetQuery(clientId);

  const [bulkAssignWorkers]      = useBulkAssignWorkersMutation();
  const [removeWorkerAssignment] = useRemoveWorkerAssignmentMutation();

  const client    = clientRes?.data ?? null;
  const workers   = workersRes?.data ?? [];
  const available: ClientWorker[] = Array.isArray(availableRaw?.data) ? (availableRaw.data as unknown as ClientWorker[]) : [];
  const shifts    = shiftsRes?.data ?? [];
  const weeks     = timesheetRes?.data?.weeks ?? [];


  // ── Actions ──
  const handleAssign = async (ids: string[]) => {
    if (!ids.length) return;
    try {
      await bulkAssignWorkers({ workerIds: ids, clientCompanyId: clientId }).unwrap();
      showToast(`${ids.length} worker${ids.length > 1 ? 's' : ''} assigned`, 'success');
      setAssignModalOpen(false);
    } catch (e: any) {
      showToast(e?.data?.error ?? 'Failed to assign workers', 'error');
    }
  };

  const handleRemoveWorker = (workerId: string) => {
    Alert.alert('Remove worker', 'Remove this worker from the client?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await removeWorkerAssignment({ workerId, clientCompanyId: clientId }).unwrap();
            showToast('Worker removed', 'success');
          } catch (e: any) {
            showToast(e?.data?.error ?? 'Failed to remove worker', 'error');
          }
        },
      },
    ]);
  };

  // ── Loading / error ──
  if (clientLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: isDark ? '#111827' : '#F3F4F6' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }
  if (!client) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: isDark ? '#111827' : '#F3F4F6' }}>
        <EmptyState icon="business-outline" title="Client not found" isDark={isDark} />
      </View>
    );
  }

  const palette   = getAvatarPalette(client.name);
  const statusCfg = STATUS_CONFIG[client.status] ?? STATUS_CONFIG.INACTIVE;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View className="flex-1" style={{ backgroundColor: isDark ? '#111827' : '#F3F4F6' }}>

      {/* Safe-area spacer */}
      <View style={{ height: top, backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }} />

      {/* ── Header ── */}
      <View
        className="flex-row items-center px-4 py-3.5 gap-3"
        style={{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#E5E7EB' }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color={isDark ? '#F9FAFB' : '#111827'} />
        </TouchableOpacity>
        <View className="flex-1">
          <H2 style={{ color: isDark ? '#F9FAFB' : '#111827' }} numberOfLines={1}>{client.name}</H2>
        </View>
        <StatusPill status={client.status} />
      </View>

      {/* ── Hero card — compact ── */}
      <View style={{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#E5E7EB' }}>
        {/* Avatar + meta in one tight row */}
        <View className="flex-row items-center gap-3 mb-3">
          <View
            className="w-12 h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: palette.bg }}
          >
            <Body className="font-outfit-bold text-lg" style={{ color: palette.text }}>
              {getInitials(client.name)}
            </Body>
          </View>
          <View className="flex-1 gap-0.5">
            {client.industry ? (
              <View className="flex-row items-center gap-1">
                <Ionicons name="business-outline" size={12} color="#9CA3AF" />
                <Caption color="secondary" className="text-xs">{client.industry}</Caption>
              </View>
            ) : null}
            {client.contactEmail ? (
              <View className="flex-row items-center gap-1">
                <Ionicons name="mail-outline" size={12} color="#9CA3AF" />
                <Caption color="secondary" className="text-xs" numberOfLines={1}>{client.contactEmail}</Caption>
              </View>
            ) : null}
            {client.city ? (
              <View className="flex-row items-center gap-1">
                <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                <Caption color="secondary" className="text-xs">{client.city}</Caption>
              </View>
            ) : null}
          </View>
        </View>

        {/* Compact horizontal stat pills */}
        <View className="flex-row -mx-1">
          <StatPill label="Shifts"   value={client.totalShifts}   icon="briefcase-outline" iconColor="#3B82F6" iconBg="#DBEAFE" isDark={isDark} />
          <StatPill label="Invoices" value={client.totalInvoices} icon="receipt-outline"   iconColor="#10B981" iconBg="#D1FAE5" isDark={isDark} />
          <StatPill label="Workers"  value={workers.length}       icon="people-outline"    iconColor="#F59E0B" iconBg="#FEF3C7" isDark={isDark} />
        </View>
      </View>

{/* ── Tab bar ── */}
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  style={{
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#374151' : '#E5E7EB',
    flexGrow: 0,
    maxHeight: 48,
  }}
  contentContainerStyle={{
    paddingHorizontal: 8,
    alignItems: 'center',
  }}
>
  {TABS.map((tab) => {
    const active = activeTab === tab.key;

    return (
      <TouchableOpacity
        key={tab.key}
        onPress={() => setActiveTab(tab.key)}
        className="flex-row items-center gap-1.5 px-2.5 mr-1"
        style={{
          height: 46,
          borderBottomWidth: 2.5,
          borderBottomColor: active ? '#3B82F6' : 'transparent',
        }}
      >
        <Ionicons
          name={tab.icon}
          size={15}
          color={active ? '#3B82F6' : '#9CA3AF'}
        />

        <Caption
          className="text-xs font-outfit-semibold"
          style={{
            color: active ? '#3B82F6' : isDark ? '#9CA3AF' : '#6B7280',
          }}
        >
          {tab.label}
        </Caption>
      </TouchableOpacity>
    );
  })}
</ScrollView>

      {/* ── Tab content ── */}
      {activeTab === 'overview' && <OverviewTab client={client} isDark={isDark} />}
      {activeTab === 'workers' && (
        <WorkersTab
          clientId={clientId}
          workers={workers}
          workersLoading={workersLoading}
          isDark={isDark}
          onAssignPress={() => setAssignModalOpen(true)}
          onRemoveWorker={handleRemoveWorker}
        />
      )}
      {activeTab === 'shifts'    && <ShiftsTab    shifts={shifts}       loading={shiftsLoading}    isDark={isDark} />}
      {activeTab === 'invoices'  && <InvoicesTab  invoices={invoices}   loading={invoicesLoading}  isDark={isDark} />}
      {activeTab === 'timesheet' && <TimesheetTab weeks={weeks}         loading={timesheetLoading} isDark={isDark} />}

      {/* ── Assign modal ── */}
      <AssignWorkersModal
        visible={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        availableWorkers={available}
        assignedWorkers={workers}
        onAssign={handleAssign}
        isDark={isDark}
      />
    </View>
  );
};

export default ClientDetailsScreen;