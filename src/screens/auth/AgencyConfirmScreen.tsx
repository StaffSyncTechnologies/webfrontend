import React from 'react';
import { View, Image, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme } from '../../contexts';
import { brandColors } from '../../constants/colors';
import { Badge, Button, H1, Body } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import type { AuthStackScreenProps } from '../../types/navigation';
import { buildFileUrl } from '../../utils/buildFileUrl';

type Props = AuthStackScreenProps<'AgencyConfirm'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function AgencyConfirmScreen({ navigation, route }: Props) {
  const { setOrgTheme } = useOrgTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { agency } = route.params;

  const logoUrl = buildFileUrl(agency.logoUrl);
  const coverImageUrl = buildFileUrl(agency.coverImageUrl);
  const primaryColor = agency.primaryColor || brandColors.primary.navy;
  const secondaryColor = agency.secondaryColor || brandColors.primary.blue;

  const handleContinue = () => {
    setOrgTheme({
      organizationId: agency.id,
      organizationName: agency.name,
      logoUrl: logoUrl,
      primaryColor: primaryColor,
      secondaryColor: secondaryColor,
    });

    navigation.navigate('Register', {
      inviteCode: agency.inviteCode,
      agencyId: agency.id,
      agencyName: agency.name,
      primaryColor: agency.primaryColor,
    });
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary">
      {/* Hero Section with Cover Image */}
      <View style={{ height: 280 }}>
        {coverImageUrl ? (
          <ImageBackground
            source={{ uri: coverImageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} />
          </ImageBackground>
        ) : (
          <View style={{ flex: 1, backgroundColor: primaryColor }} />
        )}

        {/* Success Badge - Positioned at top */}
        <View style={{ position: 'absolute', top: insets.top, left: 0, right: 0 }}>
          <View className="items-center mt-2">
            <Badge variant="success" icon="✓">
              {t('auth.codeVerified')}
            </Badge>
          </View>
        </View>

        {/* Logo - Positioned overlapping the hero */}
        <View 
          style={{ 
            position: 'absolute', 
            bottom: -50, 
            left: SCREEN_WIDTH / 2 - 50,
            width: 100,
            height: 100,
            borderRadius: 20,
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <Image
            source={logoUrl 
              ? { uri: logoUrl } 
              : require('../../../assets/staffsync-logo.png')
            }
            style={{ width: 80, height: 80 }}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Content Section */}
      <View className="flex-1 px-6 pt-16">
        {/* Agency Name */}
        <View className="items-center mb-6">
          <H1 className="text-center mb-1">{agency.name}</H1>
          <Body color="secondary" className="text-center">
            {t('auth.recruitmentAgency')}
          </Body>
        </View>

        {/* Welcome Message */}
        <View className="bg-light-background-secondary dark:bg-dark-background-secondary rounded-2xl p-5">
          <Body color="secondary" className="leading-6 text-center">
            {t('auth.agencyConfirmMsg')}
          </Body>
        </View>
      </View>

      {/* Footer */}
      <View className="px-6" style={{ paddingBottom: insets.bottom + 8 }}>
        <Button onPress={handleContinue}>
          {t('auth.continueSetup')}
        </Button>
        <TouchableOpacity
          className="flex-row items-center justify-center mt-4 py-3"
          onPress={() => navigation.goBack()}
        >
          <Body color="secondary">{t('auth.wrongAgency')}</Body>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default AgencyConfirmScreen;
