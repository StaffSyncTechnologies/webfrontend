import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts';
import { H3, Body, Caption, Input } from '../../../components/ui';

interface BankAccountModalProps {
  visible: boolean;
  onClose: () => void;
  workerId: string;
  workerName: string;
  hasBankAccount: boolean;
  existingBankAccount?: {
    bankName: string;
    sortCode: string;
    accountNumber: string;
    buildingSocietyRef?: string;
  };
  onSave: (data: {
    bankName: string;
    sortCode: string;
    accountNumber: string;
    buildingSocietyRef?: string;
  }) => Promise<void>;
  onVerify?: () => Promise<void>;
}

export const BankAccountModal=({
  visible,
  onClose,
  workerId,
  workerName,
  hasBankAccount,
  existingBankAccount,
  onSave,
  onVerify,
}: BankAccountModalProps) =>{
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [sortCode, setSortCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [buildingSocietyRef, setBuildingSocietyRef] = useState('');

  useEffect(() => {
    if (existingBankAccount) {
      setAccountHolder(workerName);
      setBankName(existingBankAccount.bankName);
      setSortCode(existingBankAccount.sortCode);
      setAccountNumber(existingBankAccount.accountNumber);
      setBuildingSocietyRef(existingBankAccount.buildingSocietyRef || '');
    } else {
      setAccountHolder(workerName);
      setBankName('');
      setSortCode('');
      setAccountNumber('');
      setBuildingSocietyRef('');
    }
  }, [existingBankAccount, workerName, visible]);

  const formatSortCode = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    if (digits.length >= 6) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 6)}`;
    }
    return digits;
  };

  const handleSortCodeChange = (value: string) => {
    setSortCode(formatSortCode(value));
  };

  const handleAccountNumberChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    setAccountNumber(digits);
  };

  const isFormValid = accountHolder && bankName && sortCode.length === 8 && accountNumber.length === 8;

  const handleSave = async () => {
    if (!isFormValid) return;
    setLoading(true);
    try {
      await onSave({
        bankName,
        sortCode,
        accountNumber,
        buildingSocietyRef: buildingSocietyRef || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save bank account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (onVerify) {
      setLoading(true);
      try {
        await onVerify();
        onClose();
      } catch (error) {
        console.error('Failed to verify bank account:', error);
      } finally {
        setLoading(false);
      }
    }
  };

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
            <H3>{hasBankAccount ? 'Edit' : 'Add'} Bank Details</H3>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#000'} />
            </TouchableOpacity>
          </View>

          <Caption color="secondary" className="mb-6">
            {hasBankAccount ? 'Update' : 'Enter'} bank account details for <Body className="font-semibold">{workerName}</Body>
          </Caption>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Account Holder Name */}
            <View className="mb-4">
              <Caption className="mb-2">Account Holder Name *</Caption>
              <Input
                placeholder="Name as shown on bank account"
                value={accountHolder}
                onChangeText={setAccountHolder}
                editable={false}
              />
            </View>

            {/* Bank Name */}
            <View className="mb-4">
              <Caption className="mb-2">Bank Name *</Caption>
              <Input
                placeholder="e.g. Barclays, HSBC, Lloyds"
                value={bankName}
                onChangeText={setBankName}
              />
            </View>

            {/* Sort Code and Account Number */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Caption className="mb-2">Sort Code *</Caption>
                <Input
                  placeholder="12-34-56"
                  value={sortCode}
                  onChangeText={handleSortCodeChange}
                  maxLength={8}
                  keyboardType="number-pad"
                />
              </View>
              <View className="flex-1">
                <Caption className="mb-2">Account Number *</Caption>
                <Input
                  placeholder="12345678"
                  value={accountNumber}
                  onChangeText={handleAccountNumberChange}
                  maxLength={8}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Building Society Reference */}
            <View className="mb-6">
              <Caption className="mb-2">Building Society Reference (optional)</Caption>
              <Input
                placeholder="If applicable"
                value={buildingSocietyRef}
                onChangeText={setBuildingSocietyRef}
              />
            </View>

            {/* Verify Button (if bank account exists and not verified) */}
            {hasBankAccount && onVerify && (
              <TouchableOpacity
                className="flex-row items-center justify-center p-3 rounded-xl mb-4 border-2"
                style={{ borderColor: '#10B981' }}
                onPress={handleVerify}
                disabled={loading}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                <Body className="ml-2" style={{ color: '#10B981' }}>Verify Bank Account</Body>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Save Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center p-4 rounded-xl mt-4 mb-16"
            style={{ backgroundColor: isDark ? '#3B82F6' : '#000035' }}
            onPress={handleSave}
            disabled={loading || !isFormValid}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Body className="text-white">
                {hasBankAccount ? 'Update Bank Details' : 'Save Bank Details'}
              </Body>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
