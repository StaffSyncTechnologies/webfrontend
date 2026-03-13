import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Linking, ScrollView, Platform, Modal, Alert, TextInput, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { H1, H2, Body, Caption, Card } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts';
import { brandColors } from '../../constants/colors';
import type { AuthStackScreenProps } from '../../types/navigation';
import { API_BASE_URL } from '../../services/endpoints';
import { buildFileUrl } from '../../utils/buildFileUrl';

type Props = AuthStackScreenProps<'AgencyContact'>;

export function AgencyContactScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { agency } = route.params;

  const primaryColor = agency.primaryColor || brandColors.primary.navy;
  const hasCoords = agency.latitude != null && agency.longitude != null;

  // Request invite code modal state
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [reqFullName, setReqFullName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitRequest = async () => {
    if (!reqFullName.trim() || !reqEmail.trim()) {
      Alert.alert(t('inviteRequest.error'), t('inviteRequest.fillRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/agencies/invite-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: agency.id,
          fullName: reqFullName.trim(),
          email: reqEmail.trim(),
          phone: reqPhone.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setRequestModalVisible(false);
        Alert.alert(t('inviteRequest.successTitle'), t('inviteRequest.successMessage'));
      } else {
        Alert.alert(t('inviteRequest.error'), json.message || t('inviteRequest.genericError'));
      }
    } catch {
      Alert.alert(t('inviteRequest.error'), t('inviteRequest.genericError'));
    } finally {
      setSubmitting(false);
    }
  };

  const logoUri = buildFileUrl(agency.logoUrl);

  const handleEmail = () => {
    if (!agency.email) return;
    Linking.openURL(`mailto:${agency.email}?subject=${encodeURIComponent(t('agencyContact.emailSubject'))}`);
  };

  const handleCall = () => {
    if (!agency.phone) return;
    Linking.openURL(`tel:${agency.phone}`);
  };

  const handleWebsite = () => {
    if (!agency.website) return;
    const url = agency.website.startsWith('http') ? agency.website : `https://${agency.website}`;
    Linking.openURL(url);
  };

  const handleOpenMaps = () => {
    if (!hasCoords) return;
    const label = encodeURIComponent(agency.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${agency.latitude},${agency.longitude}`,
      android: `geo:${agency.latitude},${agency.longitude}?q=${agency.latitude},${agency.longitude}(${label})`,
    });
    if (url) Linking.openURL(url);
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary">
      {/* Back button */}
      <View
        style={{ position: 'absolute', top: insets.top, left: 0, zIndex: 10 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} className="px-5 py-2">
          <View style={{
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center', alignItems: 'center',
          }}>
            <Body className="text-white text-lg">←</Body>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Map / Hero */}
        {hasCoords ? (
          <View style={{ width: '100%', height: 220 }}>
            <WebView
              style={{ flex: 1 }}
              scrollEnabled={false}
              bounces={false}
              originWhitelist={['*']}
              source={{
                html: `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{margin:0;padding:0;width:100%;height:100%}</style>
</head><body>
<div id="map"></div>
<script>
var map=L.map('map',{zoomControl:false,attributionControl:false,dragging:false,scrollWheelZoom:false,doubleClickZoom:false,touchZoom:false}).setView([${agency.latitude},${agency.longitude}],15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
L.marker([${agency.latitude},${agency.longitude}]).addTo(map);
</script></body></html>`,
              }}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleOpenMaps}
              style={{
                position: 'absolute', bottom: 10, right: 10,
                backgroundColor: 'rgba(255,255,255,0.95)',
                paddingHorizontal: 12, paddingVertical: 6,
                borderRadius: 8,
                shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.15, shadowRadius: 3, elevation: 3,
              }}
            >
              <Caption className="font-outfit-semibold" style={{ color: primaryColor }}>
                {t('agencyContact.tapToOpenMap')}
              </Caption>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ height: 180, backgroundColor: primaryColor }} />
        )}

        {/* Logo overlay */}
        <View className="items-center" style={{ marginTop: -36 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              backgroundColor: '#fff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
              elevation: 6,
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={{ width: 56, height: 56 }} resizeMode="contain" />
            ) : (
              <H1 style={{ color: primaryColor }}>{agency.name.charAt(0).toUpperCase()}</H1>
            )}
          </View>
        </View>

        {/* Agency name + distance */}
        <View className="items-center mt-3 px-6">
          <H1 className="text-center text-xl">{agency.name}</H1>
          {agency.contactName && (
            <Caption color="secondary" className="mt-0.5">{agency.contactName}</Caption>
          )}
          {agency.distance != null && (
            <Caption color="secondary" className="mt-1">
              📍 {agency.distance} {t('nearbyAgencies.milesAway')}
            </Caption>
          )}
        </View>

        {/* Quick action buttons — Call & Mail */}
        <View className="flex-row justify-center mt-5 px-6" style={{ gap: 16 }}>
          {agency.phone && (
            <TouchableOpacity
              onPress={handleCall}
              style={{
                flex: 1,
                backgroundColor: '#10B981',
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              <Body className="text-white text-lg mb-0.5">📞</Body>
              <Body className="text-white font-outfit-semibold text-sm">{t('agencyContact.call')}</Body>
            </TouchableOpacity>
          )}
          {agency.email && (
            <TouchableOpacity
              onPress={handleEmail}
              style={{
                flex: 1,
                backgroundColor: primaryColor,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              <Body className="text-white text-lg mb-0.5">✉️</Body>
              <Body className="text-white font-outfit-semibold text-sm">{t('agencyContact.mail')}</Body>
            </TouchableOpacity>
          )}
          {agency.website && (
            <TouchableOpacity
              onPress={handleWebsite}
              style={{
                flex: 1,
                backgroundColor: '#6366F1',
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              <Body className="text-white text-lg mb-0.5">🌐</Body>
              <Body className="text-white font-outfit-semibold text-sm">{t('agencyContact.website')}</Body>
            </TouchableOpacity>
          )}
        </View>

        {/* Contact Details Card */}
        <View className="px-6 mt-5">
          <Card variant="outlined" padding="lg" className="mb-4">
            <H2 className="text-base mb-4">{t('agencyContact.contactInfo')}</H2>

            {agency.address && (
              <TouchableOpacity className="flex-row items-start mb-4" onPress={handleOpenMaps}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }}>
                  <Body className="text-base">📍</Body>
                </View>
                <View className="flex-1 ml-3">
                  <Caption color="muted">{t('agencyContact.address')}</Caption>
                  <Body className="text-sm mt-0.5">{agency.address}</Body>
                </View>
              </TouchableOpacity>
            )}

            {agency.phone && (
              <TouchableOpacity className="flex-row items-start mb-4" onPress={handleCall}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' }}>
                  <Body className="text-base">📞</Body>
                </View>
                <View className="flex-1 ml-3">
                  <Caption color="muted">{t('agencyContact.phone')}</Caption>
                  <Body className="text-sm mt-0.5 text-primary-blue">{agency.phone}</Body>
                </View>
              </TouchableOpacity>
            )}

            {agency.email && (
              <TouchableOpacity className="flex-row items-start mb-4" onPress={handleEmail}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' }}>
                  <Body className="text-base">✉️</Body>
                </View>
                <View className="flex-1 ml-3">
                  <Caption color="muted">{t('agencyContact.email')}</Caption>
                  <Body className="text-sm mt-0.5 text-primary-blue">{agency.email}</Body>
                </View>
              </TouchableOpacity>
            )}

            {agency.website && (
              <TouchableOpacity className="flex-row items-start" onPress={handleWebsite}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center' }}>
                  <Body className="text-base">🌐</Body>
                </View>
                <View className="flex-1 ml-3">
                  <Caption color="muted">{t('agencyContact.website')}</Caption>
                  <Body className="text-sm mt-0.5 text-primary-blue">{agency.website}</Body>
                </View>
              </TouchableOpacity>
            )}

            {!agency.email && !agency.website && !agency.address && !agency.phone && (
              <Body color="secondary" className="text-sm text-center">
                {t('agencyContact.noContactInfo')}
              </Body>
            )}
          </Card>

          {/* How it works */}
          <Card variant="default" padding="md" className="mb-6 bg-primary-blue/5">
            <Body color="secondary" className="text-sm leading-5 text-center">
              {t('agencyContact.howItWorks')}
            </Body>
          </Card>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="px-6" style={{ paddingBottom: insets.bottom + 8 }}>
        <TouchableOpacity
          onPress={() => {
            setReqFullName('');
            setReqEmail('');
            setReqPhone('');
            setRequestModalVisible(true);
          }}
          style={{
            height: 48,
            borderRadius: 12,
            backgroundColor: brandColors.primary.blue,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Body color="inverse" className="font-outfit-semibold text-base">
            {t('inviteRequest.requestCode')}
          </Body>
        </TouchableOpacity>
        <TouchableOpacity className="py-3" onPress={() => navigation.goBack()}>
          <Body color="secondary" className="text-center">
            ← {t('agencyContact.backToList')}
          </Body>
        </TouchableOpacity>
      </View>

      {/* Request Invite Code Modal */}
      <Modal visible={requestModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View
              style={{
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 24,
                paddingBottom: insets.bottom + 24,
              }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <H1 className="text-lg">{t('inviteRequest.title')}</H1>
                <TouchableOpacity onPress={() => setRequestModalVisible(false)}>
                  <Body className="text-2xl" style={{ color: isDark ? '#D1D5DB' : '#374151' }}>✕</Body>
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center mb-4 pb-4" style={{ borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#E5E7EB' }}>
                <View
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    backgroundColor: primaryColor,
                    justifyContent: 'center', alignItems: 'center',
                  }}
                >
                  {logoUri ? (
                    <Image source={{ uri: logoUri }} style={{ width: 32, height: 32 }} resizeMode="contain" />
                  ) : (
                    <Body color="inverse" className="font-outfit-bold">
                      {agency.name.charAt(0).toUpperCase()}
                    </Body>
                  )}
                </View>
                <View className="ml-3">
                  <Body className="font-outfit-semibold">{agency.name}</Body>
                  {agency.address && (
                    <Caption color="secondary" numberOfLines={1}>{agency.address}</Caption>
                  )}
                </View>
              </View>

              <Caption color="secondary" className="mb-1 font-outfit-semibold">{t('inviteRequest.fullName')} *</Caption>
              <TextInput
                value={reqFullName}
                onChangeText={setReqFullName}
                placeholder={t('inviteRequest.fullNamePlaceholder')}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                autoCapitalize="words"
                style={{
                  height: 44, borderRadius: 10, paddingHorizontal: 14, fontSize: 15, marginBottom: 12,
                  backgroundColor: isDark ? '#111827' : '#F9FAFB',
                  borderWidth: 1, borderColor: isDark ? '#374151' : '#D1D5DB',
                  color: isDark ? '#F9FAFB' : '#111827',
                }}
              />

              <Caption color="secondary" className="mb-1 font-outfit-semibold">{t('inviteRequest.email')} *</Caption>
              <TextInput
                value={reqEmail}
                onChangeText={setReqEmail}
                placeholder={t('inviteRequest.emailPlaceholder')}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  height: 44, borderRadius: 10, paddingHorizontal: 14, fontSize: 15, marginBottom: 12,
                  backgroundColor: isDark ? '#111827' : '#F9FAFB',
                  borderWidth: 1, borderColor: isDark ? '#374151' : '#D1D5DB',
                  color: isDark ? '#F9FAFB' : '#111827',
                }}
              />

              <Caption color="secondary" className="mb-1 font-outfit-semibold">{t('inviteRequest.phone')}</Caption>
              <TextInput
                value={reqPhone}
                onChangeText={setReqPhone}
                placeholder={t('inviteRequest.phonePlaceholder')}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                keyboardType="phone-pad"
                style={{
                  height: 44, borderRadius: 10, paddingHorizontal: 14, fontSize: 15, marginBottom: 20,
                  backgroundColor: isDark ? '#111827' : '#F9FAFB',
                  borderWidth: 1, borderColor: isDark ? '#374151' : '#D1D5DB',
                  color: isDark ? '#F9FAFB' : '#111827',
                }}
              />

              <TouchableOpacity
                onPress={submitRequest}
                disabled={submitting}
                style={{
                  height: 48, borderRadius: 12,
                  backgroundColor: submitting ? '#9CA3AF' : brandColors.primary.blue,
                  justifyContent: 'center', alignItems: 'center',
                }}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Body color="inverse" className="font-outfit-semibold text-base">
                    {t('inviteRequest.submit')}
                  </Body>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

export default AgencyContactScreen;
