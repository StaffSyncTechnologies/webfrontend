import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme, useToast } from '../contexts';
import { H2, Body, Caption, Button } from '../components/ui';
import { useGetMeQuery, useUpdateMeMutation, useWorkerUploadProfilePicMutation } from '../store/api/authApi';

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
  const { secondaryColor, primaryColor } = useOrgTheme();
  const toast = useToast();
  const { data: meResponse, isLoading: loadingProfile } = useGetMeQuery();
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();
  const [uploadProfilePic, { isLoading: isUploading }] = useWorkerUploadProfilePicMutation();
  const profile = meResponse?.data;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setDob(formatDateForDisplay(profile.workerProfile?.dateOfBirth));
      setAddress(profile.workerProfile?.address || '');
      setPostcode(profile.workerProfile?.postcode || '');
      setProfilePicUrl(profile.profilePicUrl || null);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      const body: any = { fullName, phone };
      if (address) body.address = address;
      if (postcode) body.postcode = postcode;
      const parsedDate = parseDisplayDate(dob);
      if (parsedDate) body.dateOfBirth = parsedDate;

      await updateMe(body).unwrap();
      toast.success('Profile updated');
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
          <Ionicons name="chevron-back" size={24} color="#000035" />
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
              <Image source={{ uri: profilePicUrl }} className="w-24 h-24" />
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
          <Body className="font-outfit-semibold mb-2">
            Full Name<Body style={{ color: '#DC2626' }}>*</Body>
          </Body>
          <View
            className="flex-row items-center px-4 py-3.5 rounded-xl mb-5"
            style={{ borderWidth: 1, borderColor: '#E2E8F0' }}
          >
            <TextInput
              className="flex-1 font-outfit text-base"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor="#9CA3AF"
              placeholder="Enter full name"
            />
            <Ionicons name="create-outline" size={18} color="#9CA3AF" />
          </View>

          {/* Email (read-only) */}
          <Body className="font-outfit-semibold mb-2">Email</Body>
          <View
            className="flex-row items-center px-4 py-3.5 rounded-xl mb-5"
            style={{ borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F9FAFB' }}
          >
            <TextInput
              className="flex-1 font-outfit text-base"
              value={email}
              editable={false}
              style={{ color: '#6B7280' }}
            />
            <Ionicons name="lock-closed-outline" size={18} color="#D1D5DB" />
          </View>

          {/* Date of Birth */}
          <Body className="font-outfit-semibold mb-2">
            Date of Birth<Body style={{ color: '#DC2626' }}>*</Body>
          </Body>
          <View
            className="flex-row items-center px-4 py-3.5 rounded-xl mb-5"
            style={{ borderWidth: 1, borderColor: '#E2E8F0' }}
          >
            <TextInput
              className="flex-1 font-outfit text-base"
              value={dob}
              onChangeText={setDob}
              placeholderTextColor="#9CA3AF"
              placeholder="DD/MM/YYYY"
              keyboardType="numbers-and-punctuation"
            />
            <Ionicons name="calendar-outline" size={18} color="#6B7280" />
          </View>

          {/* Phone Number */}
          <Body className="font-outfit-semibold mb-2">
            Phone Number<Body style={{ color: '#DC2626' }}>*</Body>
          </Body>
          <View
            className="flex-row items-center px-4 py-3.5 rounded-xl mb-5"
            style={{ borderWidth: 1, borderColor: '#E2E8F0' }}
          >
            <TextInput
              className="flex-1 font-outfit text-base"
              value={phone}
              onChangeText={setPhone}
              placeholderTextColor="#9CA3AF"
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
            <Ionicons name="create-outline" size={18} color="#9CA3AF" />
          </View>

          {/* Residential Address */}
          <Body className="font-outfit-semibold mb-2">
            Residential Address<Body style={{ color: '#DC2626' }}>*</Body>
          </Body>
          <View
            className="flex-row items-center px-4 py-3.5 rounded-xl mb-5"
            style={{ borderWidth: 1, borderColor: '#E2E8F0' }}
          >
            <TextInput
              className="flex-1 font-outfit text-base"
              value={address}
              onChangeText={setAddress}
              placeholderTextColor="#9CA3AF"
              placeholder="Enter address"
            />
            <Ionicons name="create-outline" size={18} color="#9CA3AF" />
          </View>

          {/* Postcode */}
          <Body className="font-outfit-semibold mb-2">Postcode</Body>
          <View
            className="flex-row items-center px-4 py-3.5 rounded-xl mb-5"
            style={{ borderWidth: 1, borderColor: '#E2E8F0' }}
          >
            <TextInput
              className="flex-1 font-outfit text-base"
              value={postcode}
              onChangeText={setPostcode}
              placeholderTextColor="#9CA3AF"
              placeholder="Enter postcode"
              autoCapitalize="characters"
            />
            <Ionicons name="create-outline" size={18} color="#9CA3AF" />
          </View>
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
