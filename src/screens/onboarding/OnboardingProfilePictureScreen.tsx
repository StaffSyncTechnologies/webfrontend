import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useOrgTheme, useToast } from '../../contexts';
import { Button, H1, Body, Caption, StepHeader } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import { useWorkerUploadProfilePicMutation } from '../../store/api/authApi';
import { useAppSelector } from '../../store/hooks';
import type { AuthStackScreenProps } from '../../types/navigation';

type Props = AuthStackScreenProps<'OnboardingProfilePicture'>;

export function OnboardingProfilePictureScreen({ navigation }: Props) {
  const { primaryColor, secondaryColor } = useOrgTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { t } = useTranslation();
  const worker = useAppSelector((state) => state.auth.worker);
  const [uploadProfilePic, { isLoading: isUploading }] = useWorkerUploadProfilePicMutation();
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to upload a picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your camera to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleContinue = async () => {
    if (!imageUri) return;
    try {
      const formData = new FormData();
      formData.append('email', worker?.email || '');

      const filename = imageUri.split('/').pop() || 'profile.jpg';
      const match = /\.([\w]+)$/.exec(filename);
      const ext = match ? match[1] : 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

      formData.append('file', {
        uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
        name: filename,
        type: mimeType,
      } as any);

      await uploadProfilePic(formData).unwrap();
      toast.success('Profile picture uploaded');
      navigation.navigate('OnboardingSkills');
    } catch (err: any) {
      console.error('Upload profile pic error:', JSON.stringify(err, null, 2));
      toast.error(err?.data?.error || err?.data?.message || err?.message || 'Failed to upload profile picture');
    }
  };

  const handleSkip = () => {
    navigation.navigate('OnboardingSkills');
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <StepHeader currentStep={2} totalSteps={6} onBack={() => navigation.goBack()} />

      <View className="flex-1 px-6">
        <H1 className="mb-2">{t('onboarding.uploadProfilePicture')}</H1>
        <Body color="secondary" className="mb-8 leading-6">
          {t('onboarding.uploadProfilePictureDesc')}
        </Body>

        {/* Avatar Preview */}
        <View className="items-center mb-8">
          <View className="w-36 h-36 rounded-full bg-gray-200 items-center justify-center overflow-hidden" style={{ borderWidth: 3, borderColor: '#E2E8F0' }}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Ionicons name="person" size={56} color="#9CA3AF" />
            )}
          </View>
          {imageUri && (
            <TouchableOpacity onPress={() => setImageUri(null)} className="mt-3">
              <Caption className="font-outfit-semibold" style={{ color: '#DC2626' }}>{t('onboarding.removePhoto')}</Caption>
            </TouchableOpacity>
          )}
        </View>

        {/* Upload Options */}
        <View className="gap-3">
          <TouchableOpacity
            className="flex-row items-center p-4 rounded-xl"
            style={{ borderWidth: 1, borderColor: '#E2E8F0' }}
            onPress={pickFromGallery}
            activeOpacity={0.7}
          >
            <View className="w-11 h-11 rounded-full items-center justify-center mr-3.5" style={{ backgroundColor: `${primaryColor}15` }}>
              <Ionicons name="images-outline" size={20} color={primaryColor} />
            </View>
            <View className="flex-1">
              <Body className="font-outfit-semibold">{t('onboarding.chooseFromGallery')}</Body>
              <Caption color="secondary">{t('onboarding.selectFromDevice')}</Caption>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center p-4 rounded-xl"
            style={{ borderWidth: 1, borderColor: '#E2E8F0' }}
            onPress={takePhoto}
            activeOpacity={0.7}
          >
            <View className="w-11 h-11 rounded-full items-center justify-center mr-3.5" style={{ backgroundColor: `${primaryColor}15` }}>
              <Ionicons name="camera-outline" size={20} color={primaryColor} />
            </View>
            <View className="flex-1">
              <Body className="font-outfit-semibold">{t('onboarding.takePhoto')}</Body>
              <Caption color="secondary">{t('onboarding.takePhotoDesc')}</Caption>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 pb-4 gap-3">
        <Button onPress={handleContinue} disabled={!imageUri || isUploading}>
          {isUploading ? t('onboarding.uploading') : t('auth.continue')}
        </Button>
        <Button variant="outline" onPress={handleSkip}>
          {t('onboarding.skipForNow')}
        </Button>
      </View>
    </View>
  );
}

export default OnboardingProfilePictureScreen;
