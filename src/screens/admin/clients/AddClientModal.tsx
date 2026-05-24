import React, { useState } from 'react';
import {
  View, Modal, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useOrgTheme } from '../../../contexts';
import { H3, Body, Caption, Button, Input } from '../../../components/ui';
import { useCreateClientMutation } from '../../../store/api/clientApi';

// ─── Constants ────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  'Healthcare', 'Hospitality', 'Logistics', 'Retail',
  'Construction', 'Manufacturing', 'IT/Tech', 'Education',
  'Security', 'Cleaning', 'Other',
];

const BLANK = {
  name: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  city: '',
  postcode: '',
  industry: '',
  defaultPayRate: '',
  defaultChargeRate: '',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AddClientModal: React.FC<Props> = ({ visible, onClose }) => {
  const { isDark } = useTheme();
  const { primaryColor } = useOrgTheme();
  const [createClient, { isLoading }] = useCreateClientMutation();

  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState<Partial<typeof BLANK>>({});
  const [success, setSuccess] = useState(false);
  const [showIndustryPicker, setShowIndustryPicker] = useState(false);

  // Colours
  const bg        = isDark ? '#1F2937' : '#FFFFFF';
  const overlayBg = 'rgba(0,0,0,0.5)';
  const border    = isDark ? '#374151' : '#E5E7EB';
  const inputBg   = isDark ? '#374151' : '#F9FAFB';
  const text      = isDark ? '#F9FAFB' : '#111827';
  const muted     = isDark ? '#9CA3AF' : '#6B7280';

  const set = (key: keyof typeof BLANK) => (val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e: Partial<typeof BLANK> = {};
    if (!form.name.trim()) e.name = 'Client name is required';
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail))
      e.contactEmail = 'Invalid email format';
    if (form.defaultPayRate && isNaN(Number(form.defaultPayRate)))
      e.defaultPayRate = 'Must be a number';
    if (form.defaultChargeRate && isNaN(Number(form.defaultChargeRate)))
      e.defaultChargeRate = 'Must be a number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await createClient({
        name: form.name,
        contactName:      form.contactName      || undefined,
        contactEmail:     form.contactEmail     || undefined,
        contactPhone:     form.contactPhone     || undefined,
        address:          form.address          || undefined,
        city:             form.city             || undefined,
        postcode:         form.postcode         || undefined,
        industry:         form.industry         || undefined,
        defaultPayRate:   form.defaultPayRate   ? Number(form.defaultPayRate)   : undefined,
        defaultChargeRate: form.defaultChargeRate ? Number(form.defaultChargeRate) : undefined,
      }).unwrap();
      setSuccess(true);
    } catch {
      Alert.alert('Error', 'Failed to create client. Please try again.');
    }
  };

  const handleClose = () => {
    setForm(BLANK);
    setErrors({});
    setSuccess(false);
    setShowIndustryPicker(false);
    onClose();
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: overlayBg }}>
        <View style={{ backgroundColor: bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92%' }}>
            {/* Handle bar */}
            <View style={[styles.handleBar, { backgroundColor: border }]} />

            {/* Header */}
            <View style={[styles.sheetHeader, { borderBottomColor: border }]}>
              <View>
                <H3>Add New Client</H3>
                <Caption color="secondary">Enter the client details below</Caption>
              </View>
              <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color={muted} />
              </TouchableOpacity>
            </View>

            {success ? (
              /* ── Success state ──────────────────────────────────────────── */
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={56} color="#16A34A" />
                <H3 style={{ color: '#15803D', marginTop: 12, marginBottom: 8 }}>Client Added!</H3>
                <Caption color="secondary" style={{ textAlign: 'center', marginBottom: 24 }}>
                  {form.name || 'The client'} has been added successfully.
                </Caption>
                <Button onPress={handleClose}>Done</Button>
              </View>
            ) : (
              /* ── Form ───────────────────────────────────────────────────── */
              <ScrollView
                contentContainerStyle={styles.formContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Client Name */}
                <Input
                  label="Client Name"
                  required
                  value={form.name}
                  onChangeText={set('name')}
                  placeholder="e.g. St Jude Hospital"
                  error={errors.name}
                />

                {/* Contact Name + Email */}
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Contact Name"
                      value={form.contactName}
                      onChangeText={set('contactName')}
                      placeholder="e.g. John Smith"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Contact Email"
                      value={form.contactEmail}
                      onChangeText={set('contactEmail')}
                      placeholder="john@company.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      error={errors.contactEmail}
                    />
                  </View>
                </View>

                {/* Phone + Industry */}
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Contact Phone"
                      value={form.contactPhone}
                      onChangeText={set('contactPhone')}
                      placeholder="+44 7123 456789"
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.fieldGroup}>
                      <Caption style={[styles.label, { color: muted }]}>Industry</Caption>
                      <TouchableOpacity
                        style={[styles.input, styles.pickerBtn, { backgroundColor: inputBg, borderColor: border }]}
                        onPress={() => setShowIndustryPicker(true)}
                      >
                        <Body style={{ color: form.industry ? text : muted, fontSize: 14, flex: 1 }}>
                          {form.industry || 'Select industry'}
                        </Body>
                        <Ionicons name="chevron-down" size={16} color={muted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Address */}
                <Input
                  label="Address"
                  value={form.address}
                  onChangeText={set('address')}
                  placeholder="Street address"
                />

                {/* City + Postcode */}
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="City"
                      value={form.city}
                      onChangeText={set('city')}
                      placeholder="e.g. London"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Postcode"
                      value={form.postcode}
                      onChangeText={set('postcode')}
                      placeholder="e.g. SW1A 1AA"
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                {/* Pay Rate + Charge Rate */}
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Default Pay Rate (£/hr)"
                      value={form.defaultPayRate}
                      onChangeText={set('defaultPayRate')}
                      placeholder="e.g. 12.50"
                      keyboardType="decimal-pad"
                      autoCapitalize="none"
                      error={errors.defaultPayRate}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Default Charge Rate (£/hr)"
                      value={form.defaultChargeRate}
                      onChangeText={set('defaultChargeRate')}
                      placeholder="e.g. 16.25"
                      keyboardType="decimal-pad"
                      autoCapitalize="none"
                      error={errors.defaultChargeRate}
                    />
                  </View>
                </View>

                <Button onPress={handleSubmit} loading={isLoading} disabled={isLoading} style={{ marginTop: 8 }}>
                  Add Client
                </Button>

                <View style={{ height: 24 }} />
              </ScrollView>
            )}
        </View>
      </View>

      {/* ── Industry Picker Sheet ──────────────────────────────────────────── */}
      <Modal
        visible={showIndustryPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowIndustryPicker(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-end"
          style={{ backgroundColor: overlayBg }}
          activeOpacity={1}
          onPress={() => setShowIndustryPicker(false)}
        >
          <View style={{ backgroundColor: bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%' }}>
            <View style={[styles.handleBar, { backgroundColor: border }]} />
            <View style={[styles.sheetHeader, { borderBottomColor: border }]}>
              <H3>Select Industry</H3>
              <TouchableOpacity onPress={() => setShowIndustryPicker(false)}>
                <Ionicons name="close" size={22} color={muted} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {INDUSTRIES.map(ind => (
                <TouchableOpacity
                  key={ind}
                  style={[
                    styles.industryRow,
                    { borderBottomColor: border },
                    form.industry === ind && { backgroundColor: primaryColor + '18' },
                  ]}
                  onPress={() => { set('industry')(ind); setShowIndustryPicker(false); }}
                >
                  <Body style={{ color: form.industry === ind ? primaryColor : text }}>{ind}</Body>
                  {form.industry === ind && (
                    <Ionicons name="checkmark" size={18} color={primaryColor} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  handleBar:        { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  sheetHeader:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  formContent:      { paddingHorizontal: 20, paddingTop: 16 },
  row:              { flexDirection: 'row', gap: 12 },
  fieldGroup:       { marginBottom: 14 },
  label:            { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  input:            { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: 'Outfit-Regular' },
  pickerBtn:        { flexDirection: 'row', alignItems: 'center' },
  successContainer: { alignItems: 'center', padding: 40 },
  industryRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
});

export default AddClientModal;
