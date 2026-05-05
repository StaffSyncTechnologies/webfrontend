import React, { useState } from 'react';
import { View, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme, useTheme } from '../../../contexts';
import { H2, Body, Caption, Input } from '../../../components/ui';

interface InviteWorkerModalProps {
  visible: boolean;
  onClose: () => void;
  onInvite: (workerData: any) => void;
}

const InviteWorkerModal=({ visible, onClose, onInvite }: InviteWorkerModalProps)=> {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleInvite = () => {
    const workerData = {
      fullName,
      email,
      phone,
    };
    onInvite(workerData);
    handleClose();
  };

  const handleClose = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    onClose();
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
          <H2>Invite Worker</H2>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          <Caption color="secondary" className="mb-6">Add a worker to your organization</Caption>

          {/* Full Name */}
          <View className="mb-4">
            <Caption color="secondary" className="mb-2">Full Name*</Caption>
            <Input
              placeholder="Enter worker's full name"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Email */}
          <View className="mb-4">
            <Caption color="secondary" className="mb-2">Email address</Caption>
            <Input
              placeholder="Enter email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              leftIcon={<Ionicons name="mail-outline" size={20} color="#9CA3AF" />}
            />
          </View>

          {/* Phone */}
          <View className="mb-4">
            <Caption color="secondary" className="mb-2">Phone number</Caption>
            <Input
              placeholder="Enter phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              leftIcon={<Ionicons name="call-outline" size={20} color="#9CA3AF" />}
            />
          </View>

          <View className="h-24" />
        </ScrollView>

        {/* Footer Button */}
        <View className="px-5 py-4 border-t border-light-border-light dark:border-dark-border-light mb-16">
          <TouchableOpacity
            onPress={handleInvite}
            disabled={!fullName}
            className="py-4 rounded-xl"
            style={{
              backgroundColor: fullName ? primaryColor : (isDark ? '#374151' : '#E5E7EB'),
            }}
          >
            <Body className="text-center font-outfit-semibold" style={{ color: fullName ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280') }}>
              Send Invite Code
            </Body>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default InviteWorkerModal;
