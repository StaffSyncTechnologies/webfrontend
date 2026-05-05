import React, { useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useOrgTheme, useToast } from '../../../../contexts';
import { H3, Body, Caption, Input } from '../../../../components/ui';
import { useAddLocationMutation, useUpdateLocationMutation } from '../../../../store/slices/adminSlices/organizationSlice';

interface Location {
  id?: string;
  name: string;
  address: string;
  isPrimary: boolean;
}

interface AddLocationModalProps {
  open: boolean;
  onClose: () => void;
  editLocation?: Location | null;
}

export function AddLocationModal({ open, onClose, editLocation }: AddLocationModalProps) {
  const { isDark } = useTheme();
  const { primaryColor } = useOrgTheme();
  const { showToast } = useToast();

  const [name, setName]           = useState('');
  const [address, setAddress]     = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [error, setError]         = useState('');

  const [addLocation,    { isLoading: adding   }] = useAddLocationMutation();
  const [updateLocation, { isLoading: updating }] = useUpdateLocationMutation();
  const isLoading = adding || updating;
  const isEdit    = !!editLocation?.id;

  useEffect(() => {
    if (open) {
      setName(editLocation?.name       ?? '');
      setAddress(editLocation?.address ?? '');
      setIsPrimary(editLocation?.isPrimary ?? false);
      setError('');
    }
  }, [open, editLocation]);

  const handleSubmit = async () => {
    setError('');
    if (!name.trim())    { setError('Location name is required.');  return; }
    if (!address.trim()) { setError('Address is required.');         return; }

    try {
      if (isEdit && editLocation?.id) {
        await updateLocation({ locationId: editLocation.id, name: name.trim(), address: address.trim(), isPrimary }).unwrap();
        showToast('Location updated', 'success');
      } else {
        await addLocation({ name: name.trim(), address: address.trim(), isPrimary }).unwrap();
        showToast('Location added', 'success');
      }
      onClose();
    } catch (e: any) {
      const msg = e?.data?.message ?? `Failed to ${isEdit ? 'update' : 'add'} location.`;
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const handleClose = () => {
    setName(''); setAddress(''); setIsPrimary(false); setError('');
    onClose();
  };

  const rowBg = isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB';

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-light-background-primary dark:bg-dark-background-primary rounded-t-3xl p-6">

          {/* Header */}
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: primaryColor + '15' }}>
                <Ionicons name={isEdit ? 'create' : 'location'} size={15} color={primaryColor} />
              </View>
              <H3>{isEdit ? 'Edit Location' : 'Add Location'}</H3>
            </View>
            <TouchableOpacity onPress={handleClose} className="w-8 h-8 items-center justify-center rounded-full bg-light-background-secondary dark:bg-dark-background-secondary">
              <Ionicons name="close" size={18} color={isDark ? '#FFFFFF' : '#000035'} />
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error ? (
            <View className="flex-row items-center gap-2 p-3 rounded-xl mb-4" style={{ backgroundColor: '#FEE2E2' }}>
              <Ionicons name="warning-outline" size={15} color="#DC2626" />
              <Caption style={{ color: '#DC2626', fontSize: 12, flex: 1 }}>{error}</Caption>
            </View>
          ) : null}

          {/* Form */}
          <View className="gap-3 mb-5">
            <View>
              <Caption color="secondary" className="mb-1.5 text-xs">Location Name *</Caption>
              <Input
                placeholder="e.g., Head Office"
                value={name}
                onChangeText={setName}
                leftIcon={<Ionicons name="business-outline" size={18} color="#9CA3AF" />}
              />
            </View>
            <View>
              <Caption color="secondary" className="mb-1.5 text-xs">Full Address *</Caption>
              <Input
                placeholder="123 Main Street, London, UK"
                value={address}
                onChangeText={setAddress}
                leftIcon={<Ionicons name="location-outline" size={18} color="#9CA3AF" />}
              />
            </View>

            {/* Primary toggle */}
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 rounded-xl"
              style={{ backgroundColor: rowBg }}
              onPress={() => setIsPrimary(v => !v)}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: isPrimary ? '#D1FAE5' : (isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB') }}>
                  <Ionicons name="star" size={16} color={isPrimary ? '#059669' : '#9CA3AF'} />
                </View>
                <View className="flex-1">
                  <Body className="font-outfit-semibold text-sm">Set as Primary Location</Body>
                  <Caption color="secondary" style={{ fontSize: 11 }}>Default location for shifts and communications</Caption>
                </View>
              </View>
              <View
                className="w-12 h-7 rounded-full p-1"
                style={{ backgroundColor: isPrimary ? '#10B981' : (isDark ? 'rgba(255,255,255,0.15)' : '#E5E7EB') }}
              >
                <View
                  className="w-5 h-5 rounded-full bg-white"
                  style={{ transform: [{ translateX: isPrimary ? 20 : 0 }] }}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 py-4 rounded-xl bg-light-background-secondary dark:bg-dark-background-secondary"
              onPress={handleClose}
              disabled={isLoading}
            >
              <Body className="text-center text-sm">Cancel</Body>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-4 rounded-xl items-center flex-row justify-center gap-2"
              style={{ backgroundColor: primaryColor, opacity: isLoading ? 0.7 : 1 }}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading
                ? <ActivityIndicator size="small" color="#FFF" />
                : <Ionicons name={isEdit ? 'checkmark-circle-outline' : 'add-circle-outline'} size={16} color="#FFF" />}
              <Body className="text-white font-outfit-semibold text-sm">
                {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Location'}
              </Body>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}
