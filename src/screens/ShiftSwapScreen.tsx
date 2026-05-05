import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme, useTheme } from '../contexts';
import { H2, H3, Body, Caption, Button, Input } from '../components/ui';
import {
  useGetMySwapRequestsQuery,
  useGetAvailableGiveAwaysQuery,
  useClaimGiveAwayMutation,
  useRespondToSwapMutation,
  useCancelSwapRequestMutation,
  useCreateSwapRequestMutation,
  SwapRequest,
  SwapStatus,
  SwapType,
} from '../store/api/swapApi';
import {
  useGetWorkersForSwapQuery,
  useGetWorkerShiftsForSwapQuery,
} from '../store/api/workerApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

type TabType = 'my' | 'available';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m}${ampm}`;
}

const STATUS_CONFIG: Record<SwapStatus, { label: string; bg: string; color: string }> = {
  PENDING:   { label: 'PENDING',   bg: '#FEF3C7', color: '#D97706' },
  ACCEPTED:  { label: 'ACCEPTED',  bg: '#DBEAFE', color: '#2563EB' },
  DECLINED:  { label: 'DECLINED',  bg: '#FEE2E2', color: '#DC2626' },
  APPROVED:  { label: 'APPROVED',  bg: '#DCFCE7', color: '#16A34A' },
  REJECTED:  { label: 'REJECTED',  bg: '#FEE2E2', color: '#DC2626' },
  CANCELLED: { label: 'CANCELLED', bg: '#F3F4F6', color: '#6B7280' },
};

function StatusBadge({ status }: { status: SwapStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: cfg.bg }}>
      <Caption className="font-outfit-bold" style={{ fontSize: 10, color: cfg.color }}>
        {cfg.label}
      </Caption>
    </View>
  );
}

function ShiftInfo({ shift, label }: { shift: SwapRequest['requesterShift']; label: string }) {
  return (
    <View className="bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl p-3">
      <Caption color="secondary" className="mb-1">{label}</Caption>
      <Body className="font-outfit-semibold">{shift.title}</Body>
      <View className="flex-row items-center mt-1 gap-1">
        <Ionicons name="calendar-outline" size={13} color="#6B7280" />
        <Caption color="secondary">{formatDate(shift.startAt)}</Caption>
        <Caption color="muted" className="mx-1">·</Caption>
        <Ionicons name="time-outline" size={13} color="#6B7280" />
        <Caption color="secondary">{formatTime(shift.startAt)} – {formatTime(shift.endAt)}</Caption>
      </View>
      {shift.siteLocation && (
        <View className="flex-row items-center mt-0.5 gap-1">
          <Ionicons name="location-outline" size={13} color="#6B7280" />
          <Caption color="secondary">{shift.siteLocation}</Caption>
        </View>
      )}
    </View>
  );
}

export function ShiftSwapScreen({ route, navigation }: RootStackScreenProps<'ShiftSwap'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const prefilledShiftId = route.params?.shiftId;
  const currentUser = useSelector((state: RootState) => state.auth.worker);

  const [activeTab, setActiveTab] = useState<TabType>(prefilledShiftId ? 'my' : 'available');
  const [actingId, setActingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(!!prefilledShiftId);
  const [swapType, setSwapType] = useState<SwapType>('GIVE_AWAY');
  const [requesterNote, setRequesterNote] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [targetWorkerId, setTargetWorkerId] = useState<string | null>(null);
  const [targetShiftId, setTargetShiftId] = useState<string | null>(null);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // RTK Query hooks for worker/shift selection
  const { data: workersData, isLoading: loadingWorkers } = useGetWorkersForSwapQuery(undefined, {
    skip: swapType !== 'DIRECT_SWAP' || !showWorkerModal,
  });
  const { data: targetShiftsData, isLoading: loadingShifts } = useGetWorkerShiftsForSwapQuery(targetWorkerId || '', {
    skip: !targetWorkerId,
  });

  const workers = workersData?.data || [];
  const targetShifts = targetShiftsData?.data || [];
  const [filteredWorkers, setFilteredWorkers] = useState<any[]>([]);

  const {
    data: myData,
    isLoading: myLoading,
    isFetching: myFetching,
    refetch: refetchMy,
  } = useGetMySwapRequestsQuery();

  const {
    data: availableData,
    isLoading: availLoading,
    isFetching: availFetching,
    refetch: refetchAvail,
  } = useGetAvailableGiveAwaysQuery();

  const [claimGiveAway] = useClaimGiveAwayMutation();
  const [respondToSwap] = useRespondToSwapMutation();
  const [cancelSwap] = useCancelSwapRequestMutation();
  const [createSwapRequest] = useCreateSwapRequestMutation();

  const isLoading = activeTab === 'my' ? myLoading : availLoading;
  const isFetching = activeTab === 'my' ? myFetching : availFetching;
  const refetch = activeTab === 'my' ? refetchMy : refetchAvail;

  const myRequests = myData?.data || [];
  const availableGiveAways = availableData?.data || [];

  // Check if there's already a swap request for the current shift
  const existingSwapRequest = myRequests.find(
    (req) => req.requesterShiftId === prefilledShiftId && ['PENDING', 'ACCEPTED'].includes(req.status)
  );

  // Hide create form if there's already a swap request for this shift
  React.useEffect(() => {
    if (existingSwapRequest && showCreateForm) {
      setShowCreateForm(false);
      Alert.alert(
        'Swap Request Exists',
        'You already have a pending or accepted swap request for this shift.',
        [{ text: 'OK' }]
      );
    }
  }, [existingSwapRequest, showCreateForm]);

  const handleClaim = async (req: SwapRequest) => {
    Alert.alert(
      'Cover This Shift',
      `Take over "${req.requesterShift.title}" on ${formatDate(req.requesterShift.startAt)} from ${req.requester.fullName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setActingId(req.id);
            try {
              await claimGiveAway(req.id).unwrap();
              Alert.alert('Shift Claimed!', 'The shift has been claimed and is pending admin approval.');
              refetchAvail();
              refetchMy();
            } catch (err: any) {
              Alert.alert('Error', err?.data?.message || 'Could not claim shift');
            } finally {
              setActingId(null);
            }
          },
        },
      ]
    );
  };

  const handleRespond = async (req: SwapRequest, accepted: boolean) => {
    const verb = accepted ? 'accept' : 'decline';
    Alert.alert(
      `${accepted ? 'Accept' : 'Decline'} Swap`,
      `Are you sure you want to ${verb} the swap request from ${req.requester.fullName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: accepted ? 'Accept' : 'Decline',
          style: accepted ? 'default' : 'destructive',
          onPress: async () => {
            setActingId(req.id);
            try {
              await respondToSwap({ id: req.id, accepted }).unwrap();
              Alert.alert(
                accepted ? 'Swap Accepted' : 'Swap Declined',
                accepted
                  ? 'The swap is now awaiting admin approval.'
                  : 'The swap request has been declined.'
              );
              refetchMy();
            } catch (err: any) {
              Alert.alert('Error', err?.data?.message || 'Could not respond to swap');
            } finally {
              setActingId(null);
            }
          },
        },
      ]
    );
  };

  const handleCancel = async (req: SwapRequest) => {
    Alert.alert('Cancel Request', 'Cancel your shift swap request?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setActingId(req.id);
          try {
            await cancelSwap(req.id).unwrap();
            refetchMy();
          } catch (err: any) {
            Alert.alert('Error', err?.data?.message || 'Could not cancel request');
          } finally {
            setActingId(null);
          }
        },
      },
    ]);
  };

  const handleCreateSwapRequest = async () => {
    if (!prefilledShiftId) return;

    if (swapType === 'DIRECT_SWAP' && (!targetWorkerId || !targetShiftId)) {
      Alert.alert('Incomplete Selection', 'Please select a worker and their shift to swap with.');
      return;
    }

    setIsCreating(true);
    try {
      await createSwapRequest({
        requesterShiftId: prefilledShiftId,
        swapType,
        targetId: swapType === 'DIRECT_SWAP' ? targetWorkerId! : undefined,
        targetShiftId: swapType === 'DIRECT_SWAP' ? targetShiftId! : undefined,
        requesterNote: requesterNote.trim() || undefined,
      }).unwrap();

      Alert.alert(
        'Swap Request Created',
        swapType === 'GIVE_AWAY'
          ? 'Your shift is now available for others to claim.'
          : 'Your swap request has been sent.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowCreateForm(false);
              setActiveTab('my');
              refetchMy();
            },
          },
        ]
      );
    } catch (err: any) {
      console.error('Swap request creation error:', err);
      console.error('Error details:', {
        message: err?.data?.message || err?.message || 'Unknown error',
        code: err?.data?.code,
        status: err?.status,
        data: err?.data,
      });
      Alert.alert('Error', err?.data?.message || err?.message || 'Could not create swap request');
    } finally {
      setIsCreating(false);
    }
  };

  // Filter workers based on search query
  React.useEffect(() => {
    if (!searchQuery) {
      setFilteredWorkers(workers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = workers.filter(
        (worker) =>
          worker.fullName.toLowerCase().includes(query) ||
          worker.email.toLowerCase().includes(query)
      );
      setFilteredWorkers(filtered);
    }
  }, [searchQuery, JSON.stringify(workers)]);

  const renderMyRequest = (req: SwapRequest) => {
    const isRequester = req.requesterId === currentUser?.id;
    const isTarget = req.targetId === currentUser?.id;
    const canCancel = isRequester && ['PENDING', 'ACCEPTED'].includes(req.status);
    const needsMyResponse = isTarget && req.swapType === 'DIRECT_SWAP' && req.status === 'PENDING';

    return (
      <View
        key={req.id}
        className="bg-light-card dark:bg-dark-card rounded-2xl p-4 mb-3 border border-light-border-light dark:border-dark-border-light"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Ionicons
                name={req.swapType === 'GIVE_AWAY' ? 'hand-left-outline' : 'swap-horizontal-outline'}
                size={16}
                color={primaryColor}
              />
            </View>
            <Caption className="font-outfit-semibold">
              {req.swapType === 'GIVE_AWAY' ? 'Give-Away' : 'Direct Swap'}
            </Caption>
          </View>
          <StatusBadge status={req.status} />
        </View>

        {/* Shift info */}
        <ShiftInfo shift={req.requesterShift} label={`${req.requester.fullName}'s Shift`} />

        {req.swapType === 'DIRECT_SWAP' && req.targetShift && (
          <View className="mt-2">
            <ShiftInfo shift={req.targetShift} label={`${req.target?.fullName || 'Target'}'s Shift`} />
          </View>
        )}

        {/* Target worker info for give-away */}
        {req.swapType === 'GIVE_AWAY' && req.target && (
          <View className="flex-row items-center mt-2 gap-1.5">
            <Ionicons name="person-outline" size={14} color="#6B7280" />
            <Caption color="secondary">Claimed by {req.target.fullName}</Caption>
          </View>
        )}

        {/* Admin note */}
        {req.adminNote && (
          <View className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-3 py-2">
            <Caption style={{ color: '#D97706' }}>Admin: {req.adminNote}</Caption>
          </View>
        )}

        {/* Actions */}
        {needsMyResponse && (
          <View className="flex-row gap-2 mt-3">
            <TouchableOpacity
              className="flex-1 py-2.5 rounded-xl items-center border"
              style={{ borderColor: '#EF4444' }}
              onPress={() => handleRespond(req, false)}
              disabled={actingId === req.id}
            >
              <Caption style={{ color: '#EF4444' }} className="font-outfit-semibold">
                Decline
              </Caption>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-2.5 rounded-xl items-center"
              style={{ backgroundColor: primaryColor, opacity: actingId === req.id ? 0.6 : 1 }}
              onPress={() => handleRespond(req, true)}
              disabled={actingId === req.id}
            >
              {actingId === req.id ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Caption style={{ color: '#FFF' }} className="font-outfit-semibold">Accept</Caption>
              )}
            </TouchableOpacity>
          </View>
        )}

        {canCancel && !needsMyResponse && req.requesterId === req.requester.id && (
          <TouchableOpacity
            className="mt-3 py-2.5 rounded-xl items-center border border-light-border-light dark:border-dark-border-light"
            onPress={() => handleCancel(req)}
            disabled={actingId === req.id}
          >
            <Caption color="secondary" className="font-outfit-semibold">Cancel Request</Caption>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderGiveAway = (req: SwapRequest) => (
    <View
      key={req.id}
      className="bg-light-card dark:bg-dark-card rounded-2xl p-4 mb-3 border border-light-border-light dark:border-dark-border-light"
    >
      {/* Posted by */}
      <View className="flex-row items-center gap-2 mb-3">
        <View
          className="w-8 h-8 rounded-full items-center justify-center"
          style={{ backgroundColor: '#FEF3C720' }}
        >
          <Ionicons name="hand-left-outline" size={16} color="#D97706" />
        </View>
        <View>
          <Caption className="font-outfit-semibold">{req.requester.fullName}</Caption>
          <Caption color="muted" style={{ fontSize: 10 }}>
            Posted {new Date(req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </Caption>
        </View>
      </View>

      {/* Shift details */}
      <View className="flex-row items-center gap-1.5 mb-1">
        <Ionicons name="briefcase-outline" size={15} color={primaryColor} />
        <Body className="font-outfit-semibold flex-1">{req.requesterShift.title}</Body>
        {(req.requesterShift.payRate || req.requesterShift.hourlyRate) && (
          <Caption style={{ color: primaryColor }} className="font-outfit-semibold">
            £{Number(req.requesterShift.payRate || req.requesterShift.hourlyRate).toFixed(2)}/hr
          </Caption>
        )}
      </View>

      <View className="flex-row items-center gap-1 mb-1">
        <Ionicons name="calendar-outline" size={14} color="#6B7280" />
        <Caption color="secondary">
          {formatDate(req.requesterShift.startAt)}, {formatTime(req.requesterShift.startAt)} – {formatTime(req.requesterShift.endAt)}
        </Caption>
      </View>

      {req.requesterShift.siteLocation && (
        <View className="flex-row items-center gap-1 mb-1">
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Caption color="secondary">{req.requesterShift.siteLocation}</Caption>
        </View>
      )}

      {req.requesterNote && (
        <View className="mt-2 bg-light-background-secondary dark:bg-dark-background-secondary rounded-lg px-3 py-2">
          <Caption color="secondary" style={{ fontStyle: 'italic' }}>"{req.requesterNote}"</Caption>
        </View>
      )}

      <TouchableOpacity
        className="mt-3 py-3 rounded-xl items-center justify-center flex-row"
        style={{ backgroundColor: primaryColor, opacity: actingId === req.id ? 0.6 : 1 }}
        onPress={() => handleClaim(req)}
        disabled={actingId === req.id}
        activeOpacity={0.8}
      >
        {actingId === req.id ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <>
            <Ionicons name="checkmark-circle-outline" size={17} color="#FFF" />
            <Caption style={{ color: '#FFF' }} className="ml-1.5 font-outfit-semibold">
              Cover This Shift
            </Caption>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const availableCount = availableGiveAways.length;

  return (
    <View
      className="flex-1 bg-light-background-primary dark:bg-dark-background-primary"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000035'} />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <H2>Shift Swaps</H2>
        </View>
      </View>

      {/* Tab Toggle */}
      <View className="px-5 pb-3">
        <View className="flex-row bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl p-1">
          <TouchableOpacity
            className="flex-1 py-2 rounded-lg items-center justify-center"
            style={{ backgroundColor: activeTab === 'my' ? primaryColor : 'transparent' }}
            onPress={() => setActiveTab('my')}
            activeOpacity={0.8}
          >
            <Caption
              className="font-outfit-semibold"
              style={{ color: activeTab === 'my' ? '#FFF' : '#6B7280' }}
            >
              My Requests
            </Caption>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-2 rounded-lg items-center justify-center flex-row"
            style={{ backgroundColor: activeTab === 'available' ? primaryColor : 'transparent' }}
            onPress={() => setActiveTab('available')}
            activeOpacity={0.8}
          >
            <Caption
              className="font-outfit-semibold"
              style={{ color: activeTab === 'available' ? '#FFF' : '#6B7280' }}
            >
              Available Cover
            </Caption>
            {availableCount > 0 && (
              <View
                className="ml-1.5 rounded-full w-5 h-5 items-center justify-center"
                style={{
                  backgroundColor:
                    activeTab === 'available' ? 'rgba(255,255,255,0.3)' : primaryColor,
                }}
              >
                <Caption style={{ color: '#FFF', fontSize: 10 }} className="font-outfit-bold">
                  {availableCount > 99 ? '99+' : String(availableCount)}
                </Caption>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Info banner */}
      <View className="mx-5 mb-3 flex-row items-start bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3">
        <Ionicons name="information-circle-outline" size={17} color="#3B82F6" style={{ marginTop: 1 }} />
        <Caption className="ml-2 flex-1" style={{ color: '#3B82F6' }}>
          {activeTab === 'my'
            ? 'Your swap requests and any direct swap requests from colleagues.'
            : 'Colleagues who need cover. Claim a shift to take it over — pending admin approval.'}
        </Caption>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        }
      >
        {isLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        ) : activeTab === 'my' ? (
          myRequests.length === 0 ? (
            <View className="items-center py-12">
              <Ionicons name="swap-horizontal-outline" size={48} color="#9CA3AF" />
              <Body color="secondary" className="mt-3">No swap requests yet</Body>
              <Caption color="muted" className="mt-1 text-center px-8">
                Open a shift from your schedule and tap "Request Swap" to post one
              </Caption>
            </View>
          ) : (
            myRequests.map(renderMyRequest)
          )
        ) : availableGiveAways.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons name="hand-left-outline" size={48} color="#9CA3AF" />
            <Body color="secondary" className="mt-3">No shifts available to cover</Body>
            <Caption color="muted" className="mt-1">Pull down to check for new postings</Caption>
          </View>
        ) : (
          availableGiveAways.map(renderGiveAway)
        )}
        <View className="h-8" />
      </ScrollView>

      {/* Create Swap Request Modal */}
      <Modal
        visible={showCreateForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateForm(false)}
      >
        <View
          className="flex-1 bg-light-background-primary dark:bg-dark-background-primary"
          style={{ paddingTop: insets.top }}
        >
          {/* Header */}
          <View className="flex-row items-center px-5 py-4 border-b border-light-border-light dark:border-dark-border-light">
            <TouchableOpacity onPress={() => setShowCreateForm(false)} className="mr-4">
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <View className="flex-1 items-center mr-10">
              <H2>Create Swap Request</H2>
            </View>
          </View>

          <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
            <View className="py-6">
              <H3 className="mb-4">Swap Type</H3>

              {/* GIVE_AWAY Option */}
              <TouchableOpacity
                className={`p-4 rounded-xl border-2 mb-3 ${
                  swapType === 'GIVE_AWAY'
                    ? 'border-primary bg-primary/5'
                    : 'border-light-border-light dark:border-dark-border-light'
                }`}
                onPress={() => setSwapType('GIVE_AWAY')}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center mb-2">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: swapType === 'GIVE_AWAY' ? primaryColor : '#F3F4F6' }}
                  >
                    <Ionicons
                      name="hand-left-outline"
                      size={20}
                      color={swapType === 'GIVE_AWAY' ? '#FFF' : '#6B7280'}
                    />
                  </View>
                  <View className="flex-1">
                    <Body className="font-outfit-semibold">Give Away Shift</Body>
                    <Caption color="secondary">
                      Make your shift available for others to claim
                    </Caption>
                  </View>
                  {swapType === 'GIVE_AWAY' && (
                    <Ionicons name="checkmark-circle" size={24} color={primaryColor} />
                  )}
                </View>
              </TouchableOpacity>

              {/* DIRECT_SWAP Option */}
              <TouchableOpacity
                className={`p-4 rounded-xl border-2 mb-4 ${
                  swapType === 'DIRECT_SWAP'
                    ? 'border-primary bg-primary/5'
                    : 'border-light-border-light dark:border-dark-border-light'
                }`}
                onPress={() => {
                  setSwapType('DIRECT_SWAP');
                  setTargetWorkerId(null);
                  setTargetShiftId(null);
                }}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center mb-2">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: swapType === 'DIRECT_SWAP' ? primaryColor : '#F3F4F6' }}
                  >
                    <Ionicons
                      name="swap-horizontal-outline"
                      size={20}
                      color={swapType === 'DIRECT_SWAP' ? '#FFF' : '#6B7280'}
                    />
                  </View>
                  <View className="flex-1">
                    <Body className="font-outfit-semibold">Direct Swap</Body>
                    <Caption color="secondary">
                      Exchange with a specific colleague's shift
                    </Caption>
                  </View>
                  {swapType === 'DIRECT_SWAP' && (
                    <Ionicons name="checkmark-circle" size={24} color={primaryColor} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Worker Selection (for DIRECT_SWAP) */}
              {swapType === 'DIRECT_SWAP' && (
                <>
                  <H3 className="mb-3">Select Worker</H3>
                  <TouchableOpacity
                    className="p-4 rounded-xl border border-light-border-light dark:border-dark-border-light bg-light-background-secondary dark:bg-dark-background-secondary"
                    onPress={() => setShowWorkerModal(true)}
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-center justify-between">
                      <Caption
                        className={
                          targetWorkerId
                            ? 'text-light-text-primary dark:text-dark-text-primary font-outfit-semibold'
                            : 'text-gray-400'
                        }
                      >
                        {targetWorkerId
                          ? workers.find((w) => w.id === targetWorkerId)?.fullName || 'Selected worker'
                          : 'Tap to select a worker'}
                      </Caption>
                      <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                    </View>
                  </TouchableOpacity>

                  {/* Shift Selection (for DIRECT_SWAP) */}
                  {targetWorkerId && (
                    <>
                      <H3 className="mb-3">Select Their Shift</H3>
                      {loadingShifts ? (
                        <View className="items-center py-4">
                          <ActivityIndicator size="small" color={primaryColor} />
                        </View>
                      ) : targetShifts.length === 0 ? (
                        <View className="items-center py-4">
                          <Caption color="secondary">No future shifts available</Caption>
                        </View>
                      ) : (
                        <ScrollView showsVerticalScrollIndicator={false} className="max-h-40 mb-4">
                          {targetShifts.map((shift) => (
                            <TouchableOpacity
                              key={shift.id}
                              className={`p-3 rounded-xl border mb-2 ${
                                targetShiftId === shift.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-light-border-light dark:border-dark-border-light'
                              }`}
                              onPress={() => setTargetShiftId(shift.id)}
                              activeOpacity={0.8}
                            >
                              <Body className="font-outfit-semibold">{shift.title}</Body>
                              <Caption color="secondary">
                                {formatDate(shift.startAt)} · {formatTime(shift.startAt)} - {formatTime(shift.endAt)}
                              </Caption>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      )}
                    </>
                  )}
                </>
              )}

              <H3 className="mb-4">Note (Optional)</H3>
              <Input
                placeholder="Add a note explaining why you need to swap..."
                multiline
                numberOfLines={4}
                value={requesterNote}
                onChangeText={setRequesterNote}
              />
            </View>
            <View className="pb-8" />
          </ScrollView>

          {/* Submit Button */}
          <View className="px-5 pb-8 pt-3 bg-light-background-primary dark:bg-dark-background-primary border-t border-light-border-light dark:border-dark-border-light">
            <Button onPress={handleCreateSwapRequest} loading={isCreating}>
              Create Request
            </Button>
          </View>
        </View>
      </Modal>

      {/* Worker Selection Modal */}
      <Modal
        visible={showWorkerModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWorkerModal(false)}
      >
        <View
          className="flex-1 bg-light-background-primary dark:bg-dark-background-primary"
          style={{ paddingTop: insets.top }}
        >
          {/* Header */}
          <View className="flex-row items-center px-5 py-4 border-b border-light-border-light dark:border-dark-border-light">
            <TouchableOpacity onPress={() => setShowWorkerModal(false)} className="mr-4">
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <View className="flex-1 items-center mr-10">
              <H2>Select Worker</H2>
            </View>
          </View>

          {/* Search Input */}
          <View className="px-5 py-4">
            <Input
              placeholder="Search by name or email"
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={<Ionicons name="search" size={20} color="#9CA3AF" />}
              rightIcon={searchQuery.length > 0 ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ) : undefined}
              containerClassName="mb-0"
            />
          </View>

          {/* Worker List */}
          <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
            {loadingWorkers ? (
              <View className="items-center py-12">
                <ActivityIndicator size="large" color={primaryColor} />
              </View>
            ) : filteredWorkers.length === 0 ? (
              <View className="items-center py-12">
                <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                <Body color="secondary" className="mt-3">No workers found</Body>
                <Caption color="muted" className="mt-1">
                  {searchQuery ? 'Try a different search term' : 'No workers available in your organization'}
                </Caption>
              </View>
            ) : (
              filteredWorkers.map((worker) => (
                <TouchableOpacity
                  key={worker.id}
                  className={`p-4 rounded-xl border mb-3 ${
                    targetWorkerId === worker.id
                      ? 'border-primary bg-primary/5'
                      : 'border-light-border-light dark:border-dark-border-light'
                  }`}
                  onPress={() => {
                    setTargetWorkerId(worker.id);
                    setShowWorkerModal(false);
                    setSearchQuery('');
                  }}
                  activeOpacity={0.8}
                >
                  <Body className="font-outfit-semibold">{worker.fullName}</Body>
                  <Caption color="secondary">{worker.email}</Caption>
                  {targetWorkerId === worker.id && (
                    <View className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Ionicons name="checkmark-circle" size={24} color={primaryColor} />
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
            <View className="h-8" />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

export default ShiftSwapScreen;
