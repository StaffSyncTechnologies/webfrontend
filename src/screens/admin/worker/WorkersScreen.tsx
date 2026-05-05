import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useOrgTheme, useTheme, useToast } from '../../../contexts';
import { H2, H3, Body, Caption, Card, Badge, PaginatedCardList, FilterOption, Input } from '../../../components/ui';
import InviteWorkerModal from './InviteWorkerModal';
import {BankAccountModal} from './BankAccountModal'
import { BlockReasonModal } from './BlockReasonModal';
import { useGetWorkerListStatsQuery, useGetWorkersQuery, useInviteWorkerMutation, useSuspendWorkerMutation, useReactivateWorkerMutation, useCreateWorkerBlockMutation, useLiftWorkerBlockMutation } from '../../../store/slices/adminSlices/workerSlice';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  bankAccount: {
    bankName: string;
    sortCode: string;
    accountNumber: string;
    isVerified: boolean;
  } | null;
  workerBlocks?: Array<{
    id: string;
    status: string;
  }>;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const STATUS_FILTERS: FilterOption[] = [
  { label: 'Active',    value: 'ACTIVE'    },
  { label: 'Blocked',   value: 'BLOCKED'   },
  { label: 'Suspended', value: 'SUSPENDED' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

const getStatusVariant = (status: string) => {
  const map: Record<string, string> = {
    ACTIVE: 'success', BLOCKED: 'error', SUSPENDED: 'warning',
  };
  return map[status] ?? 'default';
};

// Transform backend worker data to frontend format
const transformWorkerData = (backendWorker: any): Worker => {
  return {
    id: backendWorker.id,
    name: backendWorker.fullName,
    email: backendWorker.email,
    phone: backendWorker.phone || 'N/A',
    role: backendWorker.workerProfile?.primaryRole || 'Worker',
    status: backendWorker.status,
    bankAccount: backendWorker.bankAccount ? {
      bankName: backendWorker.bankAccount.bankName || 'Unknown',
      sortCode: backendWorker.bankAccount.sortCode || '',
      accountNumber: backendWorker.bankAccount.accountNumber || '',
      isVerified: backendWorker.bankAccount.isVerified || false,
    } : null,
    workerBlocks: backendWorker.workerBlocks || [],
  };
};

const getBankStatusColor = (worker: Worker) => {
  if (!worker.bankAccount) return 'error';
  if (worker.bankAccount.isVerified) return 'success';
  return 'warning';
};

const getBankStatusLabel = (worker: Worker) => {
  if (!worker.bankAccount) return 'No Bank';
  if (worker.bankAccount.isVerified) return 'Verified';
  return 'Unverified';
};

// ─── Screen ────────────────────────────────────────────────────────────────

export function WorkersScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const toast = useToast();
  const navigation = useNavigation();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showBlockReasonModal, setShowBlockReasonModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [workerToBlock, setWorkerToBlock] = useState<string | null>(null);

  // API hooks
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useGetWorkerListStatsQuery();
  const { data: workersData, isLoading: workersLoading, refetch: refetchWorkers } = useGetWorkersQuery({ status: undefined });
  const [inviteWorker, { isLoading: inviteLoading }] = useInviteWorkerMutation();
  const [suspendWorker] = useSuspendWorkerMutation();
  const [reactivateWorker] = useReactivateWorkerMutation();
  const [createWorkerBlock] = useCreateWorkerBlockMutation();
  const [liftWorkerBlock] = useLiftWorkerBlockMutation();

  // Force refetch stats on mount to get fresh data
  useEffect(() => {
    refetchStats();
  }, [refetchStats]);

  // Refetch data when screen comes into focus (e.g., navigating back from WorkerDetailsScreen)
  useFocusEffect(
    useCallback(() => {
      refetchWorkers();
      refetchStats();
    }, [refetchWorkers, refetchStats])
  );

  // Transform data
  const stats = useMemo(() => ({
    totalWorkers: statsData?.totalWorkers?.value ?? 0,
    activeWorkers: statsData?.activeWorkers?.value ?? 0,
    onShift: statsData?.onShift?.value ?? 0,
    blocked: statsData?.blocked?.value ?? 0,
    suspended: statsData?.suspended?.value ?? 0,
  }), [statsData]);

  const workers = useMemo(() => {
    if (!workersData?.data) return [];
    return workersData.data.map(transformWorkerData);
  }, [workersData]);

  const handleInviteWorker = async (workerData: any) => {
    console.log('Inviting worker:', workerData);
    try {
      const result = await inviteWorker(workerData).unwrap();
      console.log('Invite result:', result);
      toast.success('Worker invited successfully');
      setShowInviteModal(false);
      refetchWorkers();
    } catch (error) {
      console.error('Failed to invite worker:', error);
      toast.error('Failed to invite worker');
    }
  };

  const handleViewWorker = (workerId: string) => {
    // @ts-ignore
    navigation.navigate('WorkerDetailsScreen', { workerId });
  };

  const handleEditBank = (worker: Worker) => {
    setSelectedWorker(worker);
    setShowBankModal(true);
  };

  const handleSaveBankAccount = async (data: any) => {
    console.log('Save bank account:', data);
    // TODO: Implement save bank account API call
  };

  const handleVerifyBankAccount = async () => {
    console.log('Verify bank account');
    // TODO: Implement verify bank account API call
  };

  const handleSuspendWorker = async (workerId: string) => {
    Alert.alert(
      'Suspend Worker',
      'Are you sure you want to suspend this worker?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Suspend',
          style: 'destructive',
          onPress: async () => {
            try {
              await suspendWorker({ workerId, reason: 'Suspended by admin' }).unwrap();
              Alert.alert('Success', 'Worker suspended successfully');
              refetchWorkers();
              refetchStats();
            } catch (error) {
              console.error('Failed to suspend worker:', error);
              Alert.alert('Error', 'Failed to suspend worker');
            }
          },
        },
      ],
    );
  };

  const handleBlockWorker = async (workerId: string) => {
    setWorkerToBlock(workerId);
    setShowBlockReasonModal(true);
  };

  const handleSelectBlockReason = async (reason: string) => {
    setShowBlockReasonModal(false);
    if (!workerToBlock) return;

    Alert.alert(
      'Block Worker',
      'Are you sure you want to block this worker?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await createWorkerBlock({ workerId: workerToBlock, reason, blockType: 'GLOBAL' }).unwrap();
              Alert.alert('Success', 'Worker blocked successfully');
              refetchWorkers();
              refetchStats();
              setWorkerToBlock(null);
            } catch (error) {
              console.error('Failed to block worker:', error);
              Alert.alert('Error', 'Failed to block worker');
            }
          },
        },
      ],
    );
  };

  const handleReactivateWorker = async (workerId: string) => {
    Alert.alert(
      'Reactivate Worker',
      'Are you sure you want to reactivate this worker?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reactivate',
          style: 'default',
          onPress: async () => {
            try {
              await reactivateWorker(workerId).unwrap();
              Alert.alert('Success', 'Worker reactivated successfully');
              refetchWorkers();
              refetchStats();
            } catch (error) {
              console.error('Failed to reactivate worker:', error);
              Alert.alert('Error', 'Failed to reactivate worker');
            }
          },
        },
      ],
    );
  };

  const handleUnblockWorker = async (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker || !worker.workerBlocks || worker.workerBlocks.length === 0) {
      Alert.alert('Error', 'No active block found for this worker');
      return;
    }

    const activeBlock = worker.workerBlocks[0];

    Alert.alert(
      'Unblock Worker',
      'Are you sure you want to unblock this worker?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          style: 'default',
          onPress: async () => {
            try {
              await liftWorkerBlock({ workerId, blockId: activeBlock.id }).unwrap();
              Alert.alert('Success', 'Worker unblocked successfully');
              refetchWorkers();
              refetchStats();
            } catch (error) {
              console.error('Failed to unblock worker:', error);
              Alert.alert('Error', 'Failed to unblock worker');
            }
          },
        },
      ],
    );
  };

  // ── Worker card renderer ───────────────────────────────────────────────
  const renderWorker = (worker: Worker) => {
    return (
      <Card className="p-4">
        {/* ── Header row ── */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 pr-3">
            <View className="flex-row items-center gap-2 mb-1">
              <Body className="font-outfit-semibold text-sm">{worker.name}</Body>
              <Badge variant={getBankStatusColor(worker) as any} className="text-[10px]">
                {getBankStatusLabel(worker)}
              </Badge>
            </View>
            <View className="flex-row items-center gap-1.5 flex-wrap">
              <View
                className="flex-row items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6' }}
              >
                <Ionicons name="person-outline" size={10} color="#9CA3AF" />
                <Caption className="text-[10px]" color="secondary">{worker.role}</Caption>
              </View>
              <View
                className="flex-row items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6' }}
              >
                <Ionicons name="call-outline" size={10} color="#9CA3AF" />
                <Caption className="text-[10px]" color="secondary">{worker.phone}</Caption>
              </View>
            </View>
          </View>
          <Badge variant={getStatusVariant(worker.status) as any} className="text-[10px] shrink-0">
            {worker.status}
          </Badge>
        </View>

        {/* ── Contact strip ── */}
        <View
          className="flex-row items-center px-3 py-2 rounded-xl mb-3"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}
        >
          <View className="flex-row items-center gap-1.5 flex-1">
            <Ionicons name="mail-outline" size={13} color="#9CA3AF" />
            <Caption color="secondary" className="text-xs" numberOfLines={1}>{worker.email}</Caption>
          </View>
        </View>

        {/* ── Bank Account Details ── */}
        <View className="mb-3 p-3 rounded-xl bg-light-background-secondary dark:bg-dark-background-secondary">
          <View className="flex-row items-center justify-between mb-2">
            <Caption color="secondary" className="text-xs">Bank Account</Caption>
            {worker.bankAccount && !worker.bankAccount.isVerified && (
              <TouchableOpacity className="flex-row items-center">
                <Ionicons name="checkmark-circle-outline" size={14} color="#10B981" />
                <Caption className="text-xs ml-1" style={{ color: '#10B981' }}>Verify</Caption>
              </TouchableOpacity>
            )}
          </View>
          {worker.bankAccount ? (
            <View className="gap-1">
              <Body className="text-sm">{worker.bankAccount.bankName}</Body>
              <View className="flex-row gap-4">
                <Caption color="secondary" className="text-xs">Sort Code: {worker.bankAccount.sortCode}</Caption>
                <Caption color="secondary" className="text-xs">Account: ****{worker.bankAccount.accountNumber.slice(-4)}</Caption>
              </View>
            </View>
          ) : (
            <Caption color="secondary" className="text-xs italic">No bank details provided</Caption>
          )}
        </View>

        {/* ── Actions ── */}
        <View className="flex-row gap-2 flex-wrap pt-3 border-t border-light-border-light dark:border-dark-border-light">
          <TouchableOpacity
            className="flex-row items-center justify-center px-3 py-2 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary gap-1.5"
            onPress={() => handleViewWorker(worker.id)}
          >
            <Ionicons name="eye-outline" size={14} color={isDark ? '#FFF' : '#374151'} />
            <Body className="text-xs">View</Body>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center px-3 py-2 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary gap-1.5"
            onPress={() => handleEditBank(worker)}
          >
            <Ionicons name="card-outline" size={14} color={isDark ? '#FFF' : '#374151'} />
            <Body className="text-xs">{worker.bankAccount ? 'Edit' : 'Add'}</Body>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center px-3 py-2 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary gap-1.5"
            onPress={() => worker.status === 'SUSPENDED' ? handleReactivateWorker(worker.id) : handleSuspendWorker(worker.id)}
          >
            <Ionicons name={worker.status === 'SUSPENDED' ? 'play-circle-outline' : 'pause-circle-outline'} size={14} color={isDark ? '#FFF' : '#374151'} />
            <Body className="text-xs">{worker.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}</Body>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center px-3 py-2 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary gap-1.5"
            onPress={() => worker.status === 'BLOCKED' ? handleUnblockWorker(worker.id) : handleBlockWorker(worker.id)}
          >
            <Ionicons name={worker.status === 'BLOCKED' ? 'person-add-outline' : 'person-remove-outline'} size={14} color={worker.status === 'BLOCKED' ? '#10B981' : '#EF4444'} />
            <Body className="text-xs" style={{ color: worker.status === 'BLOCKED' ? '#10B981' : '#EF4444' }}>{worker.status === 'BLOCKED' ? 'Unblock' : 'Block'}</Body>
          </TouchableOpacity>

          <TouchableOpacity className="w-8 h-8 items-center justify-center rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary">
            <Ionicons name="ellipsis-horizontal" size={14} color={isDark ? '#FFF' : '#374151'} />
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
      {/* ── Header ──────────────────────────────────────────────────── */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <View>
          <H2>Workers</H2>
          <Caption color="secondary">Manage and monitor your workforce</Caption>
        </View>
        <TouchableOpacity
          className="flex-row items-center gap-2 px-4 py-3 rounded-xl"
          style={{ backgroundColor: primaryColor }}
          onPress={() => setShowInviteModal(true)}
        >
          <Ionicons name="person-add" size={18} color="#FFF" />
          <Body className="text-white font-outfit-semibold text-sm">Invite Worker</Body>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* ── Stat Cards ─────────────────────────────────────────────── */}
        <View className="px-5 mb-6">
          {/* Hero card — total workers */}
          <Card className="p-5 mb-3" style={{ backgroundColor: primaryColor }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Caption className="text-white/70 text-xs mb-1">Total Workers</Caption>
                <View className="flex-row items-end gap-2">
                  <H2 className="text-white text-4xl font-outfit-bold">{stats.totalWorkers}</H2>
                </View>
                {/* Active vs blocked mini-bar */}
                <View className="mt-3">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Caption className="text-white/70 text-[10px]">
                      {stats.activeWorkers} active · {stats.blocked} blocked
                    </Caption>
                    <Caption className="text-white/70 text-[10px]">
                      {Math.round((stats.activeWorkers / stats.totalWorkers) * 100)}%
                    </Caption>
                  </View>
                  <View className="h-1.5 rounded-full bg-white/20">
                    <View
                      className="h-1.5 rounded-full bg-white"
                      style={{ width: `${Math.round((stats.activeWorkers / stats.totalWorkers) * 100)}%` }}
                    />
                  </View>
                </View>
              </View>
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center ml-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
              >
                <Ionicons name="people" size={26} color="#FFF" />
              </View>
            </View>
          </Card>

          {/* Four small stat cards */}
          <View className="flex-row gap-3">
            {[
              { icon: 'checkmark-circle', iconColor: '#10B981', bg: '#D1FAE5', count: stats.activeWorkers, label: 'Active\nWorkers'  },
              { icon: 'time',             iconColor: '#3B82F6', bg: '#DBEAFE', count: stats.onShift,    label: 'On\nShift'   },
              { icon: 'pause-circle',     iconColor: '#F59E0B', bg: '#FEF3C7', count: stats.suspended,   label: 'Suspended\nWorkers' },
              { icon: 'alert-circle',     iconColor: '#EF4444', bg: '#FFE4E6', count: stats.blocked,    label: 'Blocked\nWorkers' },
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
              </Card>
            ))}
          </View>
        </View>

        {/* ── PaginatedCardList ───────────────────────────────────────── */}
        {workersLoading ? (
          <View className="flex-col items-center justify-center py-12">
            <ActivityIndicator size="large" color={primaryColor} />
            <Caption color="secondary" className="mt-3">Loading workers...</Caption>
          </View>
        ) : (
          <PaginatedCardList<Worker>
            data={workers}
            defaultPageSize={3}
            pageSizeOptions={[3, 5, 7]}
            renderItem={renderWorker}
            searchKeys={['name', 'email', 'phone', 'role']}
            searchPlaceholder="Search workers, roles or emails..."
            filterOptions={STATUS_FILTERS}
            filterKey="status"
            sectionLabel="Workers"
            emptyTitle="No workers found"
            emptySubtitle="Try a different search term or filter"
            className="px-5 mb-6"
          />
        )}

        <View className="h-24" />
      </ScrollView>

      {/* ── Modal ──────────────────────────────────────────────────────── */}
      <InviteWorkerModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteWorker}
      />

      <BankAccountModal
        visible={showBankModal}
        onClose={() => setShowBankModal(false)}
        workerId={selectedWorker?.id || ''}
        workerName={selectedWorker?.name || ''}
        hasBankAccount={!!selectedWorker?.bankAccount}
        existingBankAccount={selectedWorker?.bankAccount || undefined}
        onSave={handleSaveBankAccount}
        onVerify={handleVerifyBankAccount}
      />

      <BlockReasonModal
        visible={showBlockReasonModal}
        onClose={() => {
          setShowBlockReasonModal(false);
          setWorkerToBlock(null);
        }}
        onSelectReason={handleSelectBlockReason}
      />
    </View>
  );
}

export default WorkersScreen;
