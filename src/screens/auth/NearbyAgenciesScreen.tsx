import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Image } from 'react-native';
import * as Location from 'expo-location';
import { Container, H1, H2, Body, Caption, Card } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts';
import { brandColors } from '../../constants/colors';
import type { AuthStackScreenProps, NearbyAgencyInfo } from '../../types/navigation';
import type { NearbyAgency } from '../../store/api/agencyApi';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../services/endpoints';
import { buildFileUrl } from '../../utils/buildFileUrl';

const RADIUS_OPTIONS = [10, 25, 50, 100, 200];

type Props = AuthStackScreenProps<'NearbyAgencies'>;

export function NearbyAgenciesScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [locationReady, setLocationReady] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [radiusMiles, setRadiusMiles] = useState(50);
  const [citySearch, setCitySearch] = useState('');
  const [debouncedCity, setDebouncedCity] = useState('');
  const [agencies, setAgencies] = useState<NearbyAgency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Get device location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationDenied(true);
        setLocationReady(true);
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } catch {
        setLocationDenied(true);
      }
      setLocationReady(true);
    })();
  }, []);

  // Debounce city search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCity(citySearch.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [citySearch]);

  // Fetch agencies whenever filters or location change
  useEffect(() => {
    if (!locationReady) return;

    const fetchAgencies = async () => {
      setIsFetching(true);
      try {
        const params = new URLSearchParams();
        if (coords) {
          params.set('lat', String(coords.lat));
          params.set('lng', String(coords.lng));
        }
        params.set('radiusMiles', String(radiusMiles));
        if (debouncedCity) params.set('city', debouncedCity);

        const url = `${API_BASE_URL}/agencies/nearby?${params.toString()}`;
        const res = await fetch(url);
        const json = await res.json();
        setAgencies(json.data ?? []);
      } catch (err) {
        console.error('[NearbyAgencies] fetch error:', err);
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    };

    fetchAgencies();
  }, [locationReady, coords, radiusMiles, debouncedCity]);


  const handlePress = (agency: NearbyAgency) => {
    const info: NearbyAgencyInfo = {
      id: agency.id,
      name: agency.name,
      address: agency.address ?? undefined,
      logoUrl: agency.logoUrl ?? undefined,
      primaryColor: agency.primaryColor ?? undefined,
      distance: agency.distance ?? undefined,
      email: agency.email ?? undefined,
      website: agency.website ?? undefined,
      phone: agency.phone ?? undefined,
      contactName: agency.contactName ?? undefined,
      latitude: agency.latitude ?? undefined,
      longitude: agency.longitude ?? undefined,
    };
    navigation.navigate('AgencyContact', { agency: info });
  };

  const clearFilters = () => {
    setRadiusMiles(50);
    setCitySearch('');
    setDebouncedCity('');
  };

  const hasActiveFilters = radiusMiles !== 50 || debouncedCity.length > 0;

  const renderAgency = ({ item }: { item: NearbyAgency }) => {
    const logoUri = buildFileUrl(item.logoUrl);
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => handlePress(item)} className="mb-3">
        <Card variant="outlined" padding="md">
          <View className="flex-row items-center">
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: item.primaryColor || brandColors.primary.navy,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              {logoUri ? (
                <Image source={{ uri: logoUri }} style={{ width: 40, height: 40 }} resizeMode="contain" />
              ) : (
                <Body color="inverse" className="text-lg font-outfit-bold">
                  {item.name.charAt(0).toUpperCase()}
                </Body>
              )}
            </View>

            <View className="flex-1 ml-3">
              <H2 className="text-base">{item.name}</H2>
              {item.address && (
                <Caption color="secondary" className="mt-0.5" numberOfLines={1}>
                  📍 {item.address}
                </Caption>
              )}
            </View>

            {item.distance != null && (
              <View className="items-end ml-2">
                <Body className="text-primary-blue font-outfit-semibold text-sm">
                  {item.distance} mi
                </Body>
                <Caption color="muted">{t('nearbyAgencies.away')}</Caption>
              </View>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <Container safe padding="lg" keyboard>
      {/* Header */}
      <View className="flex-row items-center pt-4 pb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
          <Body className="text-primary-blue text-2xl">←</Body>
        </TouchableOpacity>
        <View className="flex-1">
          <H1 className="text-xl">{t('nearbyAgencies.title')}</H1>
          <Caption color="secondary" className="mt-0.5">
            {t('nearbyAgencies.subtitle')}
          </Caption>
        </View>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: hasActiveFilters ? brandColors.primary.blue : (isDark ? '#374151' : '#F3F4F6'),
            justifyContent: 'center', alignItems: 'center',
          }}
        >
          <Ionicons name="filter" size={18} color={hasActiveFilters ? '#FFFFFF' : (isDark ? '#D1D5DB' : '#374151')} />
        </TouchableOpacity>
      </View>

      {/* Filter panel */}
      {showFilters && (
        <View
          className="mt-2 mb-2 rounded-2xl p-4"
          style={{ backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderWidth: 1, borderColor: isDark ? '#374151' : '#E5E7EB' }}
        >
          {/* City search */}
          <View className="mb-4">
            <Caption color="secondary" className="mb-1.5 font-outfit-semibold">
              {t('nearbyAgencies.filterByCity')}
            </Caption>
            <TextInput
              value={citySearch}
              onChangeText={setCitySearch}
              placeholder={t('nearbyAgencies.cityPlaceholder')}
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              clearButtonMode="while-editing"
              style={{
                height: 42,
                borderRadius: 10,
                paddingHorizontal: 14,
                fontSize: 15,
                backgroundColor: isDark ? '#111827' : '#FFFFFF',
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#D1D5DB',
                color: isDark ? '#F9FAFB' : '#111827',
              }}
            />
          </View>

          {/* Radius selector */}
          <View>
            <Caption color="secondary" className="mb-1.5 font-outfit-semibold">
              {t('nearbyAgencies.searchRadius')}
            </Caption>
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {RADIUS_OPTIONS.map((r) => {
                const isSelected = r === radiusMiles;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRadiusMiles(r)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: isSelected ? brandColors.primary.blue : (isDark ? '#111827' : '#FFFFFF'),
                      borderWidth: 1,
                      borderColor: isSelected ? brandColors.primary.blue : (isDark ? '#374151' : '#D1D5DB'),
                    }}
                  >
                    <Body
                      className="text-sm font-outfit-medium"
                      style={{ color: isSelected ? '#FFFFFF' : (isDark ? '#D1D5DB' : '#374151') }}
                    >
                      {r} mi
                    </Body>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Clear filters */}
          {hasActiveFilters && (
            <TouchableOpacity onPress={clearFilters} className="mt-3 self-end">
              <Caption className="text-primary-blue font-outfit-semibold">{t('nearbyAgencies.clearFilters')}</Caption>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Active filter badges */}
      {hasActiveFilters && !showFilters && (
        <View className="flex-row items-center mt-1 mb-1" style={{ gap: 8 }}>
          {debouncedCity ? (
            <View style={{ backgroundColor: brandColors.primary.blue + '15', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Caption className="text-primary-blue font-outfit-medium">📍 {debouncedCity}</Caption>
            </View>
          ) : null}
          {radiusMiles !== 50 && (
            <View style={{ backgroundColor: brandColors.primary.blue + '15', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Caption className="text-primary-blue font-outfit-medium">{radiusMiles} mi</Caption>
            </View>
          )}
          <TouchableOpacity onPress={clearFilters}>
            <Caption className="text-status-error font-outfit-medium">✕ {t('nearbyAgencies.clearFilters')}</Caption>
          </TouchableOpacity>
        </View>
      )}

      {/* Location status */}
      {locationDenied && (
        <View className="bg-status-warning/10 rounded-xl p-3 mt-3 mb-1">
          <Caption color="warning">{t('nearbyAgencies.locationDenied')}</Caption>
        </View>
      )}

      {/* Result count */}
      {!isLoading && agencies.length > 0 && (
        <View className="mt-2 mb-1">
          <Caption color="muted">
            {agencies.length} {t('nearbyAgencies.agenciesFound')}
            {isFetching ? ` • ${t('nearbyAgencies.updating')}` : ''}
          </Caption>
        </View>
      )}

      {/* List */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={brandColors.primary.blue} />
          <Body color="secondary" className="mt-3">{t('nearbyAgencies.searching')}</Body>
        </View>
      ) : agencies.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Body color="secondary" className="text-center">{t('nearbyAgencies.noResults')}</Body>
          {hasActiveFilters && (
            <TouchableOpacity onPress={clearFilters} className="mt-3">
              <Body className="text-primary-blue font-outfit-semibold">{t('nearbyAgencies.clearFilters')}</Body>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={agencies}
          keyExtractor={(item) => item.id}
          renderItem={renderAgency}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
    </Container>
  );
}

export default NearbyAgenciesScreen;
