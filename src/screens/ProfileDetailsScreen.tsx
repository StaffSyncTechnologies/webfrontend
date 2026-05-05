import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme, useToast, useTheme } from '../contexts';
import { H2, Body, Caption, Button, Input, DatePickerModal } from '../components/ui';
import { AuthenticatedImage } from '../components/ui/AuthenticatedImage';
import { useGetMeQuery, useUpdateMeMutation, useWorkerUploadProfilePicMutation } from '../store/api/authApi';
import { API_BASE_URL, API_BASE } from '../services/endpoints';

function formatDateForDisplay(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const dd = d.getDate().toString().padStart(2, '0');
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function parseDisplayDate(str: string): string | null {
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  const d = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function ProfileDetailsScreen({ navigation }: RootStackScreenProps<'ProfileDetails'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor, secondaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const toast = useToast();
  const { data: meResponse, isLoading: loadingProfile, refetch: refetchMe } = useGetMeQuery();
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();
  const [uploadProfilePic, { isLoading: isUploading }] = useWorkerUploadProfilePicMutation();
  const profile = meResponse?.data;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [dobDate, setDobDate] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      const dobIso = profile.workerProfile?.dateOfBirth;
      setDob(formatDateForDisplay(dobIso));
      if (dobIso) {
        setDobDate(new Date(dobIso));
      }
      setAddress(profile.workerProfile?.address || '');
      setPostcode(profile.workerProfile?.postcode || '');
      setProfilePicUrl(profile.profilePicUrl 
        ? (profile.profilePicUrl.startsWith('http') 
            ? profile.profilePicUrl 
            : `${API_BASE}${profile.profilePicUrl}`)
        : null);
    }
  }, [profile]);

  // Force refetch on component mount to get latest data
  useEffect(() => {
    refetchMe();
  }, [refetchMe]);

  const handleSave = async () => {
    try {
      const body: any = { fullName, phone };
      if (address) body.address = address;
      if (postcode) body.postcode = postcode;
      if (dobDate) body.dateOfBirth = dobDate.toISOString();

      await updateMe(body).unwrap();
      toast.success('Profile updated');
      refetchMe(); // Refresh data after update
      navigation.goBack();
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to update profile');
    }
  };

  const handleChangePicture = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) return;

    const uri = result.assets[0].uri;
    setProfilePicUrl(uri);

    try {
      const formData = new FormData();
      formData.append('email', email);
      const filename = uri.split('/').pop() || 'profile.jpg';
      const ext = filename.split('.').pop() || 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
      formData.append('file', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: filename,
        type: mimeType,
      } as any);
      await uploadProfilePic(formData).unwrap();
      toast.success('Profile picture updated');
      refetchMe(); // Refresh worker data with new profile picture URL
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to upload picture');
    }
  };

  if (loadingProfile) {
    return (
      <View className="flex-1 items-center justify-center bg-light-background-primary dark:bg-dark-background-primary">
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000035'} />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <H2>Profile Details</H2>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View className="items-center pt-4 pb-6">
          <View className="w-24 h-24 rounded-full bg-gray-300 items-center justify-center mb-3 overflow-hidden">
            {profilePicUrl ? (
              <Image 
                source={{ uri: profilePicUrl }} 
                className="w-24 h-24" 
              />
            ) : (
              <Ionicons name="person" size={40} color="#6B7280" />
            )}
          </View>
          <TouchableOpacity onPress={handleChangePicture} disabled={isUploading}>
            <Body className="font-outfit-semibold" style={{ color: secondaryColor || '#38BDF8' }}>
              {isUploading ? 'Uploading...' : 'Change picture'}
            </Body>
          </TouchableOpacity>
        </View>

        <View className="px-5">
          {/* Full Name */}
          <Input
            label="Full Name"
            required
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter full name"
            rightIcon={<Ionicons name="create-outline" size={18} color="#9CA3AF" />}
            containerClassName="mb-5"
          />

          {/* Email (read-only) */}
          <Input
            label="Email"
            value={email}
            editable={false}
            rightIcon={<Ionicons name="lock-closed-outline" size={18} color="#D1D5DB" />}
            containerClassName="mb-5"
          />

          {/* Date of Birth */}
          <Input
            label="Date of Birth"
            required
            value={dob}
            onPressIn={() => setShowDatePicker(true)}
            editable={false}
            placeholder="DD/MM/YYYY"
            rightIcon={<Ionicons name="calendar-outline" size={18} color="#6B7280" />}
            containerClassName="mb-5"
          />

          <DatePickerModal
            visible={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            onConfirm={(date) => {
              const dd = date.getDate().toString().padStart(2, '0');
              const mm = (date.getMonth() + 1).toString().padStart(2, '0');
              const yyyy = date.getFullYear();
              setDobDate(date);
              setDob(`${dd}/${mm}/${yyyy}`);
              setShowDatePicker(false);
            }}
            initialDate={dobDate || new Date(2000, 0, 1)}
            maximumDate={new Date()}
          />

          {/* Phone Number */}
          <Input
            label="Phone Number"
            required
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            rightIcon={<Ionicons name="create-outline" size={18} color="#9CA3AF" />}
            containerClassName="mb-5"
          />

          {/* Residential Address */}
          <Input
            label="Residential Address"
            required
            value={address}
            onChangeText={setAddress}
            placeholder="Enter address"
            rightIcon={<Ionicons name="create-outline" size={18} color="#9CA3AF" />}
            containerClassName="mb-5"
          />

          {/* Postcode */}
          <Input
            label="Postcode"
            value={postcode}
            onChangeText={setPostcode}
            placeholder="Enter postcode"
            autoCapitalize="characters"
            rightIcon={<Ionicons name="create-outline" size={18} color="#9CA3AF" />}
            containerClassName="mb-5"
          />
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Save Button */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-3 bg-light-background-primary dark:bg-dark-background-primary">
        <Button onPress={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save changes'}
        </Button>
      </View>
    </View>
  );
}

export default ProfileDetailsScreen;
