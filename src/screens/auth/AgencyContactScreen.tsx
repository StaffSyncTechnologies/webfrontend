import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Linking, ScrollView, Platform, Modal, Alert, ActivityIndicator, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from '../../shims/webview.shim';
import { H1, H2, Body, Caption, Card, Divider, Input } from '../../components/ui';
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
        headers: { 'Content-Type': 'application/json', 'X-API-Key': process.env.EXPO_PUBLIC_API_KEY || '' },
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

  const handleEmail = async () => {
    if (!agency.email) return;
    const emailUrl = `mailto:${agency.email}?subject=${encodeURIComponent(t('agencyContact.emailSubject'))}`;
    try {
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert('Error', 'Unable to open email client. Please send an email manually to: ' + agency.email);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open email client. Please send an email manually to: ' + agency.email);
    }
  };

  const handleCall = async () => {
    if (!agency.phone) return;
    const phoneUrl = `tel:${agency.phone}`;
    try {
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Unable to make phone call. Please dial manually: ' + agency.phone);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to make phone call. Please dial manually: ' + agency.phone);
    }
  };

  const handleWebsite = async () => {
    if (!agency.website) return;
    const url = agency.website.startsWith('http') ? agency.website : `https://${agency.website}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open website. Please visit manually: ' + url);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open website. Please visit manually: ' + url);
    }
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

  const contactItems = [
    agency.address && { key: 'address', icon: '📍', label: t('agencyContact.address'), value: agency.address, onPress: handleOpenMaps, tint: false },
    agency.email && { key: 'email', icon: '✉️', label: t('agencyContact.email'), value: agency.email, onPress: handleEmail, tint: true },
    agency.phone && { key: 'phone', icon: '📞', label: t('agencyContact.phone'), value: agency.phone, onPress: handleCall, tint: true },
    agency.website && { key: 'website', icon: '🌐', label: t('agencyContact.website'), value: agency.website, onPress: handleWebsite, tint: true },
  ].filter(Boolean) as { key: string; icon: string; label: string; value: string; onPress: () => void; tint: boolean }[];

  const iconBgColors: Record<string, { light: string; dark: string }> = {
    address: { light: '#F3F4F6', dark: '#1F2937' },
    email: { light: '#EEF2FF', dark: '#1E1B4B' },
    phone: { light: '#ECFDF5', dark: '#052E16' },
    website: { light: '#F5F3FF', dark: '#1E1B4B' },
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary">
      {/* Back button */}
      <View style={{ position: 'absolute', top: insets.top + 4, left: 12, zIndex: 10 }}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={s.backBtn}
        >
          <Body className="text-white text-base font-outfit-semibold">←</Body>
        </TouchableOpacity>
      </View>

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        {hasCoords ? (
          <View style={{ width: '100%', height: 230 }}>
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
            {/* Gradient fade at bottom of map */}
            <LinearGradient
              colors={['transparent', isDark ? '#0D0D1A' : '#FFFFFF']}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50 }}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleOpenMaps}
              style={s.mapChip}
            >
              <Caption className="font-outfit-semibold" style={{ color: primaryColor }}>
                {t('agencyContact.tapToOpenMap')}
              </Caption>
            </TouchableOpacity>
          </View>
        ) : (
          <LinearGradient
            colors={[primaryColor, brandColors.primary.navy]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ height: 200 }}
          />
        )}

        {/* Logo overlay */}
        <View className="items-center" style={{ marginTop: -40 }}>
          <View style={[s.logoBorder, { borderColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}>
            <View style={[s.logoInner, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}> 
              {logoUri ? (
                <Image source={{ uri: logoUri }} style={{ width: 52, height: 52 }} resizeMode="contain" />
              ) : (
                <LinearGradient
                  colors={[primaryColor, brandColors.primary.navy]}
                  style={s.logoPlaceholder}
                >
                  <H1 className="text-white text-2xl">{agency.name.charAt(0).toUpperCase()}</H1>
                </LinearGradient>
              )}
            </View>
          </View>
        </View>

        {/* Agency name + meta */}
        <View className="items-center mt-3 px-6">
          <H1 className="text-center text-xl">{agency.name}</H1>
          {agency.contactName && (
            <Caption color="secondary" className="mt-1">{agency.contactName}</Caption>
          )}
          {agency.distance != null && (
            <View style={s.distancePill}>
              <Caption className="text-xs" style={{ color: primaryColor }}>
                📍 {agency.distance} {t('nearbyAgencies.milesAway')}
              </Caption>
            </View>
          )}
        </View>

        {/* Quick action buttons */}
        <View className="flex-row justify-center mt-5 px-6" style={{ gap: 12 }}>
          {agency.phone && (
            <TouchableOpacity activeOpacity={0.8} onPress={handleCall} style={[s.actionBtn, { backgroundColor: '#10B981' }]}>
              <View style={s.actionIconWrap}>
                <Body className="text-base">📞</Body>
              </View>
              <Body className="text-white font-outfit-semibold text-sm mt-1">{t('agencyContact.call')}</Body>
            </TouchableOpacity>
          )}
          {agency.email && (
            <TouchableOpacity activeOpacity={0.8} onPress={handleEmail} style={[s.actionBtn, { backgroundColor: primaryColor }]}>
              <View style={s.actionIconWrap}>
                <Body className="text-base">✉️</Body>
              </View>
              <Body className="text-white font-outfit-semibold text-sm mt-1">{t('agencyContact.mail')}</Body>
            </TouchableOpacity>
          )}
          {agency.website && (
            <TouchableOpacity activeOpacity={0.8} onPress={handleWebsite} style={[s.actionBtn, { backgroundColor: '#6366F1' }]}>
              <View style={s.actionIconWrap}>
                <Body className="text-base">🌐</Body>
              </View>
              <Body className="text-white font-outfit-semibold text-sm mt-1">{t('agencyContact.website')}</Body>
            </TouchableOpacity>
          )}
        </View>

        {/* Contact Details Card */}
        <View className="px-6 mt-6">
          <Card variant="elevated" padding="lg" className="mb-4">
            <H2 className="text-base mb-1">{t('agencyContact.contactInfo')}</H2>
            <Divider className="my-3" />

            {contactItems.map((item, idx) => (
              <React.Fragment key={item.key}>
                <TouchableOpacity className="flex-row items-center py-3" onPress={item.onPress} activeOpacity={0.6}>
                  <View style={[s.contactIcon, { backgroundColor: isDark ? iconBgColors[item.key].dark : iconBgColors[item.key].light }]}>
                    <Body className="text-base">{item.icon}</Body>
                  </View>
                  <View className="flex-1 ml-3">
                    <Caption color="muted" className="text-xs">{item.label}</Caption>
                    <Body className={`text-sm mt-0.5 ${item.tint ? 'text-primary-blue' : ''}`}>{item.value}</Body>
                  </View>
                  {item.tint && <Body color="muted" className="text-xs">›</Body>}
                </TouchableOpacity>
                {idx < contactItems.length - 1 && <Divider />}
              </React.Fragment>
            ))}

            {contactItems.length === 0 && (
              <Body color="secondary" className="text-sm text-center py-4">
                {t('agencyContact.noContactInfo')}
              </Body>
            )}
          </Card>

          {/* How it works */}
          <View style={[s.infoCard, { backgroundColor: isDark ? 'rgba(0,175,239,0.08)' : 'rgba(0,175,239,0.06)' }]}>
            <Body className="text-xs font-outfit-semibold mb-1" style={{ color: primaryColor }}>💡</Body>
            <Body color="secondary" className="text-sm leading-5 text-center">
              {t('agencyContact.howItWorks')}
            </Body>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[s.footer, {
          paddingBottom: insets.bottom + 8,
          borderTopColor: isDark ? '#2D2D44' : '#F3F4F6',
        }]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            setReqFullName('');
            setReqEmail('');
            setReqPhone('');
            setRequestModalVisible(true);
          }}
        >
          <LinearGradient
            colors={[brandColors.primary.blue, '#0088C2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.ctaBtn}
          >
            <Body color="inverse" className="font-outfit-semibold text-base">
              {t('inviteRequest.requestCode')}
            </Body>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity className="py-3" onPress={() => navigation.goBack()}>
          <Body color="secondary" className="text-center text-sm">
            ← {t('agencyContact.backToList')}
          </Body>
        </TouchableOpacity>
      </View>

      {/* Request Invite Code Modal */}
      <Modal visible={requestModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setRequestModalVisible(false)}
            style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' }}
          >
            <TouchableOpacity activeOpacity={1}>
              <View
                style={[s.modalSheet, {
                  backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF',
                  paddingBottom: insets.bottom + 8,
                }]}
              >
                {/* Handle */}
                <View className="items-center mb-4">
                  <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: isDark ? '#3D3D55' : '#D1D5DB' }} />
                </View>

                <View className="flex-row items-center justify-between mb-4">
                  <H1 className="text-lg">{t('inviteRequest.title')}</H1>
                  <TouchableOpacity
                    onPress={() => setRequestModalVisible(false)}
                    style={[s.closeBtn, { backgroundColor: isDark ? '#2D2D44' : '#F3F4F6' }]}
                  >
                    <Body style={{ color: isDark ? '#A0A0B2' : '#6B7280', fontSize: 14 }}>✕</Body>
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center mb-5 pb-4" style={{ borderBottomWidth: 1, borderBottomColor: isDark ? '#2D2D44' : '#F3F4F6' }}>
                  <View style={[s.modalLogo, { backgroundColor: primaryColor }]}>
                    {logoUri ? (
                      <Image source={{ uri: logoUri }} style={{ width: 28, height: 28 }} resizeMode="contain" />
                    ) : (
                      <Body color="inverse" className="font-outfit-bold text-sm">
                        {agency.name.charAt(0).toUpperCase()}
                      </Body>
                    )}
                  </View>
                  <View className="ml-3 flex-1">
                    <Body className="font-outfit-semibold">{agency.name}</Body>
                    {agency.address && (
                      <Caption color="secondary" numberOfLines={1} className="mt-0.5">{agency.address}</Caption>
                    )}
                  </View>
                </View>

                {/* Form fields */}
                <Input
                  label={t('inviteRequest.fullName')}
                  required
                  placeholder={t('inviteRequest.fullNamePlaceholder')}
                  value={reqFullName}
                  onChangeText={setReqFullName}
                  autoCapitalize="words"
                  containerClassName="mb-3"
                />

                <Input
                  label={t('inviteRequest.email')}
                  required
                  placeholder={t('inviteRequest.emailPlaceholder')}
                  value={reqEmail}
                  onChangeText={setReqEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  containerClassName="mb-3"
                />

                <Input
                  label={t('inviteRequest.phone')}
                  placeholder={t('inviteRequest.phonePlaceholder')}
                  value={reqPhone}
                  onChangeText={setReqPhone}
                  keyboardType="phone-pad"
                  containerClassName="mb-5"
                />

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={submitRequest}
                  disabled={submitting}
                >
                  <LinearGradient
                    colors={submitting ? ['#9CA3AF', '#9CA3AF'] : [brandColors.primary.blue, '#0088C2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={s.ctaBtn}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Body color="inverse" className="font-outfit-semibold text-base">
                        {t('inviteRequest.submit')}
                      </Body>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(8px)',
  } as any,
  mapChip: {
    position: 'absolute',
    bottom: 56,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoBorder: {
    width: 84,
    height: 84,
    borderRadius: 22,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: 72,
    height: 72,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  distancePill: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(0,175,239,0.08)',
  },
  actionBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  ctaBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLogo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 14,
    borderWidth: 1,
  },
});

export default AgencyContactScreen;
