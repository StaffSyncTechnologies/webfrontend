import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabScreenProps } from '../../types/navigation';
import { useOrgTheme, useTheme } from '../../contexts';
import { H2, Body, Caption, ShiftCard, TabScreenHeader, Input } from '../../components/ui';
import {
  useGetShiftsQuery,
  useGetOpenShiftsQuery,
  useClaimShiftMutation,
} from '../../store/api/shiftsApi';
import { useClaimGiveAwayMutation } from '../../store/api/swapApi';
import type { ShiftCardData } from '../../components/ui';
import { useTranslation } from 'react-i18next';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function formatTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m}${ampm}`;
}

function getShiftType(iso: string): string {
  const h = new Date(iso).getHours();
  if (h >= 6 && h < 14) return 'Day shift';
  if (h >= 14 && h < 20) return 'Afternoon shift';
  return 'Night shift';
}

function mapPriority(priority?: string): ShiftCardData['status'] {
  if (priority === 'URGENT') return 'urgent';
  if (priority === 'HIGH') return 'high_pay';
  return undefined;
}

function toShiftCard(s: any): ShiftCardData {
  const startDate = new Date(s.startAt || s.startTime);
  return {
    id: s.id,
    title: s.title || 'Shift',
    location: s.siteLocation || s.clientCompany?.name || 'TBC',
    type: getShiftType(s.startAt || s.startTime),
    time: `${formatTime(s.startAt || s.startTime)} - ${formatTime(s.endAt || s.endTime)}`,
    month: MONTHS[startDate.getMonth()],
    day: startDate.getDate().toString(),
    payRate: s.payRate || s.hourlyRate ? `£${Number(s.payRate || s.hourlyRate).toFixed(2)}/hr` : undefined,
    status: s.isGiveAway ? 'give_away' : mapPriority(s.priority),
    isGiveAway: s.isGiveAway ?? false,
    swapRequestId: s.swapRequestId ?? null,
  };
}

type TabType = 'my' | 'open';

export function ShiftsScreen({ navigation }: MainTabScreenProps<'Shifts'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<TabType>('my');
  const [search, setSearch] = useState('');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const {
    data: myShiftsResponse,
    isLoading: myLoading,
    isFetching: myFetching,
    refetch: refetchMy,
  } = useGetShiftsQuery({});

  const {
    data: openShiftsResponse,
    isLoading: openLoading,
    isFetching: openFetching,
    refetch: refetchOpen,
  } = useGetOpenShiftsQuery();

  const [claimShift] = useClaimShiftMutation();
  const [claimGiveAway] = useClaimGiveAwayMutation();

  const myShifts: ShiftCardData[] = (myShiftsResponse?.data || []).map(toShiftCard);
  const openShifts: ShiftCardData[] = (openShiftsResponse?.data || []).map(toShiftCard);

  const activeShifts = activeTab === 'my' ? myShifts : openShifts;
  const isLoading = activeTab === 'my' ? myLoading : openLoading;
  const isFetching = activeTab === 'my' ? myFetching : openFetching;
  const refetch = activeTab === 'my' ? refetchMy : refetchOpen;

  const filtered = activeShifts.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleClaim = async (shift: ShiftCardData) => {
    Alert.alert(
      shift.isGiveAway ? 'Cover This Shift' : t('shifts.claimShift'),
      shift.isGiveAway
        ? `Take over "${shift.title}" on ${shift.day} ${shift.month}? It is currently held by a colleague who needs cover.`
        : t('shifts.claimConfirm', { title: shift.title }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: shift.isGiveAway ? 'Cover Shift' : t('shifts.claim'),
          onPress: async () => {
            setClaimingId(shift.id);
            try {
              if (shift.isGiveAway && shift.swapRequestId) {
                await claimGiveAway(shift.swapRequestId).unwrap();
              } else {
                await claimShift(shift.id).unwrap();
              }
              Alert.alert(t('shifts.claimSuccess'), t('shifts.claimSuccessMsg'));
              refetchMy();
              refetchOpen();
            } catch (err: any) {
              const msg = err?.data?.message || err?.message || t('common.error');
              Alert.alert(t('shifts.claimFailed'), msg);
            } finally {
              setClaimingId(null);
            }
          },
        },
      ]
    );
  };

  const openShiftCount = openShiftsResponse?.data?.length ?? 0;

  return (
    <View
      className="flex-1 bg-light-background-primary dark:bg-dark-background-primary"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <TabScreenHeader
        title={t('shifts.title')}
        subtitle={activeTab === 'my' ? t('shifts.myShifts') : t('shifts.openShiftsSubtitle')}
        showOrgBranding={true}
      />

      {/* My Shifts / Open Shifts Toggle */}
      <View className="px-5 pb-3">
        <View className="flex-row bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl p-1">
          <TouchableOpacity
            className="flex-1 py-2 rounded-lg items-center justify-center"
            style={{ backgroundColor: activeTab === 'my' ? primaryColor : 'transparent' }}
            onPress={() => { setActiveTab('my'); setSearch(''); }}
            activeOpacity={0.8}
          >
            <Caption
              className="font-outfit-semibold"
              style={{ color: activeTab === 'my' ? '#FFFFFF' : '#6B7280' }}
            >
              {t('shifts.myShifts')}
            </Caption>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-2 rounded-lg items-center justify-center flex-row"
            style={{ backgroundColor: activeTab === 'open' ? primaryColor : 'transparent' }}
            onPress={() => { setActiveTab('open'); setSearch(''); }}
            activeOpacity={0.8}
          >
            <Caption
              className="font-outfit-semibold"
              style={{ color: activeTab === 'open' ? '#FFFFFF' : '#6B7280' }}
            >
              {t('shifts.openShifts')}
            </Caption>
            {openShiftCount > 0 && (
              <View
                className="ml-1.5 rounded-full w-5 h-5 items-center justify-center"
                style={{ backgroundColor: activeTab === 'open' ? 'rgba(255,255,255,0.3)' : primaryColor }}
              >
                <Caption
                  className="font-outfit-bold"
                  style={{ color: '#FFFFFF', fontSize: 10 }}
                >
                  {openShiftCount > 99 ? '99+' : String(openShiftCount)}
                </Caption>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-5 pb-3">
        <Input
          placeholder={t('common.search')}
          value={search}
          onChangeText={setSearch}
          leftIcon={<Ionicons name="search-outline" size={20} color="#9CA3AF" />}
          rightIcon={search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : undefined}
          containerClassName="mb-0"
        />
      </View>

      {/* Open Shifts info banner */}
      {activeTab === 'open' && (
        <View className="mx-5 mb-3 flex-row items-center bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3">
          <Ionicons name="information-circle-outline" size={18} color="#3B82F6" />
          <Caption className="ml-2 flex-1" style={{ color: '#3B82F6' }}>
            Includes admin-posted open shifts and shifts colleagues are giving away. Tap Claim to add one to your schedule.
          </Caption>
        </View>
      )}

      {/* Shift List */}
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
        ) : filtered.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons
              name={activeTab === 'open' ? 'briefcase-outline' : 'calendar-outline'}
              size={48}
              color="#9CA3AF"
            />
            <Body color="secondary" className="mt-3">
              {activeTab === 'open' ? t('shifts.noOpenShifts') : t('shifts.noShifts')}
            </Body>
            <Caption color="muted" className="mt-1">
              {t('shifts.pullToRefresh')}
            </Caption>
          </View>
        ) : (
          filtered.map((shift) =>
            activeTab === 'open' ? (
              <View key={shift.id} className="mb-3">
                <ShiftCard
                  shift={shift}
                  onPress={() =>
                    navigation.getParent()?.navigate('ShiftDetails', { shiftId: shift.id })
                  }
                  onViewDetails={() =>
                    navigation.getParent()?.navigate('ShiftDetails', { shiftId: shift.id })
                  }
                />
                {/* Claim button */}
                <TouchableOpacity
                  className="mx-0 mt-1 py-3 rounded-xl items-center justify-center flex-row"
                  style={{ backgroundColor: primaryColor, opacity: claimingId === shift.id ? 0.6 : 1 }}
                  onPress={() => handleClaim(shift)}
                  disabled={claimingId === shift.id}
                  activeOpacity={0.8}
                >
                  {claimingId === shift.id ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons
                        name={shift.isGiveAway ? 'swap-horizontal-outline' : 'checkmark-circle-outline'}
                        size={18}
                        color="#FFFFFF"
                      />
                      <Caption
                        className="ml-2 font-outfit-semibold"
                        style={{ color: '#FFFFFF' }}
                      >
                        {shift.isGiveAway ? 'Cover Shift' : t('shifts.claim')}
                      </Caption>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <ShiftCard
                key={shift.id}
                shift={shift}
                onPress={() =>
                  navigation.getParent()?.navigate('ShiftDetails', { shiftId: shift.id })
                }
                onViewDetails={() =>
                  navigation.getParent()?.navigate('ShiftDetails', { shiftId: shift.id })
                }
              />
            )
          )
        )}
        <View className="h-5" />
      </ScrollView>
    </View>
  );
}

export default ShiftsScreen;
