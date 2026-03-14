import React, { useState } from 'react';
import { View, TouchableOpacity, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme } from '../../contexts';
import { Button, Input, H1, Body, StepHeader, DatePickerModal } from '../../components/ui';
import { useWorkerSaveProfileMutation } from '../../store/api/authApi';
import { useAppSelector } from '../../store/hooks';
import { useToast } from '../../contexts';
import { useTranslation } from 'react-i18next';
import type { AuthStackScreenProps } from '../../types/navigation';

type Props = AuthStackScreenProps<'OnboardingProfile'>;

export function OnboardingProfileScreen({ navigation }: Props) {
  const { primaryColor } = useOrgTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { t } = useTranslation();
  const worker = useAppSelector((state) => state.auth.worker);
  const [saveProfile, { isLoading: isSaving }] = useWorkerSaveProfileMutation();

  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dobDate, setDobDate] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [phone, setPhone] = useState('');
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [niNumber, setNiNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lookingUp, setLookingUp] = useState(false);

  const lookupPostcode = async (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(trimmed)) return;
    setLookingUp(true);
    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(trimmed)}`);
      const json = await res.json();
      if (json.status === 200 && json.result) {
        const r = json.result;
        const parts = [r.ward, r.admin_district, r.region].filter(Boolean);
        setAddress(parts.join(', '));
        setPostcode(trimmed);
        setErrors((prev) => ({ ...prev, address: '', postcode: '' }));
      }
    } catch {
      // Silently fail — user can still type address manually
    } finally {
      setLookingUp(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = t('onboarding.fullNameRequired');
    if (!dateOfBirth.trim()) newErrors.dateOfBirth = t('onboarding.dobRequired');
    if (!phone.trim()) newErrors.phone = t('onboarding.phoneRequired');
    if (!postcode.trim()) newErrors.postcode = t('onboarding.postcodeRequired');
    if (!address.trim()) newErrors.address = t('onboarding.addressRequired');
    if (!niNumber.trim()) newErrors.niNumber = t('onboarding.niRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await saveProfile({
        email: worker?.email || '',
        fullName: fullName.trim(),
        phone: phone.trim(),
        dateOfBirth: dobDate ? dobDate.toISOString() : '',
        address: address.trim(),
        postcode: postcode.trim(),
        niNumber: niNumber.trim().toUpperCase(),
      }).unwrap();
      toast.success('Profile saved');
      navigation.navigate('OnboardingProfilePicture');
    } catch (err: any) {
      console.error('saveProfile error:', JSON.stringify(err, null, 2));
      toast.error(err?.data?.error || err?.data?.message || err?.message || 'Failed to save profile');
    }
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <StepHeader currentStep={1} totalSteps={6} onBack={() => navigation.goBack()} />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <H1 className="mb-2">{t('onboarding.profileDetails')}</H1>
        <Body color="secondary" className="mb-6 leading-6">
          {t('onboarding.profileDetailsDesc')}
        </Body>

        <View className="gap-5">
          <Input
            label={t('onboarding.fullName')}
            placeholder={t('onboarding.enterFullName')}
            value={fullName}
            onChangeText={(t) => { setFullName(t); setErrors({ ...errors, fullName: '' }); }}
            autoComplete="name"
            error={errors.fullName}
            required
          />

          <Input
            label={t('onboarding.dateOfBirth')}
            placeholder={t('onboarding.selectDOB')}
            value={dateOfBirth}
            onPressIn={() => setShowDatePicker(true)}
            showSoftInputOnFocus={false}
            caretHidden
            error={errors.dateOfBirth}
            required
          />

          <DatePickerModal
            visible={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            onConfirm={(date) => {
              const dd = date.getDate().toString().padStart(2, '0');
              const mm = (date.getMonth() + 1).toString().padStart(2, '0');
              const yyyy = date.getFullYear();
              setDobDate(date);
              setDateOfBirth(`${dd}/${mm}/${yyyy}`);
              setErrors({ ...errors, dateOfBirth: '' });
              setShowDatePicker(false);
            }}
            initialDate={dobDate || new Date(2000, 0, 1)}
            maximumDate={new Date()}
          />

          <Input
            label={t('onboarding.phoneNumber')}
            placeholder={t('onboarding.enterPhone')}
            value={phone}
            onChangeText={(t) => { setPhone(t); setErrors({ ...errors, phone: '' }); }}
            keyboardType="phone-pad"
            autoComplete="tel"
            error={errors.phone}
            required
          />

          <Input
            label={t('onboarding.postalCode')}
            placeholder="e.g. SW1A 1AA"
            value={postcode}
            onChangeText={(t) => {
              const upper = t.toUpperCase();
              setPostcode(upper);
              setErrors({ ...errors, postcode: '' });
              lookupPostcode(upper);
            }}
            autoCapitalize="characters"
            autoComplete="postal-code"
            error={errors.postcode}
            rightIcon={lookingUp ? <ActivityIndicator size="small" color={primaryColor} /> : undefined}
            required
          />

          <Input
            label={t('onboarding.residentialAddress')}
            placeholder={t('onboarding.autoFilledPostcode')}
            value={address}
            onChangeText={(t) => { setAddress(t); setErrors({ ...errors, address: '' }); }}
            autoComplete="street-address"
            error={errors.address}
            required
          />

          <Input
            label={t('onboarding.niNumber')}
            placeholder={t('onboarding.enterNI')}
            value={niNumber}
            onChangeText={(t) => { setNiNumber(t.toUpperCase()); setErrors({ ...errors, niNumber: '' }); }}
            autoCapitalize="characters"
            error={errors.niNumber}
            required
          />
        </View>
      </ScrollView>

      <View className="px-6 pb-4">
        <Button onPress={handleSave} disabled={isSaving}>
          {isSaving ? t('onboarding.saving') : t('onboarding.saveAndContinue')}
        </Button>
      </View>
    </View>
  );
}

export default OnboardingProfileScreen;
