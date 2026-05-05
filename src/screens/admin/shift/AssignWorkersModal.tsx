import React, { useState, useEffect } from 'react';
import { View, Modal, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme, useTheme } from '../../../contexts';
import { H2, Body, Caption, Card, Badge, Input } from '../../../components/ui';
import { useGetWorkersQuery } from '../../../store/slices/adminSlices/workerSlice';

interface AssignWorkersModalProps {
  visible: boolean;
  onClose: () => void;
  onAssign: (selectedWorkers: string[]) => void;
  shiftTitle: string;
  alreadyAssigned?: string[];
}

export function AssignWorkersModal({ visible, onClose, onAssign, shiftTitle, alreadyAssigned = [] }: AssignWorkersModalProps) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);

  // Fetch workers from backend
  const { data: workersData, isLoading: workersLoading } = useGetWorkersQuery(
    { status: 'ACTIVE' },
    { skip: !visible }
  );

  // Transform API data to match component structure
  const workers = workersData?.data?.map((worker: any) => ({
    id: worker.id,
    name: worker.fullName,
    email: worker.email,
    skills: worker.skills?.map((s: any) => s.name) || ['No skills listed'],
  })) || [];

  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleWorkerSelection = (workerId: string) => {
    setSelectedWorkers(prev =>
      prev.includes(workerId) ? prev.filter(id => id !== workerId) : [...prev, workerId]
    );
  };

  const isAlreadyAssigned = (workerId: string) => alreadyAssigned.includes(workerId);

  const handleAssign = () => {
    onAssign(selectedWorkers);
    handleClose();
  };

  const handleClose = () => {
    setSelectedWorkers([]);
    setSearchQuery('');
    onClose();
  };

  const formatSkills = (skills: string[]) => {
    if (skills.length <= 3) return skills.join(', ');
    return `${skills.slice(0, 3).join(', ')} +${skills.length - 3} more`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4" style={{ paddingTop: insets.top }}>
          <TouchableOpacity onPress={handleClose} className="w-10 h-10 rounded-full bg-light-background-secondary dark:bg-dark-background-secondary items-center justify-center">
            <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000035'} />
          </TouchableOpacity>
          <View className="flex-1 ml-3">
            <Body className="font-outfit-semibold text-sm">Assign Workers to</Body>
            <Body className="font-outfit-semibold" style={{ color: primaryColor }}>{shiftTitle}</Body>
          </View>
        </View>

        {/* Search */}
        <View className="px-5 mb-4">
          <Input
            placeholder="Search workers by name or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Ionicons name="search-outline" size={20} color="#9CA3AF" />}
          />
        </View>

        {/* Workers Count */}
        <View className="px-5 mb-4">
          <Caption color="secondary">{filteredWorkers.length} workers available</Caption>
        </View>

        {/* Workers List */}
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {workersLoading ? (
            <View className="flex-col items-center justify-center py-12">
              <ActivityIndicator size="large" color={primaryColor} />
              <Caption color="secondary" className="mt-3">Loading workers...</Caption>
            </View>
          ) : (
            filteredWorkers.map((worker) => (
              <Card key={worker.id} className={`p-4 mb-3 ${selectedWorkers.includes(worker.id) ? 'border-2 border-primary-blue' : ''}`}>
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Body className="font-outfit-semibold mb-1">{worker.name}</Body>
                    <Caption color="secondary" className="mb-2">{worker.email}</Caption>
                    <Caption color="secondary" className="text-xs">{formatSkills(worker.skills)}</Caption>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleWorkerSelection(worker.id)}
                    disabled={isAlreadyAssigned(worker.id)}
                    className="w-6 h-6 rounded-full border-2 items-center justify-center"
                    style={{
                      borderColor: selectedWorkers.includes(worker.id) ? primaryColor : (isDark ? '#6B7280' : '#D1D5DB'),
                      backgroundColor: selectedWorkers.includes(worker.id) ? primaryColor : 'transparent',
                      opacity: isAlreadyAssigned(worker.id) ? 0.5 : 1,
                    }}
                  >
                    {selectedWorkers.includes(worker.id) && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>
                {isAlreadyAssigned(worker.id) && (
                  <Badge variant="default" className="self-start mt-2 text-[10px]">Already Assigned</Badge>
                )}
              </Card>
            ))
          )}
          {!workersLoading && filteredWorkers.length === 0 && (
            <View className="flex-col items-center justify-center py-12">
              <Ionicons name="people-outline" size={48} color={isDark ? '#6B7280' : '#D1D5DB'} />
              <Caption color="secondary" className="mt-3">No workers found</Caption>
            </View>
          )}
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
              onPress={handleAssign}
              disabled={selectedWorkers.length === 0}
              className="flex-1 py-4 rounded-xl"
              style={{
                backgroundColor: selectedWorkers.length > 0 ? primaryColor : (isDark ? '#374151' : '#E5E7EB'),
              }}
            >
              <Body className="text-center font-outfit-semibold" style={{ color: selectedWorkers.length > 0 ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280') }}>
                Assign ({selectedWorkers.length})
              </Body>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default AssignWorkersModal;
