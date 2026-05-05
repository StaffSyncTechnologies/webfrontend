import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useOrgTheme, useTheme } from '../../../contexts';
import { H2, H3, Body, Caption, Card, Badge, PaginatedCardList } from '../../../components/ui';
import { BlockReasonModal } from './BlockReasonModal';
import { useGetWorkerByIdQuery, useGetWorkerShiftsQuery, useGetWorkerSkillsQuery, useGetWorkerPayslipsQuery, useGetWorkerHolidaysQuery, useGetWorkerTimesheetQuery, useSuspendWorkerMutation, useReactivateWorkerMutation, useCreateWorkerBlockMutation, useLiftWorkerBlockMutation } from '../../../store/slices/adminSlices/workerSlice';

interface WorkerDetailsScreenProps {
  route?: any;
}

function WorkerDetailsScreen({ route }: WorkerDetailsScreenProps) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const navigation = useNavigation();
  const { params } = useRoute() as any;
  const workerId = params?.workerId;
  const [activeTab, setActiveTab] = useState<'skills' | 'shifts' | 'payslips' | 'holiday' | 'timesheet'>('skills');
  const [showBlockReasonModal, setShowBlockReasonModal] = useState(false);

  // API hooks
  const { data: workerData, isLoading: workerLoading, refetch: refetchWorker } = useGetWorkerByIdQuery(workerId);
  const { data: shiftsData, isLoading: shiftsLoading, refetch: refetchShifts } = useGetWorkerShiftsQuery({ workerId, page: 1, limit: 20 });
  const { data: skillsData, isLoading: skillsLoading, refetch: refetchSkills } = useGetWorkerSkillsQuery(workerId);
  const { data: payslipsData, isLoading: payslipsLoading, refetch: refetchPayslips } = useGetWorkerPayslipsQuery({ workerId, page: 1, limit: 20 });
  const { data: holidaysData, isLoading: holidaysLoading, refetch: refetchHolidays } = useGetWorkerHolidaysQuery({ workerId, page: 1, limit: 20 });
  const { data: timesheetData, isLoading: timesheetLoading, refetch: refetchTimesheet } = useGetWorkerTimesheetQuery({ workerId});

  // Force refetch on mount to get fresh data
  useEffect(() => {
    refetchWorker();
    refetchShifts();
    refetchSkills();
    refetchPayslips();
    refetchHolidays();
    refetchTimesheet();
  }, [workerId, refetchWorker, refetchShifts, refetchSkills, refetchPayslips, refetchHolidays, refetchTimesheet]);

  // Console log data for debugging
  useEffect(() => {
    console.log('WorkerDetailsScreen - workerData:', workerData);
    console.log('WorkerDetailsScreen - shiftsData:', shiftsData);
    console.log('WorkerDetailsScreen - skillsData:', skillsData);
    console.log('WorkerDetailsScreen - payslipsData:', payslipsData);
    console.log('WorkerDetailsScreen - holidaysData:', holidaysData);
    console.log('WorkerDetailsScreen - timesheetData:', timesheetData);
  }, [workerData, shiftsData, skillsData, payslipsData, holidaysData, timesheetData]);

  // Mutation hooks
  const [suspendWorker] = useSuspendWorkerMutation();
  const [reactivateWorker] = useReactivateWorkerMutation();
  const [createWorkerBlock] = useCreateWorkerBlockMutation();
  const [liftWorkerBlock] = useLiftWorkerBlockMutation();

  // Handlers
  const handleSuspendWorker = async () => {
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
            } catch (error) {
              console.error('Failed to suspend worker:', error);
              Alert.alert('Error', 'Failed to suspend worker');
            }
          },
        },
      ],
    );
  };

  const handleBlockWorker = async () => {
    setShowBlockReasonModal(true);
  };

  const handleSelectBlockReason = async (reason: string) => {
    setShowBlockReasonModal(false);

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
              await createWorkerBlock({ workerId, reason, blockType: 'GLOBAL' }).unwrap();
              Alert.alert('Success', 'Worker blocked successfully');
              // Refresh worker data to show updated status
              refetchWorker();
            } catch (error) {
              console.error('Failed to block worker:', error);
              Alert.alert('Error', 'Failed to block worker');
            }
          },
        },
      ],
    );
  };

  const handleUnblockWorker = async () => {
    // Check if worker has active blocks
    const activeBlock = (workerData as any)?.data?.workerBlocks?.find((block: any) => block.status === 'ACTIVE');
    if (!activeBlock) {
      Alert.alert('Error', 'No active block found for this worker');
      return;
    }

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
              // Refresh worker data to show updated status
              refetchWorker();
            } catch (error) {
              console.error('Failed to unblock worker:', error);
              Alert.alert('Error', 'Failed to unblock worker');
            }
          },
        },
      ],
    );
  };

  // Transform worker data
  const worker = (workerData as any)?.data ? {
    id: (workerData as any).data.id,
    name: (workerData as any).data.fullName,
    email: (workerData as any).data.email,
    phone: (workerData as any).data.phone || 'N/A',
    address: (workerData as any).data.workerProfile?.address || 'N/A',
    totalShifts: 0,
    totalEarnings: '£0.00',
    totalHours: '0h 0m',
    workerBlocks: (workerData as any).data.workerBlocks || [],
    attendanceRate: '0%',
    status: (workerData as any).data.status,
  } : null;

  const tabs = [
    { id: 'skills', label: 'Skills and Documents' },
    { id: 'shifts', label: 'Shift History' },
    { id: 'payslips', label: 'Payslips' },
    { id: 'holiday', label: 'Holiday Request' },
    { id: 'timesheet', label: 'Timesheet' },
  ];

  // Transform API data for each tab
  const shifts: any[] = Array.isArray((shiftsData as any)?.data) ? (shiftsData as any).data : [];
  const skills: any[] = Array.isArray((skillsData as any)?.data) ? (skillsData as any).data : [];
  const payslips: any[] = Array.isArray((payslipsData as any)?.data?.clientBreakdown) ? (payslipsData as any).data.clientBreakdown : [];
  const holidays: any[] = Array.isArray((holidaysData as any)?.data?.requests) ? (holidaysData as any).data.requests : [];
  const timesheet: any[] = Array.isArray((timesheetData as any)?.data?.days) ? (timesheetData as any).data.days : [];

  // Console log transformed data for debugging
  console.log('WorkerDetailsScreen - Transformed shifts:', shifts);
  console.log('WorkerDetailsScreen - Transformed skills:', skills);
  console.log('WorkerDetailsScreen - Transformed payslips:', payslips);
  console.log('WorkerDetailsScreen - Transformed holidays:', holidays);
  console.log('WorkerDetailsScreen - Transformed timesheet:', timesheet);

  // Render functions for each tab
  const renderShift = (shift: any) => (
    <Card className="p-4">
      <Body className="font-outfit-semibold text-sm mb-2">{shift.title}</Body>
      <Caption color="secondary" className="text-xs">{shift.date} · {shift.duration}</Caption>
      <Badge variant="default" className="text-[10px] mt-2">{shift.status}</Badge>
    </Card>
  );

  const renderSkill = (skill: any) => (
    <Card className="p-4">
      <Body className="font-outfit-semibold text-sm mb-1">{skill.skill?.name || 'Unknown'}</Body>
      <Caption color="secondary" className="text-xs">{skill.skill?.category || 'Uncategorized'}</Caption>
      <Badge variant="default" className="text-[10px] mt-2">{skill.experienceLevel}</Badge>
    </Card>
  );

  const renderPayslip = (payslip: any) => (
    <Card className="p-4">
      <Body className="font-outfit-semibold text-sm mb-1">{payslip.periodStart} - {payslip.periodEnd}</Body>
      <Caption color="secondary" className="text-xs">{payslip.periodType}</Caption>
      <Badge variant="default" className="text-[10px] mt-2">{payslip.status}</Badge>
    </Card>
  );

  const formatHolidayDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const renderHoliday = (holiday: any) => (
    <Card className="p-4">
      <Body className="font-outfit-semibold text-sm mb-1">{holiday.title || holiday.leaveType}</Body>
      <Caption color="secondary" className="text-xs">{formatHolidayDate(holiday.startDate)} - {formatHolidayDate(holiday.endDate)}</Caption>
      <Badge variant="default" className="text-[10px] mt-2">{holiday.status}</Badge>
    </Card>
  );

  const renderTimesheet = (entry: any) => (
    <Card className="p-4">
      <Body className="font-outfit-semibold text-sm mb-1">{entry.date}</Body>
      <Caption color="secondary" className="text-xs">{entry.hours} · {entry.earnings}</Caption>
    </Card>
  );

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-light-background-secondary dark:bg-dark-background-secondary items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000035'} />
        </TouchableOpacity>
        <View className="flex-1 ml-3">
          <H3>Workers Details</H3>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Worker Details */}
        <View className="px-5 mb-6">
          <H3 className="mb-3">Worker Details</H3>
          {workerLoading ? (
            <View className="flex-col items-center justify-center py-12">
              <ActivityIndicator size="large" color={primaryColor} />
              <Caption color="secondary" className="mt-3">Loading worker details...</Caption>
            </View>
          ) : worker ? (
            <Card className="p-4">
              <Body className="font-outfit-semibold text-xl mb-1">{worker.name}</Body>
              <Caption color="secondary" className="mb-2">{worker.email}</Caption>
              <Caption color="secondary" className="mb-2">{worker.phone}</Caption>
              <Caption color="secondary" className="mb-2">{worker.id}</Caption>
              <Caption color="secondary">{worker.address}</Caption>

              <View className="flex-row gap-2 mt-4">
                <TouchableOpacity className="flex-1 flex-row items-center justify-center py-3 rounded-xl" style={{ backgroundColor: primaryColor }}>
                  <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                  <Body className="ml-2 text-white text-sm">Edit Worker</Body>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center py-3 rounded-xl bg-light-background-secondary dark:bg-dark-background-secondary"
                  onPress={handleSuspendWorker}
                >
                  <Ionicons name="pause-circle-outline" size={16} color={isDark ? '#FFFFFF' : '#000035'} />
                  <Body className="ml-2 text-sm">Suspend</Body>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
                  style={{ backgroundColor: worker?.workerBlocks?.length > 0 ? '#10B981' : '#EF4444' }}
                  onPress={worker?.workerBlocks?.length > 0 ? handleUnblockWorker : handleBlockWorker}
                >
                  <Ionicons name={worker?.workerBlocks?.length > 0 ? 'person-add-outline' : 'person-remove-outline'} size={16} color="#FFFFFF" />
                  <Body className="ml-2 text-white text-sm">{worker?.workerBlocks?.length > 0 ? 'Unblock' : 'Block'}</Body>
                </TouchableOpacity>
              </View>
            </Card>
          ) : null}
        </View>

        {/* Stats */}
        <View className="px-5 mb-6">
          <View className="flex-row flex-wrap gap-3">
            <Card className="flex-1 min-w-[45%] p-4">
              <H3 className="text-2xl">{worker?.totalShifts || 0}</H3>
              <Caption color="secondary">Total Shifts</Caption>
            </Card>
            <Card className="flex-1 min-w-[45%] p-4">
              <H3 className="text-2xl">{worker?.totalEarnings || '£0.00'}</H3>
              <Caption color="secondary">Total Earnings</Caption>
            </Card>
            <Card className="flex-1 min-w-[45%] p-4">
              <H3 className="text-2xl">{worker?.totalHours || '0h 0m'}</H3>
              <Caption color="secondary">Total Hours</Caption>
            </Card>
            <Card className="flex-1 min-w-[45%] p-4">
              <H3 className="text-2xl">{worker?.attendanceRate || '0%'}</H3>
              <Caption color="secondary">Attendance Rate</Caption>
            </Card>
          </View>
        </View>

        {/* Tabs */}
        <View className="px-5 mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id as any)}
                  className="px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: activeTab === tab.id ? primaryColor : (isDark ? '#374151' : '#E5E7EB'),
                  }}
                >
                  <Body
                    className="text-xs"
                    style={{ color: activeTab === tab.id ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280') }}
                  >
                    {tab.label}
                  </Body>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Content based on active tab */}
        <View className="px-5 mb-6">
          {activeTab === 'shifts' && (
            <PaginatedCardList
              data={shifts}
              defaultPageSize={5}
              pageSizeOptions={[5, 10, 20]}
              renderItem={renderShift}
              searchKeys={['title', 'date']}
              searchPlaceholder="Search shifts..."
              sectionLabel="Shifts"
              emptyTitle="No shifts found"
              emptySubtitle="This worker has no shift history yet"
              className="mb-6"
            />
          )}

          {activeTab === 'skills' && (
            <PaginatedCardList
              data={skills}
              defaultPageSize={5}
              pageSizeOptions={[5, 10, 20]}
              renderItem={renderSkill}
              searchKeys={['name', 'category']}
              searchPlaceholder="Search skills..."
              sectionLabel="Skills"
              emptyTitle="No skills found"
              emptySubtitle="No skills or documents uploaded yet"
              className="mb-6"
            />
          )}

          {activeTab === 'payslips' && (
            <Card className="p-6 mb-6">
              <H3 className="mb-4">Payslip Summary</H3>
              {(payslipsData as any)?.data ? (
                <View className="gap-4">
                  <View className="flex-row justify-between items-center py-2 border-b border-light-border-light dark:border-dark-border-light">
                    <Caption color="secondary">Period Type</Caption>
                    <Body className="font-semibold">{(payslipsData as any).data.periodType}</Body>
                  </View>
                  <View className="flex-row justify-between items-center py-2 border-b border-light-border-light dark:border-dark-border-light">
                    <Caption color="secondary">Period</Caption>
                    <Body className="font-semibold">
                      {new Date((payslipsData as any).data.periodStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date((payslipsData as any).data.periodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Body>
                  </View>
                  <View className="flex-row justify-between items-center py-2 border-b border-light-border-light dark:border-dark-border-light">
                    <Caption color="secondary">Total Hours</Caption>
                    <Body className="font-semibold">{(payslipsData as any).data.summary.totalHours}h</Body>
                  </View>
                  <View className="flex-row justify-between items-center py-2 border-b border-light-border-light dark:border-dark-border-light">
                    <Caption color="secondary">Total Shifts</Caption>
                    <Body className="font-semibold">{(payslipsData as any).data.summary.totalShifts}</Body>
                  </View>
                  <View className="flex-row justify-between items-center py-2 border-b border-light-border-light dark:border-dark-border-light">
                    <Caption color="secondary">Gross Pay</Caption>
                    <Body className="font-semibold">£{(payslipsData as any).data.summary.grossPay}</Body>
                  </View>
                  <View className="flex-row justify-between items-center py-2">
                    <Caption color="secondary">Approved Shifts</Caption>
                    <Body className="font-semibold">{(payslipsData as any).data.summary.approvedShifts}</Body>
                  </View>
                </View>
              ) : (
                <Caption color="secondary" className="text-center">No payslip data available</Caption>
              )}
            </Card>
          )}

          {activeTab === 'holiday' && (
            <PaginatedCardList
              data={holidays}
              defaultPageSize={5}
              pageSizeOptions={[5, 10, 20]}
              renderItem={renderHoliday}
              searchKeys={['title', 'leaveType', 'startDate', 'endDate']}
              searchPlaceholder="Search holidays..."
              sectionLabel="Holiday Requests"
              emptyTitle="No holiday requests"
              emptySubtitle="No holiday requests for this worker"
              className="mb-6"
            />
          )}

          {activeTab === 'timesheet' && (
            <PaginatedCardList
              data={timesheet}
              defaultPageSize={5}
              pageSizeOptions={[5, 10, 20]}
              renderItem={renderTimesheet}
              searchKeys={['date', 'hours']}
              searchPlaceholder="Search timesheet..."
              sectionLabel="Timesheet"
              emptyTitle="No timesheet entries"
              emptySubtitle="No timesheet entries for this worker"
              className="mb-6"
            />
          )}
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Block Reason Modal */}
      <BlockReasonModal
        visible={showBlockReasonModal}
        onClose={() => setShowBlockReasonModal(false)}
        onSelectReason={handleSelectBlockReason}
      />
    </View>
  );
}

export default WorkerDetailsScreen;
