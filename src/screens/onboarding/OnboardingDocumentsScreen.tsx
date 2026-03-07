import React, { useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { useOrgTheme } from '../../contexts';
import { Button, Input, H1, Body, StepHeader } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import type { AuthStackScreenProps } from '../../types/navigation';

type Props = AuthStackScreenProps<'OnboardingDocuments'>;

interface DocEntry {
  id: string;
  title: string;
  file?: { name: string; uri: string; size?: number };
}

export function OnboardingDocumentsScreen({ navigation }: Props) {
  const { primaryColor } = useOrgTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<DocEntry[]>([
    { id: '1', title: '', file: undefined },
  ]);

  const updateTitle = (id: string, title: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, title } : d));
  };

  const pickDocument = async (id: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        if (asset.size && asset.size > 5 * 1024 * 1024) {
          Alert.alert('File too large', 'Maximum file size is 5MB');
          return;
        }
        setDocuments(prev =>
          prev.map(d =>
            d.id === id ? { ...d, file: { name: asset.name, uri: asset.uri, size: asset.size } } : d
          )
        );
      }
    } catch (err) {
      console.error('Document pick error:', err);
    }
  };

  const addMore = () => {
    setDocuments(prev => [
      ...prev,
      { id: String(Date.now()), title: '', file: undefined },
    ]);
  };

  const handleContinue = () => {
    // TODO: Upload documents to backend
    navigation.navigate('OnboardingBankAccount');
  };

  const handleSkip = () => {
    navigation.navigate('OnboardingBankAccount');
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <StepHeader currentStep={4} totalSteps={6} onBack={() => navigation.goBack()} />

      <View className="flex-1 px-6">
        <H1 className="mb-2">{t('onboarding.documentsUpload')}</H1>
        <Body color="secondary" className="mb-6 leading-6">
          {t('onboarding.documentsUploadDesc')}
        </Body>

        {documents.map((doc, index) => (
          <View key={doc.id} className="mb-6">
            <Input
              label={t('onboarding.certificationTitle')}
              placeholder={t('onboarding.enterCertTitle')}
              value={doc.title}
              onChangeText={(t) => updateTitle(doc.id, t)}
            />

            <Body className="font-outfit-medium text-sm mt-4 mb-2" color="secondary">
              {t('onboarding.documentUpload')}
            </Body>
            <View
              className="flex-row items-center rounded-xl border border-light-border-default p-4"
            >
              <View className="w-10 h-10 rounded-full bg-light-background-secondary items-center justify-center mr-3">
                <Body style={{ fontSize: 18, color: '#9CA3AF' }}>☁</Body>
              </View>
              <View className="flex-1">
                {doc.file ? (
                  <Body className="text-sm font-outfit-medium" numberOfLines={1}>
                    {doc.file.name}
                  </Body>
                ) : (
                  <>
                    <Body className="text-sm font-outfit-medium">{t('onboarding.uploadYourDoc')}</Body>
                    <Body className="text-xs" color="muted">{t('onboarding.pdfFormat')}</Body>
                  </>
                )}
              </View>
              <TouchableOpacity
                onPress={() => pickDocument(doc.id)}
                style={{ backgroundColor: primaryColor, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
              >
                <Body className="text-white text-sm font-outfit-semibold">
                  {doc.file ? t('onboarding.change') : t('onboarding.upload')}
                </Body>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add More */}
        <TouchableOpacity onPress={addMore} className="flex-row items-center justify-center py-2">
          <Body style={{ color: primaryColor }} className="font-outfit-semibold">
            {t('onboarding.addMoreDocument')}
          </Body>
        </TouchableOpacity>
      </View>

      <View className="px-6 pb-4">
        <Button onPress={handleContinue}>
          {t('auth.continue')}
        </Button>
        <TouchableOpacity onPress={handleSkip} className="mt-3 py-2">
          <Body className="text-center font-outfit-medium" color="secondary">
            {t('onboarding.skipForLater')}
          </Body>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default OnboardingDocumentsScreen;
