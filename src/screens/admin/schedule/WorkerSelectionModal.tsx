import React, { useState } from 'react';
import { View, Modal, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts';
import { H2, Body, Caption } from '../../../components/ui';

interface Worker {
  id: string;
  fullName: string;
  email: string;
}

interface WorkerSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (workers: Worker[]) => void;
  workers: Worker[];
  multiSelect?: boolean;
}

export function WorkerSelectionModal({ visible, onClose, onSelect, workers, multiSelect = false }: WorkerSelectionModalProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkers, setSelectedWorkers] = useState<Set<string>>(new Set());

  const filteredWorkers = workers.filter(worker =>
    worker.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const toggleWorker = (workerId: string) => {
    if (!multiSelect) {
      // Single select: clear all and select only this one
      setSelectedWorkers(new Set([workerId]));
    } else {
      // Multi select: toggle
      setSelectedWorkers(prev => {
        const next = new Set(prev);
        if (next.has(workerId)) {
          next.delete(workerId);
        } else {
          next.add(workerId);
        }
        return next;
      });
    }
  };

  const handleConfirm = () => {
    const selected = workers.filter(w => selectedWorkers.has(w.id));
    onSelect(selected);
    handleClose();
  };

  const handleClose = () => {
    setSelectedWorkers(new Set());
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
    >
      <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4" style={{ paddingTop: insets.top }}>
          <TouchableOpacity onPress={handleClose} className="w-10 h-10 rounded-full bg-light-background-secondary dark:bg-dark-background-secondary items-center justify-center">
            <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000035'} />
          </TouchableOpacity>
          <H2 className="flex-1 ml-3">{multiSelect ? 'Select Workers' : 'Select Worker'}</H2>
          {multiSelect && selectedWorkers.size > 0 && (
            <Body className="text-sm" style={{ color: '#10B981' }}>{selectedWorkers.size} selected</Body>
          )}
        </View>

        {/* Search */}
        <View className="px-5 mb-4">
          <View className="flex-row items-center px-4 py-3 rounded-xl bg-light-background-secondary dark:bg-dark-background-secondary">
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base"
              placeholder="Search by name or email..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Worker List */}
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {filteredWorkers.length === 0 ? (
            <View className="items-center justify-center py-16">
              <Ionicons name="people-outline" size={48} color="#9CA3AF" />
              <Caption color="secondary" className="mt-3">No workers found</Caption>
            </View>
          ) : (
            filteredWorkers.map((worker) => {
              const isSelected = selectedWorkers.has(worker.id);
              return (
                <TouchableOpacity
                  key={worker.id}
                  onPress={() => toggleWorker(worker.id)}
                  className={`flex-row items-center p-4 mb-3 rounded-xl ${isSelected ? 'bg-primary' : 'bg-light-background-secondary dark:bg-dark-background-secondary'}`}
                >
                  {multiSelect && (
                    <View className="w-6 h-6 rounded-md items-center justify-center mr-3 border-2" style={{ borderColor: isSelected ? '#FFFFFF' : '#9CA3AF', backgroundColor: isSelected ? '#FFFFFF' : 'transparent' }}>
                      {isSelected && <Ionicons name="checkmark" size={14} color="#10B981" />}
                    </View>
                  )}
                  <View className={`w-12 h-12 rounded-full items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-primary'}`}>
                    <Body className={`${isSelected ? 'text-white' : 'text-white'} font-outfit-semibold`}>{getInitials(worker.fullName)}</Body>
                  </View>
                  <View className="flex-1 ml-3">
                    <Body className={`font-outfit-semibold ${isSelected ? 'text-white' : ''}`}>{worker.fullName}</Body>
                    <Caption color={isSelected ? 'secondary' : 'secondary'} className="text-sm">{worker.email}</Caption>
                  </View>
                  {!multiSelect && <Ionicons name="chevron-forward" size={20} color={isSelected ? '#FFFFFF' : '#9CA3AF'} />}
                </TouchableOpacity>
              );
            })
          )}
          <View className="h-24" />
        </ScrollView>

        {/* Footer for multi-select */}
        {multiSelect && (
          <View className="px-5 py-4 border-t border-light-border-light dark:border-dark-border-light">
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={selectedWorkers.size === 0}
              className="py-4 rounded-xl"
              style={{
                backgroundColor: selectedWorkers.size > 0 ? '#10B981' : (isDark ? '#374151' : '#E5E7EB'),
              }}
            >
              <Body className="text-center font-outfit-semibold text-white">
                {`Select ${selectedWorkers.size} Worker${selectedWorkers.size !== 1 ? 's' : ''}`}
              </Body>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

export default WorkerSelectionModal;
