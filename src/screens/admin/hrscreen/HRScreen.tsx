import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme, useTheme } from '../../../contexts';
import { H2, H3, Body, Caption, Card, Badge,PaginatedCardList,FilterOption,PaginatedCardListProps } from '../../../components/ui';
interface Manager {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  roleDisplay: string;
  teamNumber: string;
  managedWorkersCount: number;
  status: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const MANAGERS: Manager[] = [
  {
    id: '1', fullName: 'Alice Johnson', email: 'alice.johnson@email.com',
    phone: '+44 7700 111001', role: 'OPS_MANAGER', roleDisplay: 'Operations Manager',
    teamNumber: 'TM-001', managedWorkersCount: 15, status: 'ACTIVE',
  },
  {
    id: '2', fullName: 'Bob Smith', email: 'bob.smith@email.com',
    phone: '+44 7700 111002', role: 'SHIFT_COORDINATOR', roleDisplay: 'Shift Coordinator',
    teamNumber: 'TM-002', managedWorkersCount: 8, status: 'ACTIVE',
  },
  {
    id: '3', fullName: 'Carol Davis', email: 'carol.davis@email.com',
    phone: '+44 7700 111003', role: 'COMPLIANCE_OFFICER', roleDisplay: 'Compliance Officer',
    teamNumber: 'TM-003', managedWorkersCount: 12, status: 'SUSPENDED',
  },
  {
    id: '4', fullName: 'David Wilson', email: 'david.wilson@email.com',
    phone: '+44 7700 111004', role: 'SHIFT_COORDINATOR', roleDisplay: 'Shift Coordinator',
    teamNumber: 'TM-004', managedWorkersCount: 6, status: 'INVITED',
  },
  {
    id: '5', fullName: 'Emma Brown', email: 'emma.brown@email.com',
    phone: '+44 7700 111005', role: 'OPS_MANAGER', roleDisplay: 'Operations Manager',
    teamNumber: 'TM-005', managedWorkersCount: 20, status: 'ACTIVE',
  },
  {
    id: '6', fullName: 'Frank Turner', email: 'frank.turner@email.com',
    phone: '+44 7700 111006', role: 'COMPLIANCE_OFFICER', roleDisplay: 'Compliance Officer',
    teamNumber: 'TM-006', managedWorkersCount: 9, status: 'ACTIVE',
  },
  {
    id: '7', fullName: 'Grace Lee', email: 'grace.lee@email.com',
    phone: '+44 7700 111007', role: 'SHIFT_COORDINATOR', roleDisplay: 'Shift Coordinator',
    teamNumber: 'TM-007', managedWorkersCount: 11, status: 'INVITED',
  },
];

const STATUS_FILTERS: FilterOption[] = [
  { label: 'Active',    value: 'ACTIVE'    },
  { label: 'Suspended', value: 'SUSPENDED' },
  { label: 'Invited',   value: 'INVITED'   },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

const getStatusVariant = (status: string) => {
  if (status === 'ACTIVE')    return 'success';
  if (status === 'SUSPENDED') return 'error';
  return 'default';
};

const getStatusDisplay = (status: string) => {
  const map: Record<string, string> = {
    ACTIVE: 'Active', SUSPENDED: 'Blocked', INVITED: 'Invited',
  };
  return map[status] ?? status;
};

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const getTrendIcon  = (v: number) => v >= 0 ? 'arrow-up-outline'  : 'arrow-down-outline';
const getTrendColor = (v: number) => v >= 0 ? '#10B981'           : '#EF4444';

const getRoleStyle = (role: string) => {
  const map: Record<string, { bg: string; text: string }> = {
    OPS_MANAGER:        { bg: '#EDE9FE', text: '#7C3AED' },
    SHIFT_COORDINATOR:  { bg: '#DBEAFE', text: '#2563EB' },
    COMPLIANCE_OFFICER: { bg: '#FEF3C7', text: '#D97706' },
  };
  return map[role] ?? { bg: '#F3F4F6', text: '#6B7280' };
};

// ─── Screen ────────────────────────────────────────────────────────────────

export function HRScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();

  const stats = {
    totalManagers:     { count: 12, change: 8 },
    activeManagers:    { count: 10, change: 5 },
    inactiveManagers:  { count: 2,  change: 0 },
    averageCompliance: { score: 85, change: 3 },
  };

  // ── Manager card renderer ─────────────────────────────────────────────
  const renderManager = (manager: Manager) => {
    const roleStyle = getRoleStyle(manager.role);
    return (
      <Card className="p-4">
        {/* Top row: avatar + name + status badge */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-3">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: roleStyle.bg }}
            >
              <Body className="text-xs font-outfit-bold" style={{ color: roleStyle.text }}>
                {getInitials(manager.fullName)}
              </Body>
            </View>
            <View>
              <Body className="font-outfit-semibold text-sm">{manager.fullName}</Body>
              <View className="flex-row items-center gap-1.5 mt-0.5">
                <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: roleStyle.bg }}>
                  <Caption className="text-[10px] font-outfit-medium" style={{ color: roleStyle.text }}>
                    {manager.roleDisplay}
                  </Caption>
                </View>
                <Caption color="secondary" className="text-[10px]">#{manager.teamNumber}</Caption>
              </View>
            </View>
          </View>
          <Badge variant={getStatusVariant(manager.status) as any} className="text-[10px]">
            {getStatusDisplay(manager.status)}
          </Badge>
        </View>

        {/* Info block */}
        <View
          className="rounded-xl p-3 mb-3 gap-2.5"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}
        >
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Caption color="secondary" className="text-[10px] mb-0.5">Email</Caption>
              <Body className="text-xs" numberOfLines={1}>{manager.email}</Body>
            </View>
            <View className="flex-1">
              <Caption color="secondary" className="text-[10px] mb-0.5">Phone</Caption>
              <Body className="text-xs">{manager.phone}</Body>
            </View>
          </View>
          <View className="h-px bg-light-border-light dark:bg-dark-border-light" />
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="people-outline" size={13} color="#9CA3AF" />
            <Caption color="secondary" className="text-xs">
              Managing{' '}
              <Caption className="font-outfit-semibold text-xs" color="primary">
                {manager.managedWorkersCount} workers
              </Caption>
            </Caption>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row gap-2">
          <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2.5 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary gap-1.5">
            <Ionicons name="eye-outline" size={15} color={isDark ? '#FFF' : '#000035'} />
            <Body className="text-xs">View Profile</Body>
          </TouchableOpacity>

          {manager.role === 'SHIFT_COORDINATOR' && (
            <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2.5 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary gap-1.5">
              <Ionicons name="people-outline" size={15} color={isDark ? '#FFF' : '#000035'} />
              <Body className="text-xs">Assign</Body>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-2.5 rounded-lg gap-1.5"
            style={{
              backgroundColor: manager.status === 'SUSPENDED'
                ? (isDark ? 'rgba(16,185,129,0.15)' : '#D1FAE5')
                : (isDark ? 'rgba(239,68,68,0.12)'  : '#FFE4E6'),
            }}
          >
            <Ionicons
              name={manager.status === 'SUSPENDED' ? 'checkmark-circle-outline' : 'ban-outline'}
              size={15}
              color={manager.status === 'SUSPENDED' ? '#10B981' : '#EF4444'}
            />
            <Body
              className="text-xs font-outfit-medium"
              style={{ color: manager.status === 'SUSPENDED' ? '#10B981' : '#EF4444' }}
            >
              {manager.status === 'SUSPENDED' ? 'Activate' : 'Block'}
            </Body>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View
      className="flex-1 bg-light-background-primary dark:bg-dark-background-primary"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <View>
          <H2>HR Management</H2>
          <Caption color="secondary">Monitor manager performance & workload</Caption>
        </View>
        <TouchableOpacity
          className="flex-row items-center gap-2 px-4 py-3 rounded-xl"
          style={{ backgroundColor: primaryColor }}
        >
          <Ionicons name="add" size={18} color="#FFF" />
          <Body className="text-white font-outfit-semibold text-sm">Invite Team</Body>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* ── Stat Cards ─────────────────────────────────────────────── */}
        <View className="px-5 mb-6">
          {/* Compliance hero */}
          <Card className="p-5 mb-3 overflow-hidden" style={{ backgroundColor: primaryColor }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Caption className="text-white/70 text-xs mb-1">Average Compliance</Caption>
                <View className="flex-row items-end gap-2">
                  <H2 className="text-white text-4xl font-outfit-bold">
                    {stats.averageCompliance.score}%
                  </H2>
                  <View className="flex-row items-center gap-1 mb-1">
                    <Ionicons
                      name={getTrendIcon(stats.averageCompliance.change)}
                      size={13}
                      color="rgba(255,255,255,0.85)"
                    />
                    <Caption className="text-white/85 text-xs">
                      {Math.abs(stats.averageCompliance.change)}% this month
                    </Caption>
                  </View>
                </View>
                <View className="mt-3 h-1.5 rounded-full bg-white/20">
                  <View
                    className="h-1.5 rounded-full bg-white"
                    style={{ width: `${stats.averageCompliance.score}%` }}
                  />
                </View>
              </View>
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center ml-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
              >
                <Ionicons name="shield-checkmark" size={26} color="#FFF" />
              </View>
            </View>
          </Card>

          {/* Three small stat cards */}
          <View className="flex-row gap-3">
            {[
              { icon: 'people',           iconColor: '#F59E0B', bg: '#FEF3C7', count: stats.totalManagers.count,    change: stats.totalManagers.change,    label: 'Total\nManagers'    },
              { icon: 'checkmark-circle', iconColor: '#10B981', bg: '#D1FAE5', count: stats.activeManagers.count,   change: stats.activeManagers.change,   label: 'Active\nManagers'   },
              { icon: 'close-circle',     iconColor: '#EF4444', bg: '#FFE4E6', count: stats.inactiveManagers.count, change: stats.inactiveManagers.change, label: 'Inactive\nManagers' },
            ].map((s, i) => (
              <Card key={i} className="flex-1 p-4">
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center mb-3"
                  style={{ backgroundColor: s.bg }}
                >
                  <Ionicons name={s.icon as any} size={18} color={s.iconColor} />
                </View>
                <H3 className="text-xl font-outfit-bold mb-0.5">{s.count}</H3>
                <Caption color="secondary" className="text-xs leading-tight">{s.label}</Caption>
                <View className="flex-row items-center gap-1 mt-2">
                  {s.change !== 0 ? (
                    <>
                      <Ionicons name={getTrendIcon(s.change)} size={11} color={getTrendColor(s.change)} />
                      <Caption className="text-[10px]" style={{ color: getTrendColor(s.change) }}>
                        {Math.abs(s.change)}%
                      </Caption>
                    </>
                  ) : (
                    <>
                      <Ionicons name="remove-outline" size={11} color="#9CA3AF" />
                      <Caption className="text-[10px] text-gray-400">No change</Caption>
                    </>
                  )}
                </View>
              </Card>
            ))}
          </View>
        </View>

        {/* ── PaginatedCardList ───────────────────────────────────────── */}
        <PaginatedCardList<Manager>
          data={MANAGERS}
          defaultPageSize={3}
          pageSizeOptions={[3, 5, 7]}
          renderItem={renderManager}
          searchKeys={['fullName', 'email', 'teamNumber']}
          searchPlaceholder="Search by name, email or team..."
          filterOptions={STATUS_FILTERS}
          filterKey="status"
          sectionLabel="Team Members"
          className="px-5 mb-6"
        />

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}

export default HRScreen;
