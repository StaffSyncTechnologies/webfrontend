import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme, useTheme } from '../contexts';
import { H2, H3, Body, Caption, Button } from '../components/ui';
import { useSendContactMessageMutation } from '../store/api/contactApi';
import type { RootStackScreenProps } from '../types/navigation';

const BLANK = { firstName: '', lastName: '', email: '', subject: '', message: '' };

export function HelpScreen({ navigation }: RootStackScreenProps<'Help'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();

  const [form, setForm] = useState(BLANK);
  const [success, setSuccess] = useState(false);
  const [sendContactMessage, { isLoading }] = useSendContactMessageMutation();

  const bg = isDark ? '#111827' : '#F9FAFB';
  const cardBg = isDark ? '#1f2937' : '#fff';
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const mutedColor = isDark ? '#9CA3AF' : '#6B7280';
  const inputBg = isDark ? '#374151' : '#F9FAFB';

  const set = (key: keyof typeof BLANK) => (val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.firstName.trim()) { Alert.alert('Validation', 'Please enter your first name.'); return; }
    if (!form.email.trim()) { Alert.alert('Validation', 'Please enter your email address.'); return; }
    if (form.message.trim().length < 10) { Alert.alert('Validation', 'Please enter a message (at least 10 characters).'); return; }

    try {
      await sendContactMessage(form).unwrap();
      setSuccess(true);
      setForm(BLANK);
    } catch (err: any) {
      Alert.alert('Error', err?.data?.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bg, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color={textColor} />
        </TouchableOpacity>
        <H2>Help & Support</H2>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {success ? (
          <View style={[styles.card, { backgroundColor: cardBg, borderColor, alignItems: 'center', paddingVertical: 40 }]}>
            <Ionicons name="checkmark-circle" size={56} color="#16A34A" />
            <H3 style={{ color: '#15803D', marginTop: 12, marginBottom: 8 }}>Message Sent!</H3>
            <Body color="secondary" style={{ textAlign: 'center', marginBottom: 20 }}>
              Thank you for reaching out. We'll get back to you within 1 business day.
            </Body>
            <Button onPress={() => setSuccess(false)} fullWidth={false}>
              Send Another Message
            </Button>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <H3 style={{ marginBottom: 4 }}>Contact Support</H3>
            <Caption color="secondary" style={{ marginBottom: 20 }}>Our team will respond within 1 business day.</Caption>

            {/* Name row */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Caption style={{ color: mutedColor, marginBottom: 4 }}>First Name *</Caption>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                  placeholder="First name"
                  placeholderTextColor={mutedColor}
                  value={form.firstName}
                  onChangeText={set('firstName')}
                  autoCapitalize="words"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Caption style={{ color: mutedColor, marginBottom: 4 }}>Last Name</Caption>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                  placeholder="Last name"
                  placeholderTextColor={mutedColor}
                  value={form.lastName}
                  onChangeText={set('lastName')}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <Caption style={{ color: mutedColor, marginBottom: 4 }}>Email Address *</Caption>
            <TextInput
              style={[styles.input, styles.fullInput, { backgroundColor: inputBg, borderColor, color: textColor }]}
              placeholder="your@email.com"
              placeholderTextColor={mutedColor}
              value={form.email}
              onChangeText={set('email')}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Caption style={{ color: mutedColor, marginBottom: 4 }}>Subject</Caption>
            <TextInput
              style={[styles.input, styles.fullInput, { backgroundColor: inputBg, borderColor, color: textColor }]}
              placeholder="What is your enquiry about?"
              placeholderTextColor={mutedColor}
              value={form.subject}
              onChangeText={set('subject')}
            />

            <Caption style={{ color: mutedColor, marginBottom: 4 }}>Message *</Caption>
            <TextInput
              style={[styles.input, styles.fullInput, styles.textarea, { backgroundColor: inputBg, borderColor, color: textColor }]}
              placeholder="Tell us how we can help you..."
              placeholderTextColor={mutedColor}
              value={form.message}
              onChangeText={set('message')}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <Button onPress={handleSubmit} loading={isLoading} disabled={isLoading} style={{ marginTop: 8 }}>
              Send Message
            </Button>
          </View>
        )}

        {/* Contact info */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <H3 style={{ marginBottom: 12 }}>Other Ways to Reach Us</H3>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={18} color={primaryColor} />
            <Body color="secondary" style={{ marginLeft: 8 }}>support@staffsync.com</Body>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="time-outline" size={18} color={primaryColor} />
            <Body color="secondary" style={{ marginLeft: 8 }}>Mon – Fri, 9am – 5pm GMT</Body>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  backBtn: { marginRight: 12 },
  content: { padding: 16, gap: 12 },
  card: { borderRadius: 12, borderWidth: 1, padding: 20 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: 'Outfit-Regular' },
  fullInput: { marginBottom: 16 },
  textarea: { height: 110, paddingTop: 12 },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
});

export default HelpScreen;
