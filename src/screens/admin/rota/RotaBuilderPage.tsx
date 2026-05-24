import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts';
import { H3, Body, Caption } from '../../../components/ui';
import RotaBuilderScreen from './RotaBuilderScreen';
import { useGetActiveClientCompaniesQuery } from '../../../store/slices/adminSlices/organizationSlice';

export default function RotaBuilderPage() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const isDark = theme === 'dark';

  const { data: clientCompanies = [], isLoading } = useGetActiveClientCompaniesQuery();
  const [activeClientId, setActiveClientId] = useState<string>('');

  useEffect(() => {
    if (clientCompanies.length > 0 && !activeClientId) {
      setActiveClientId(clientCompanies[0].id);
    }
  }, [clientCompanies, activeClientId]);

  // Derive the effective ID immediately — avoids an initial render with ''
  // that would mount RotaBuilderScreen with no client and then remount it.
  const effectiveClientId = activeClientId || clientCompanies[0]?.id || '';
  const activeClient = clientCompanies.find(c => c.id === effectiveClientId);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (clientCompanies.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Caption>No clients</Caption>
      </View>
    );
  }

  return (
    // RotaBuilderPage owns the top safe area. RotaBuilderScreen must NOT add its own.
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[
        styles.header,
        { backgroundColor: isDark ? '#1f2937' : '#fafafa', borderBottomColor: isDark ? '#374151' : '#eee' },
      ]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={22} color={isDark ? '#fff' : '#111827'} />
        </TouchableOpacity>
        <H3 style={{ marginRight: 8 }}>Rota Builder</H3>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={styles.tabContainer}>
            {clientCompanies.map(c => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setActiveClientId(c.id)}
                style={[
                  styles.tab,
                  effectiveClientId === c.id
                    ? { backgroundColor: '#333' }
                    : { borderColor: isDark ? '#555' : '#ddd' },
                ]}
              >
                <Body style={[
                  styles.tabText,
                  { color: effectiveClientId === c.id ? '#fff' : isDark ? '#aaa' : '#555' },
                ]}>
                  {c.name}
                </Body>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* key=effectiveClientId resets week state when switching clients */}
      <RotaBuilderScreen
        key={effectiveClientId}
        clientCompanyId={effectiveClientId}
        clientName={activeClient?.name}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1 },
  backButton: { marginRight: 8 },
  tabContainer: { flexDirection: 'row', gap: 4 },
  tab: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  tabText: { fontSize: 12, fontWeight: '500' },
});
