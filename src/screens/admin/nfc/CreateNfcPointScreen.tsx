import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOrgTheme, useTheme } from '../../../contexts';
import { useToast } from '../../../contexts/ToastContext';
import { H2, H3, Body, Caption } from '../../../components/ui';
import { useCreateNfcClockPointMutation } from '../../../store/api/nfcApi';
import { useGetClientListQuery, Client } from '../../../store/api/clientApi';

// ─── Geocoding ────────────────────────────────────────────────────────────────

async function geocodeAddress(
  address: string,
  postcode: string,
): Promise<{ lat: number; lng: number } | null> {
  const q = [address, postcode, 'UK'].filter(Boolean).join(', ');
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=gb`;
  try {
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'StaffSync/1.0' },
    });
    const json = await res.json();
    if (Array.isArray(json) && json.length > 0) {
      return { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) };
    }
  } catch { /* ignore */ }
  return null;
}

// ─── Client initials avatar ───────────────────────────────────────────────────

function Initials({ name, size = 40, bg }: { name: string; size?: number; bg: string }) {
  const letters = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Body style={{ color: '#FFFFFF', fontWeight: '700', fontSize: size * 0.38 }}>
        {letters}
      </Body>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function CreateNfcPointScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const { success: toastSuccess, error: toastError } = useToast();
  const navigation = useNavigation<any>();

  // ── Name ───────────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  // ── Client picker state ────────────────────────────────────────────────
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { data: clientData, isLoading: clientsLoading } = useGetClientListQuery({ limit: 100 });
  const allClients: Client[] = clientData?.data?.clients ?? [];

  const filteredClients = useMemo(() => {
    const q = clientSearch.toLowerCase().trim();
    if (!q) return allClients;
    return allClients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.address ?? '').toLowerCase().includes(q) ||
        (c.city ?? '').toLowerCase().includes(q) ||
        (c.postcode ?? '').toLowerCase().includes(q),
    );
  }, [allClients, clientSearch]);

  // ── Address / geocoding ────────────────────────────────────────────────
  const [address, setAddress]     = useState('');
  const [postcode, setPostcode]   = useState('');
  const [coords, setCoords]       = useState<{ lat: number; lng: number } | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');

  const [createPoint, { isLoading }] = useCreateNfcClockPointMutation();

  // ── Theme ──────────────────────────────────────────────────────────────
  const bgColor      = isDark ? '#111827' : '#F9FAFB';
  const cardBg       = isDark ? '#1F2937' : '#FFFFFF';
  const textColor    = isDark ? '#F9FAFB' : '#111827';
  const subtextColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor  = isDark ? '#374151' : '#E5E7EB';
  const inputBg      = isDark ? '#374151' : '#F9FAFB';

  // ── Handlers ───────────────────────────────────────────────────────────

  const handlePickClient = (client: Client) => {
    setSelectedClient(client);
    setDropdownOpen(false);
    setClientSearch('');

    // Pre-fill address from client if available
    const addr = [client.address, client.city].filter(Boolean).join(', ');
    setAddress(addr);
    setPostcode(client.postcode ?? '');
    setCoords(null);
    setGeocodeError('');
  };

  const handleClearClient = () => {
    setSelectedClient(null);
    setAddress('');
    setPostcode('');
    setCoords(null);
    setGeocodeError('');
  };

  const handleLookup = async () => {
    if (!address.trim() && !postcode.trim()) {
      setGeocodeError('Enter an address or postcode first.');
      return;
    }
    setGeocodeError('');
    setGeocoding(true);
    const result = await geocodeAddress(address.trim(), postcode.trim());
    setGeocoding(false);
    if (result) {
      setCoords(result);
    } else {
      setGeocodeError('Could not find coordinates. Try a more specific address or postcode.');
    }
  };

  const validate = (): boolean => {
    if (!name.trim() || name.trim().length < 2) {
      setNameError('Name must be at least 2 characters.');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    try {
      const body: Parameters<typeof createPoint>[0] = { name: name.trim() };
      if (selectedClient)  body.clientId  = selectedClient.id;
      if (address.trim())  body.address   = address.trim();
      if (postcode.trim()) body.postcode  = postcode.trim();
      if (coords)          { body.latitude = coords.lat; body.longitude = coords.lng; }

      console.log('[CreateNfcPoint] sending body:', JSON.stringify(body, null, 2));
      const result = await createPoint(body).unwrap();
      toastSuccess('NFC clock point created!');
      navigation.replace('WriteNfcTag', { point: result.data });
    } catch (err: any) {
      console.error('[CreateNfcPoint] error:', JSON.stringify(err, null, 2));
      const msg =
        err?.data?.message ||
        err?.data?.error ||
        (Array.isArray(err?.data?.errors) ? err.data.errors.join(', ') : null) ||
        err?.message ||
        'Failed to create NFC clock point.';
      toastError(msg);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: bgColor }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-5 py-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <H2 style={{ color: textColor }}>New NFC Clock Point</H2>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info banner */}
        <View className="rounded-2xl p-4 mb-6 flex-row" style={{ backgroundColor: `${primaryColor}15` }}>
          <Ionicons name="information-circle-outline" size={20} color={primaryColor} />
          <Body style={{ color: primaryColor, flex: 1, marginLeft: 10 }}>
            After creating, you'll be taken to the write screen to program a physical NFC sticker.
          </Body>
        </View>

        {/* ── Clock point name ── */}
        <View className="mb-6">
          <Caption style={{ color: subtextColor, marginBottom: 6, fontWeight: '600' }}>
            CLOCK POINT NAME *
          </Caption>
          <TextInput
            value={name}
            onChangeText={(t) => { setName(t); if (nameError) setNameError(''); }}
            placeholder="e.g. Main Entrance, Reception, Warehouse Door A"
            placeholderTextColor={subtextColor}
            style={{
              backgroundColor: inputBg,
              borderWidth: 1,
              borderColor: nameError ? '#EF4444' : borderColor,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: textColor,
              fontSize: 15,
            }}
          />
          {nameError ? (
            <Caption style={{ color: '#EF4444', marginTop: 4 }}>{nameError}</Caption>
          ) : null}
        </View>

        {/* ── Client picker ── */}
        <View className="mb-6">
          <Caption style={{ color: subtextColor, marginBottom: 10, fontWeight: '600' }}>
            CLIENT
          </Caption>

          {/* ── Selected client card ── */}
          {selectedClient ? (
            <View
              className="rounded-2xl p-4"
              style={{ backgroundColor: cardBg, borderWidth: 1.5, borderColor: primaryColor }}
            >
              <View className="flex-row items-center">
                <Initials name={selectedClient.name} size={44} bg={primaryColor} />
                <View className="flex-1 ml-3">
                  <Body style={{ color: textColor, fontWeight: '700', fontSize: 15 }}>
                    {selectedClient.name}
                  </Body>
                  {selectedClient.industry ? (
                    <Caption style={{ color: subtextColor }}>{selectedClient.industry}</Caption>
                  ) : null}
                  {[selectedClient.address, selectedClient.city, selectedClient.postcode]
                    .filter(Boolean).length > 0 ? (
                    <Caption style={{ color: subtextColor, marginTop: 2 }}>
                      {[selectedClient.address, selectedClient.city, selectedClient.postcode]
                        .filter(Boolean)
                        .join(', ')}
                    </Caption>
                  ) : (
                    <Caption style={{ color: '#F59E0B', marginTop: 2 }}>
                      No address on file — enter manually below
                    </Caption>
                  )}
                </View>
                <TouchableOpacity
                  onPress={handleClearClient}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: isDark ? '#374151' : '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="close" size={16} color={subtextColor} />
                </TouchableOpacity>
              </View>

              {/* Change link */}
              <TouchableOpacity
                className="flex-row items-center mt-3 pt-3"
                style={{ borderTopWidth: 1, borderColor }}
                onPress={() => setDropdownOpen(true)}
              >
                <Ionicons name="swap-horizontal-outline" size={14} color={primaryColor} />
                <Caption style={{ color: primaryColor, marginLeft: 5, fontWeight: '600' }}>
                  Change client
                </Caption>
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Trigger button ── */
            <TouchableOpacity
              className="flex-row items-center p-4 rounded-2xl"
              style={{
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: dropdownOpen ? primaryColor : borderColor,
                borderStyle: dropdownOpen ? 'solid' : 'solid',
              }}
              onPress={() => setDropdownOpen((o) => !o)}
              activeOpacity={0.7}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: `${primaryColor}18`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name="business-outline" size={20} color={primaryColor} />
              </View>
              <View className="flex-1">
                <Body style={{ color: textColor, fontWeight: '600' }}>Select a client</Body>
                <Caption style={{ color: subtextColor }}>
                  {clientsLoading ? 'Loading…' : `${allClients.length} client${allClients.length !== 1 ? 's' : ''} available`}
                </Caption>
              </View>
              <Ionicons
                name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={subtextColor}
              />
            </TouchableOpacity>
          )}

          {/* ── Dropdown list ── */}
          {dropdownOpen && (
            <View
              className="rounded-2xl mt-2 overflow-hidden"
              style={{ backgroundColor: cardBg, borderWidth: 1, borderColor }}
            >
              {/* Search */}
              <View
                className="flex-row items-center px-3 mx-3 mt-3 mb-2 rounded-xl"
                style={{ backgroundColor: inputBg, borderWidth: 1, borderColor }}
              >
                <Ionicons name="search-outline" size={16} color={subtextColor} />
                <TextInput
                  value={clientSearch}
                  onChangeText={setClientSearch}
                  placeholder="Search clients…"
                  placeholderTextColor={subtextColor}
                  autoFocus
                  style={{
                    flex: 1,
                    paddingHorizontal: 8,
                    paddingVertical: 10,
                    color: textColor,
                    fontSize: 14,
                  }}
                />
                {clientSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setClientSearch('')}>
                    <Ionicons name="close-circle" size={16} color={subtextColor} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Client rows */}
              {clientsLoading ? (
                <View className="items-center py-6">
                  <ActivityIndicator size="small" color={primaryColor} />
                </View>
              ) : filteredClients.length === 0 ? (
                <View className="items-center py-6">
                  <Ionicons name="search-outline" size={28} color={subtextColor} />
                  <Caption style={{ color: subtextColor, marginTop: 6 }}>No clients match</Caption>
                </View>
              ) : (
                filteredClients.map((client, idx) => (
                  <TouchableOpacity
                    key={client.id}
                    className="flex-row items-center px-4 py-3"
                    style={{
                      borderTopWidth: idx === 0 ? 0 : 1,
                      borderColor,
                    }}
                    onPress={() => handlePickClient(client)}
                    activeOpacity={0.6}
                  >
                    <Initials name={client.name} size={36} bg={`${primaryColor}CC`} />
                    <View className="flex-1 ml-3">
                      <Body style={{ color: textColor, fontWeight: '600', fontSize: 14 }}>
                        {client.name}
                      </Body>
                      {client.industry ? (
                        <Caption style={{ color: subtextColor }}>{client.industry}</Caption>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={subtextColor} />
                  </TouchableOpacity>
                ))
              )}

              {/* Close */}
              <TouchableOpacity
                className="items-center py-3 mx-3 mb-3 mt-1 rounded-xl"
                style={{ backgroundColor: inputBg }}
                onPress={() => { setDropdownOpen(false); setClientSearch(''); }}
              >
                <Caption style={{ color: subtextColor, fontWeight: '600' }}>Cancel</Caption>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Location / geocoding ── */}
        <View
          className="rounded-2xl p-4 mb-6"
          style={{ backgroundColor: cardBg, borderWidth: 1, borderColor }}
        >
          <View className="flex-row items-center mb-1">
            <Ionicons name="location-outline" size={18} color={primaryColor} />
            <Body style={{ color: textColor, fontWeight: '700', marginLeft: 6 }}>
              Clock Point Location
            </Body>
          </View>
          <Caption style={{ color: subtextColor, marginBottom: 14 }}>
            Enter the address and postcode to resolve GPS coordinates for geofencing.
          </Caption>

          {/* Address */}
          <Caption style={{ color: subtextColor, marginBottom: 5, fontWeight: '600' }}>ADDRESS</Caption>
          <TextInput
            value={address}
            onChangeText={(t) => { setAddress(t); setCoords(null); setGeocodeError(''); }}
            placeholder="e.g. 123 Business Avenue, Suite 100"
            placeholderTextColor={subtextColor}
            style={{
              backgroundColor: inputBg,
              borderWidth: 1,
              borderColor,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: textColor,
              fontSize: 15,
              marginBottom: 12,
            }}
          />

          {/* Postcode */}
          <Caption style={{ color: subtextColor, marginBottom: 5, fontWeight: '600' }}>POSTCODE</Caption>
          <TextInput
            value={postcode}
            onChangeText={(t) => { setPostcode(t.toUpperCase()); setCoords(null); setGeocodeError(''); }}
            placeholder="e.g. CW2 7LQ"
            placeholderTextColor={subtextColor}
            autoCapitalize="characters"
            style={{
              backgroundColor: inputBg,
              borderWidth: 1,
              borderColor,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: textColor,
              fontSize: 15,
              marginBottom: 14,
            }}
          />

          {/* Look up */}
          <TouchableOpacity
            className="flex-row items-center justify-center py-3 rounded-xl mb-3"
            style={{
              backgroundColor: geocoding ? `${primaryColor}40` : `${primaryColor}18`,
              borderWidth: 1,
              borderColor: `${primaryColor}50`,
            }}
            onPress={handleLookup}
            disabled={geocoding}
          >
            {geocoding ? (
              <ActivityIndicator size="small" color={primaryColor} style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="locate-outline" size={16} color={primaryColor} style={{ marginRight: 6 }} />
            )}
            <Body style={{ color: primaryColor, fontWeight: '600' }}>
              {geocoding ? 'Looking up…' : 'Get Coordinates'}
            </Body>
          </TouchableOpacity>

          {geocodeError ? (
            <View className="flex-row items-start mb-3">
              <Ionicons name="alert-circle-outline" size={15} color="#EF4444" style={{ marginRight: 4, marginTop: 1 }} />
              <Caption style={{ color: '#EF4444', flex: 1 }}>{geocodeError}</Caption>
            </View>
          ) : null}

          {coords ? (
            <View
              className="flex-row items-center rounded-xl px-4 py-3"
              style={{ backgroundColor: '#10B98115', borderWidth: 1, borderColor: '#10B98140' }}
            >
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <View className="ml-3 flex-1">
                <Caption style={{ color: '#10B981', fontWeight: '700' }}>Coordinates resolved ✓</Caption>
                <Caption style={{ color: '#10B981', marginTop: 2 }}>
                  {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                </Caption>
              </View>
              <TouchableOpacity onPress={() => setCoords(null)}>
                <Ionicons name="refresh-outline" size={16} color="#10B981" />
              </TouchableOpacity>
            </View>
          ) : (
            <View
              className="flex-row items-center rounded-xl px-4 py-3"
              style={{ backgroundColor: '#F59E0B15', borderWidth: 1, borderColor: '#F59E0B40' }}
            >
              <Ionicons name="warning-outline" size={17} color="#F59E0B" />
              <Caption style={{ color: '#F59E0B', marginLeft: 8, flex: 1 }}>
                No coordinates yet — fill in address above then tap "Get Coordinates".
              </Caption>
            </View>
          )}
        </View>

        {/* What happens next */}
        <View
          className="rounded-2xl p-4 mb-8"
          style={{ backgroundColor: cardBg, borderWidth: 1, borderColor }}
        >
          <H3 style={{ color: textColor, marginBottom: 12 }}>What happens next?</H3>
          {[
            { icon: 'key-outline',              text: 'A unique tag code is generated (e.g. SS_NFC_8F92KDA)' },
            { icon: 'radio-outline',            text: "You'll be taken to the write screen to program an NFC sticker" },
            { icon: 'checkmark-circle-outline', text: 'Once written, the point becomes Active and workers can use it' },
          ].map((item, i) => (
            <View key={i} className="flex-row items-start mb-3">
              <View
                className="w-7 h-7 rounded-full items-center justify-center mr-3 mt-0.5"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Ionicons name={item.icon as any} size={14} color={primaryColor} />
              </View>
              <Body style={{ color: subtextColor, flex: 1 }}>{item.text}</Body>
            </View>
          ))}
        </View>

        <View className="h-6" />
      </ScrollView>

      {/* Footer */}
      <View
        className="px-5 pb-6 pt-4"
        style={{ borderTopWidth: 1, borderColor, backgroundColor: cardBg }}
      >
        {!coords && (address.trim() || postcode.trim()) && (
          <Caption style={{ color: '#F59E0B', textAlign: 'center', marginBottom: 8 }}>
            ⚠ Coordinates not resolved — NFC point will be created without GPS geofencing.
          </Caption>
        )}
        <TouchableOpacity
          className="py-4 rounded-xl items-center"
          style={{ backgroundColor: isLoading ? `${primaryColor}80` : primaryColor }}
          onPress={handleCreate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Body style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>
              Create &amp; Write Tag
            </Body>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

export default CreateNfcPointScreen;
