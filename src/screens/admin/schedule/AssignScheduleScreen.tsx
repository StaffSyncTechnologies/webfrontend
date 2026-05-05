import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme, useTheme, useToast } from '../../../contexts';
import { H2, Body, Caption, Input, DatePickerModal } from '../../../components/ui';
import { useGetWorkersForSwapQuery } from '../../../store/api';
import { useCreateScheduleMutation } from '../../../store/api/scheduleApi';
import { useGetClientsQuery } from '../../../store/slices/adminSlices/organizationSlice';
import TimePickerModal from '../../../components/ui/TimePickerModal';
import WorkerSelectionModal from './WorkerSelectionModal';
import ClientSelectionModal from './ClientSelectionModal';
import type { RootStackScreenProps } from '../../../types/navigation';

export function AssignScheduleScreen({ navigation }: RootStackScreenProps<'AssignSchedule'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const toast = useToast();

  // API hooks
  const { data: workersData } = useGetWorkersForSwapQuery(undefined);
  const { data: clientsData } = useGetClientsQuery(undefined);
  const [createSchedule] = useCreateScheduleMutation();

  const [form, setForm] = useState({
    workerIds: [] as string[],
    clientCompanyId: '',
    locationId: '',
    title: '',
    role: '',
    payRate: '',
    breakMinutes: '30',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [dayTimes, setDayTimes] = useState<Record<string, { startTime: string; endTime: string }>>({});

  // Modal visibility states
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showStartDateModal, setShowStartDateModal] = useState(false);
  const [showEndDateModal, setShowEndDateModal] = useState(false);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editingTimeField, setEditingTimeField] = useState<'start' | 'end'>('start');

  const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const DAY_LABELS: Record<string, string> = { MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat', SUN: 'Sun' };

  // Use API data for workers
  const workers = workersData?.data || [];

  // Use API data for client companies
  const clients = clientsData?.data?.map((client: any) => ({
    id: client.id,
    name: client.name,
    locations: client.locations || [],
  })) || [];

  const toggleDay = (day: string) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        const next = prev.filter(x => x !== day);
        const times = { ...dayTimes };
        delete times[day];
        setDayTimes(times);
        return next;
      }
      setDayTimes(prev => ({ ...prev, [day]: { startTime: '06:00', endTime: '14:00' } }));
      return [...prev, day];
    });
  };

  const updateTime = (day: string, field: 'startTime' | 'endTime', val: string) => {
    setDayTimes(prev => ({ ...prev, [day]: { ...prev[day], [field]: val } }));
  };

  const calcHours = (start: string, end: string): string => {
    const [sh, sm] = start.split(':').map(Number);
    let [eh, em] = end.split(':').map(Number);
    if (eh <= sh) eh += 24;
    return ((eh * 60 + em - sh * 60 - sm) / 60).toFixed(1);
  };

  const totalHrs = selectedDays.reduce((t, d) => {
    if (!dayTimes[d]) return t;
    return t + parseFloat(calcHours(dayTimes[d].startTime, dayTimes[d].endTime));
  }, 0).toFixed(1);

  const handleSave = async () => {
    if (!form.title || selectedDays.length === 0 || !form.startDate || form.workerIds.length === 0) return;

    const data = {
      workerIds: form.workerIds,
      title: form.title,
      clientCompanyId: form.clientCompanyId || undefined,
      locationId: form.locationId || undefined,
      role: form.role || undefined,
      payRate: form.payRate ? parseFloat(form.payRate) : undefined,
      breakMinutes: parseInt(form.breakMinutes),
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      days: selectedDays.map(d => ({ dayOfWeek: d, startTime: dayTimes[d]?.startTime || '06:00', endTime: dayTimes[d]?.endTime || '14:00', breakMinutes: parseInt(form.breakMinutes) })),
      notes: form.notes || undefined,
    };

    try {
      await createSchedule(data).unwrap();
      toast.success('Schedule assigned successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create schedule:', error);
      toast.error('Failed to create schedule');
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  // Modal handlers
  const handleWorkerSelect = (selectedWorkers: any[]) => {
    setForm(f => ({ ...f, workerIds: selectedWorkers.map(w => w.id) }));
    setShowWorkerModal(false);
  };

  const handleClientSelect = (client: any, location?: any) => {
    setForm(f => ({ 
      ...f, 
      clientCompanyId: client.id,
      locationId: location?.id || ''
    }));
    setShowClientModal(false);
  };

  const handleStartDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    setForm(f => ({ ...f, startDate: dateString }));
    setShowStartDateModal(false);
  };

  const handleEndDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    setForm(f => ({ ...f, endDate: dateString }));
    setShowEndDateModal(false);
  };

  const handleTimeEdit = (day: string, field: 'start' | 'end') => {
    setEditingDay(day);
    setEditingTimeField(field);
  };

  const handleTimeSelect = (time: string) => {
    if (editingDay) {
      setDayTimes(prev => ({
        ...prev,
        [editingDay]: {
          ...prev[editingDay],
          [editingTimeField === 'start' ? 'startTime' : 'endTime']: time
        }
      }));
    }
    setEditingDay(null);
  };

  const selectedClient = clients.find(c => c.id === form.clientCompanyId);
  const selectedWorkersList = workers.filter(w => form.workerIds.includes(w.id));

  return (
    <>
      <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4" style={{ paddingTop: insets.top }}>
          <TouchableOpacity onPress={handleClose} className="w-10 h-10 rounded-full bg-light-background-secondary dark:bg-dark-background-secondary items-center justify-center">
            <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000035'} />
          </TouchableOpacity>
          <View className="flex-1 ml-3">
            <H2>Assign Permanent Schedule</H2>
            <Caption color="secondary">This will generate shifts week-by-week automatically</Caption>
          </View>
        </View>

        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {/* Worker */}
          <View className="mb-4">
            <Caption color="secondary" className="mb-2 font-outfit-semibold uppercase text-xs">Workers</Caption>
            <TouchableOpacity
              onPress={() => setShowWorkerModal(true)}
              className="p-3 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary"
            >
              <View className="flex-row items-center justify-between">
                <Body className={selectedWorkersList.length > 0 ? '' : 'text-gray-400'}>
                  {selectedWorkersList.length > 0
                    ? `${selectedWorkersList.length} worker${selectedWorkersList.length !== 1 ? 's' : ''} selected`
                    : 'Select workers…'}
                </Body>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
            {selectedWorkersList.length > 0 && (
              <View className="mt-2 flex-row flex-wrap gap-2">
                {selectedWorkersList.map(w => (
                  <View key={w.id} className="px-3 py-1 rounded-full bg-primary">
                    <Body className="text-white text-xs">{w.fullName}</Body>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Client Company and Location */}
          <View className="mb-4">
            <Caption color="secondary" className="mb-2 font-outfit-semibold uppercase text-xs">Client Company</Caption>
            <TouchableOpacity
              onPress={() => setShowClientModal(true)}
              className="p-3 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary"
            >
              <View className="flex-row items-center justify-between">
                <Body className={selectedClient ? '' : 'text-gray-400'}>
                  {selectedClient ? selectedClient.name : 'Select client…'}
                </Body>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
            {selectedClient && form.locationId && (
              <View className="mt-2">
                <Body className="text-sm text-gray-500">
                  Location: {selectedClient.locations.find((l: any) => l.id === form.locationId)?.name}
                </Body>
              </View>
            )}
          </View>

          {/* Schedule Title and Role */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Caption color="secondary" className="mb-2 font-outfit-semibold uppercase text-xs">Schedule Title</Caption>
              <Input
                placeholder="e.g. Warehouse Days"
                value={form.title}
                onChangeText={value => setForm(f => ({ ...f, title: value }))}
              />
            </View>
            <View className="flex-1">
              <Caption color="secondary" className="mb-2 font-outfit-semibold uppercase text-xs">Role / Position</Caption>
              <Input
                placeholder="e.g. Picker/Packer"
                value={form.role}
                onChangeText={value => setForm(f => ({ ...f, role: value }))}
              />
            </View>
          </View>

          {/* Hourly Pay Rate and Break */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Caption color="secondary" className="mb-2 font-outfit-semibold uppercase text-xs">Hourly Pay Rate (£)</Caption>
              <Input
                placeholder="12.50"
                value={form.payRate}
                onChangeText={value => setForm(f => ({ ...f, payRate: value }))}
                keyboardType="decimal-pad"
              />
            </View>
            <View className="flex-1">
              <Caption color="secondary" className="mb-2 font-outfit-semibold uppercase text-xs">Break (minutes)</Caption>
              <Input
                value={form.breakMinutes}
                onChangeText={value => setForm(f => ({ ...f, breakMinutes: value }))}
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* Start Date and End Date */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Caption color="secondary" className="mb-2 font-outfit-semibold uppercase text-xs">Start Date</Caption>
              <TouchableOpacity
                onPress={() => setShowStartDateModal(true)}
                className="p-3 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary"
              >
                <Body className={form.startDate ? '' : 'text-gray-400'}>
                  {form.startDate || 'dd/mm/yyyy'}
                </Body>
              </TouchableOpacity>
            </View>
            <View className="flex-1">
              <Caption color="secondary" className="mb-2 font-outfit-semibold uppercase text-xs">End Date (blank = indefinite)</Caption>
              <TouchableOpacity
                onPress={() => setShowEndDateModal(true)}
                className="p-3 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary"
              >
                <Body className={form.endDate ? '' : 'text-gray-400'}>
                  {form.endDate || 'dd/mm/yyyy'}
                </Body>
              </TouchableOpacity>
            </View>
          </View>

          {/* Working Days */}
          <View className="mb-4">
            <Caption color="secondary" className="mb-2 font-outfit-semibold uppercase text-xs">Working Days</Caption>
            <View className="flex-row flex-wrap gap-2">
              {DAYS.map(day => (
                <TouchableOpacity
                  key={day}
                  onPress={() => toggleDay(day)}
                  className="w-12 h-12 rounded-lg items-center justify-center"
                  style={{
                    backgroundColor: selectedDays.includes(day) ? primaryColor : (isDark ? '#374151' : '#F1F5F9'),
                  }}
                >
                  <Body
                    className="text-xs font-outfit-semibold"
                    style={{ color: selectedDays.includes(day) ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#64748B') }}
                  >
                    {DAY_LABELS[day]}
                  </Body>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Shift Times */}
          {selectedDays.length > 0 && (
            <View className="mb-4">
              <Caption color="secondary" className="mb-2 font-outfit-semibold uppercase text-xs">Shift Times</Caption>
              <View className="gap-2">
                {selectedDays.map(day => (
                  <View key={day} className="p-3 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary">
                    <View className="flex-row items-center justify-between mb-2">
                      <Body className="text-xs font-outfit-semibold" style={{ color: primaryColor }}>
                        {day}
                      </Body>
                      <Body className="text-xs">
                        {dayTimes[day] ? calcHours(dayTimes[day].startTime, dayTimes[day].endTime) + 'h' : '—'}
                      </Body>
                    </View>
                    <View className="flex-row gap-2 items-center">
                      <TouchableOpacity
                        onPress={() => handleTimeEdit(day, 'start')}
                        className="flex-1 p-2 rounded-lg bg-light-background-primary dark:bg-dark-background-primary"
                      >
                        <Body className="text-xs text-center">
                          {dayTimes[day]?.startTime || '06:00'}
                        </Body>
                      </TouchableOpacity>
                      <Body className="text-xs">-</Body>
                      <TouchableOpacity
                        onPress={() => handleTimeEdit(day, 'end')}
                        className="flex-1 p-2 rounded-lg bg-light-background-primary dark:bg-dark-background-primary"
                      >
                        <Body className="text-xs text-center">
                          {dayTimes[day]?.endTime || '14:00'}
                        </Body>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                <Body className="text-xs text-right mt-2" style={{ color: primaryColor }}>
                  Total: <Body className="font-bold">{totalHrs}h / week</Body>
                </Body>
              </View>
            </View>
          )}

          {/* Internal Notes */}
          <View className="mb-4">
            <Caption color="secondary" className="mb-2 font-outfit-semibold uppercase text-xs">Internal Notes</Caption>
            <Input
              placeholder="Optional notes…"
              value={form.notes}
              onChangeText={value => setForm(f => ({ ...f, notes: value }))}
              multiline
              numberOfLines={3}
            />
          </View>

          <View className="h-24" />
        </ScrollView>

        {/* Footer Buttons */}
        <View className="px-5 py-4 border-t border-light-border-light dark:border-dark-border-light">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleClose}
              className="flex-1 py-4 rounded-xl bg-light-background-secondary dark:bg-dark-background-secondary"
            >
              <Body className="text-center font-outfit-semibold">Cancel</Body>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={!form.title || selectedDays.length === 0 || !form.startDate || form.workerIds.length === 0}
              className="flex-1 py-4 rounded-xl"
              style={{
                backgroundColor: form.title && selectedDays.length > 0 && form.startDate && form.workerIds.length > 0 ? primaryColor : (isDark ? '#374151' : '#E5E7EB'),
              }}
            >
              <Body className="text-center font-outfit-semibold" style={{ color: form.title && selectedDays.length > 0 && form.startDate && form.workerIds.length > 0 ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280') }}>
                Create Schedule
              </Body>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Date Picker Modals */}
      <View style={{ zIndex: 1000 }}>
        <DatePickerModal
          visible={showStartDateModal}
          onClose={() => setShowStartDateModal(false)}
          onConfirm={handleStartDateSelect}
        />

        <DatePickerModal
          visible={showEndDateModal}
          onClose={() => setShowEndDateModal(false)}
          onConfirm={handleEndDateSelect}
        />
      </View>

      {/* Time Picker Modal */}
      <View style={{ zIndex: 1000 }}>
        <TimePickerModal
          visible={editingDay !== null}
          onClose={() => setEditingDay(null)}
          onConfirm={handleTimeSelect}
          value={editingDay && dayTimes[editingDay] ? dayTimes[editingDay][editingTimeField === 'start' ? 'startTime' : 'endTime'] : undefined}
        />
      </View>

      {/* Worker Selection Modal */}
      <WorkerSelectionModal
        visible={showWorkerModal}
        onClose={() => setShowWorkerModal(false)}
        onSelect={handleWorkerSelect}
        workers={workers}
        multiSelect={true}
      />

      {/* Client Selection Modal */}
      <ClientSelectionModal
        visible={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSelect={handleClientSelect}
        clients={clients}
      />
    </>
  );
}

export default AssignScheduleScreen;
