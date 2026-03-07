import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme } from '../contexts';
import { H2, Body, Caption } from '../components/ui';
import { LANGUAGES, changeLanguage } from '../i18n';

export function LanguageScreen({ navigation }: RootStackScreenProps<'Language'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const handleSelect = async (code: string) => {
    await changeLanguage(code);
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color="#000035" />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <H2>{t('language.title')}</H2>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Caption color="secondary" className="font-outfit-semibold mb-3 mt-2">
          {t('language.selectLanguage')}
        </Caption>

        {LANGUAGES.map((lang) => {
          const isActive = currentLang === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              className="flex-row items-center py-4 border-b"
              style={{ borderBottomColor: '#F1F5F9' }}
              onPress={() => handleSelect(lang.code)}
              activeOpacity={0.6}
            >
              <Body className="text-2xl mr-3">{lang.flag}</Body>
              <View className="flex-1">
                <Body className="font-outfit-semibold">{lang.label}</Body>
                <Caption color="secondary">{lang.nativeLabel}</Caption>
              </View>
              {isActive && (
                <View
                  className="w-6 h-6 rounded-full items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

export default LanguageScreen;
