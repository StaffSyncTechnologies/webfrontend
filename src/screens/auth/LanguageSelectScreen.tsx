import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { H1, H2, Body, Caption, Button } from '../../components/ui';
import { LANGUAGES, changeLanguage } from '../../i18n';
import type { AuthStackScreenProps } from '../../types/navigation';

type Props = AuthStackScreenProps<'LanguageSelect'>;

export function LanguageSelectScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const handleSelect = async (code: string) => {
    await changeLanguage(code);
  };

  const handleContinue = () => {
    navigation.navigate('InviteCode');
  };

  return (
    <View
      className="flex-1 bg-light-background-primary dark:bg-dark-background-primary"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Logo + Welcome */}
      <View className="items-center pt-12 pb-6 px-6">
        <Image
          source={require('../../../assets/logo.png')}
          className="w-16 h-16 mb-5"
          resizeMode="contain"
        />
        <H1 className="text-center mb-2">{t('languageSelect.welcome')}</H1>
        <Body color="secondary" className="text-center leading-6">
          {t('languageSelect.chooseLanguage')}
        </Body>
      </View>

      {/* Language List */}
      <View className="flex-1 px-6">
        {LANGUAGES.map((lang) => {
          const isActive = currentLang === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              className="flex-row items-center py-3.5 px-4 mb-2 rounded-xl"
              style={{
                borderWidth: 1.5,
                borderColor: isActive ? '#00AFEF' : '#E5E7EB',
                backgroundColor: isActive ? '#00AFEF08' : 'transparent',
              }}
              onPress={() => handleSelect(lang.code)}
              activeOpacity={0.6}
            >
              <Body className="text-2xl mr-3">{lang.flag}</Body>
              <View className="flex-1">
                <Body className="font-outfit-semibold">{lang.label}</Body>
                <Caption color="secondary">{lang.nativeLabel}</Caption>
              </View>
              <View
                className="w-5 h-5 rounded-full items-center justify-center"
                style={{
                  borderWidth: 2,
                  borderColor: isActive ? '#00AFEF' : '#D1D5DB',
                  backgroundColor: isActive ? '#00AFEF' : 'transparent',
                }}
              >
                {isActive && (
                  <View className="w-2 h-2 rounded-full bg-white" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Continue Button */}
      <View className="px-6 pb-4">
        <Button onPress={handleContinue}>
          {t('languageSelect.continue')}
        </Button>
      </View>
    </View>
  );
}

export default LanguageSelectScreen;
