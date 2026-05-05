import React from 'react';
import { View, TouchableOpacity, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts';
import { Card, Body, H3, Caption } from '../../../components/ui';

interface BlockReasonModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectReason: (reason: string) => void;
}

const BLOCK_REASONS = [
  { value: 'NO_SHOW', label: 'No Show', description: 'Worker did not show up for assigned shift' },
  { value: 'THEFT', label: 'Theft', description: 'Worker involved in theft incident' },
  { value: 'FIGHTING', label: 'Fighting', description: 'Worker involved in fighting or violence' },
  { value: 'POOR_BEHAVIOUR', label: 'Poor Behaviour', description: 'Repeated behavioural issues' },
  { value: 'CLIENT_REQUEST', label: 'Client Request', description: 'Client requested to block this worker' },
  { value: 'OTHER', label: 'Other', description: 'Other reason for blocking' },
];

export const BlockReasonModal: React.FC<BlockReasonModalProps> = ({ visible, onClose, onSelectReason }) => {
  const { isDark } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-black/50"
      >
        <View
          className="bg-light-background-primary dark:bg-dark-background-primary rounded-t-3xl p-5"
          style={{ height: '75%' }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <H3>Select Block Reason</H3>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#000'} />
            </TouchableOpacity>
          </View>

          <Caption color="secondary" className="mb-6">
            Select a reason for blocking this worker
          </Caption>

          {/* Reason Options */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {BLOCK_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.value}
                onPress={() => onSelectReason(reason.value)}
                className="mb-3"
              >
                <Card className="p-4 border-2 border-transparent">
                  <View className="flex-row items-start gap-3">
                    <View className="w-10 h-10 rounded-full bg-light-background-secondary dark:bg-dark-background-secondary items-center justify-center flex-shrink-0">
                      <Ionicons name="alert-circle" size={20} color="#EF4444" />
                    </View>
                    <View className="flex-1">
                      <Body className="font-outfit-semibold mb-1">{reason.label}</Body>
                      <Body className="text-xs text-gray-500 dark:text-gray-400">{reason.description}</Body>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={isDark ? '#FFF' : '#374151'} />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View className="h-16" />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
