import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from '../../../shims/imagePicker.shim';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOrgTheme, useTheme, useToast } from '../../../contexts';
import { H2, Body, Caption, Card, Badge, Input } from '../../../components/ui';
import { ChangePasswordModal } from './modals/ChangePasswordModal';
import { AddRoleModal } from './modals/AddRoleModal';
import { AddLocationModal } from './modals/AddLocationModal';
import { DeleteAccountModal } from './modals/DeleteAccountModal';
import { useGetCurrentQuery, useUpdateCurrentOrgMutation, useGetSettingsQuery, useUpdateBrandingMutation, useGetLocationsQuery } from '../../../store/slices/adminSlices/organizationSlice';
import { API_BASE_URL, API_BASE_ROOT } from '../../../services/endpoints';
import { useAppSelector } from '../../../store/hooks';
import { useListManagersQuery, useUpdateManagerStatusMutation } from '../../../store/slices/adminSlices/hrSlice';
import { useGetNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from '../../../store/api/notificationsApi';

type TabKey = 'agency' | 'users' | 'notification';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<string, string> = {
  ADMIN: 'All Permissions',
  OPS_MANAGER: 'Managed Workers, Flagged Attendance',
  SHIFT_COORDINATOR: 'Shift Management',
  COMPLIANCE_OFFICER: 'Compliance Management',
  HR_MANAGER: 'HR Management',
};

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  ADMIN:              { bg: '#EDE9FE', color: '#7C3AED' },
  OPS_MANAGER:        { bg: '#DBEAFE', color: '#1D4ED8' },
  SHIFT_COORDINATOR:  { bg: '#D1FAE5', color: '#059669' },
  COMPLIANCE_OFFICER: { bg: '#FEF3C7', color: '#D97706' },
  HR_MANAGER:         { bg: '#FCE7F3', color: '#9D174D' },
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function notifIcon(type: string) {
  const t = type.toUpperCase();
  if (t.includes('SHIFT'))   return { icon: 'calendar-outline',      bg: '#FEF3C7', color: '#D97706' };
  if (t.includes('PAYROLL')) return { icon: 'cash-outline',          bg: '#D1FAE5', color: '#059669' };
  if (t.includes('HOLIDAY')) return { icon: 'sunny-outline',         bg: '#DBEAFE', color: '#1D4ED8' };
  if (t.includes('SYSTEM'))  return { icon: 'settings-outline',      bg: '#F3F4F6', color: '#6B7280' };
  return                            { icon: 'notifications-outline',  bg: '#EDE9FE', color: '#7C3AED' };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)   return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const { showToast } = useToast();

  const rowBg = isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB';
  const divider = isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6';

  // ── State ──
  const [activeTab, setActiveTab]             = useState<TabKey>('agency');
  const [isEditing, setIsEditing]             = useState(false);
  const [search, setSearch]                   = useState('');
  const [notifFilter, setNotifFilter]         = useState('All');
  const [passwordModalOpen, setPasswordModal] = useState(false);
  const [roleModalOpen, setRoleModal]         = useState(false);
  const [locationModalOpen, setLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [deleteAccountOpen, setDeleteAccount] = useState(false);
  const [savingOrg, setSavingOrg]             = useState(false);
  const [uploadingLogo, setUploadingLogo]     = useState(false);
  const [uploadingCover, setUploadingCover]   = useState(false);
  const [primaryColorInput, setPrimaryColor]  = useState('#000000');
  const [secondaryColorInput, setSecondaryColor] = useState('#ffffff');
  const [savingBranding, setSavingBranding]   = useState(false);

  // ── API queries ──
  const { data: org, isLoading: orgLoading, isError: orgError, refetch: refetchOrg } =
    useGetCurrentQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: settings, isLoading: settingsLoading, refetch: refetchSettings } =
    useGetSettingsQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: locationsData, isLoading: locationsLoading, refetch: refetchLocations } =
    useGetLocationsQuery(undefined, { refetchOnMountOrArgChange: true });
  const admin = useAppSelector((state) => state.auth.admin);
  const { data: managersData, isLoading: usersLoading, isError: usersError, refetch: refetchManagers } =
    useListManagersQuery({ page: 1, limit: 50, search: search || undefined }, { refetchOnMountOrArgChange: true });
  const { data: notifData, isLoading: notifLoading, isError: notifError, refetch: refetchNotifs } =
    useGetNotificationsQuery({ page: 1, limit: 30 }, { refetchOnMountOrArgChange: true });

  // ── Mutations ──
  const [updateCurrentOrg]     = useUpdateCurrentOrgMutation();
  const [updateBranding]        = useUpdateBrandingMutation();
  const [updateManagerStatus]   = useUpdateManagerStatusMutation();
  const token = useAppSelector((state) => state.auth.token);
  const [markAsRead]           = useMarkAsReadMutation();
  const [markAllRead]          = useMarkAllAsReadMutation();

  // ── Form state synced from API ──
  const [orgForm, setOrgForm] = useState({
    name: '', email: '', tradingName: '', registrationNumber: '',
    industry: '', website: '', phone: '',
  });

  useEffect(() => {
    if (org) {
      const o = (org as any)?.data ?? (org as any);
      setOrgForm({
        name:               o.name               ?? '',
        email:              o.email              ?? '',
        tradingName:        o.tradingName        ?? '',
        registrationNumber: o.registrationNumber ?? '',
        industry:           o.industry           ?? '',
        website:            o.website            ?? '',
        phone:              o.phone              ?? '',
      });
      setPrimaryColor(o.primaryColor   ?? '#000000');
      setSecondaryColor(o.secondaryColor ?? '#ffffff');
    }
  }, [org]);

  // ── Derived data ──
  const managers     = (managersData as any)?.data?.managers ?? (managersData as any)?.managers ?? [];
  const notifications = (notifData as any)?.notifications ?? (notifData as any)?.data ?? [];
  const unreadCount   = (notifData as any)?.unreadCount ?? notifications.filter((n: any) => !n.isRead).length;
  const locations    = Array.isArray(locationsData) ? locationsData : ((locationsData as any)?.data ?? []);
  const agencyLoading = orgLoading || settingsLoading;
  const agencyError   = orgError;

  const filteredNotifs = notifFilter === 'Unread'
    ? notifications.filter((n: any) => !n.isRead)
    : notifFilter === 'All'
      ? notifications
      : notifications.filter((n: any) => n.type.toUpperCase().includes(notifFilter.toUpperCase()));

  // ── Handlers ──
  const handlePickLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { showToast('Permission required to access photos', 'error'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if ((asset.fileSize ?? 0) > 2 * 1024 * 1024) { showToast('File too large. Max 2MB.', 'error'); return; }
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('file', { uri: asset.uri, name: asset.fileName ?? 'logo.jpg', type: asset.mimeType ?? 'image/jpeg' } as any);
      const res = await fetch(`${API_BASE_URL}/organizations/current/logo`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      if (!res.ok) throw new Error();
      showToast('Logo uploaded', 'success');
      refetchOrg();
    } catch { showToast('Failed to upload logo', 'error'); }
    finally { setUploadingLogo(false); }
  };

  const handlePickCover = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { showToast('Permission required to access photos', 'error'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [3, 1], quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if ((asset.fileSize ?? 0) > 5 * 1024 * 1024) { showToast('File too large. Max 5MB.', 'error'); return; }
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append('file', { uri: asset.uri, name: asset.fileName ?? 'cover.jpg', type: asset.mimeType ?? 'image/jpeg' } as any);
      const res = await fetch(`${API_BASE_URL}/organizations/current/cover`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      if (!res.ok) throw new Error();
      showToast('Cover image uploaded', 'success');
      refetchOrg();
    } catch { showToast('Failed to upload cover image', 'error'); }
    finally { setUploadingCover(false); }
  };

  const handleSaveBranding = async () => {
    setSavingBranding(true);
    try {
      await updateBranding({ primaryColor: primaryColorInput, secondaryColor: secondaryColorInput }).unwrap();
      showToast('Branding saved', 'success');
      refetchOrg();
    } catch { showToast('Failed to save branding', 'error'); }
    finally { setSavingBranding(false); }
  };

  const handleSaveOrg = async () => {
    try {
      setSavingOrg(true);
      await updateCurrentOrg({
        name:               orgForm.name               || undefined,
        phone:              orgForm.phone              || undefined,
        tradingName:        (orgForm as any).tradingName        || undefined,
        registrationNumber: (orgForm as any).registrationNumber || undefined,
        industry:           (orgForm as any).industry           || undefined,
        website:            (orgForm as any).website            || undefined,
      } as any).unwrap();
      showToast('Organisation settings saved', 'success');
      setIsEditing(false);
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setSavingOrg(false);
    }
  };

  const handleToggleStatus = async (managerId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateManagerStatus({ managerId, status: newStatus }).unwrap();
      showToast(`User ${newStatus.toLowerCase()}`, 'success');
      refetchManagers();
    } catch {
      showToast('Failed to update user status', 'error');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
      refetchNotifs();
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
      showToast('All notifications marked as read', 'success');
      refetchNotifs();
    } catch {
      showToast('Failed to mark all as read', 'error');
    }
  };

  // ── Tab renderers ──────────────────────────────────────────────────────────

  const renderAgencyProfile = () => {
    if (agencyLoading) {
      return (
        <View className="py-16 items-center gap-3">
          <ActivityIndicator size="large" color={primaryColor} />
          <Caption color="secondary" style={{ fontSize: 12 }}>Loading organisation details...</Caption>
        </View>
      );
    }

    if (agencyError || (!org && !orgLoading)) {
      return (
        <View className="py-16 items-center gap-3">
          <View className="w-14 h-14 rounded-full items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
            <Ionicons name="cloud-offline-outline" size={28} color="#DC2626" />
          </View>
          <Body className="font-outfit-semibold text-sm">Failed to load settings</Body>
          <Caption color="secondary" style={{ fontSize: 12 }}>Check your connection and try again</Caption>
          <TouchableOpacity
            className="flex-row items-center gap-2 px-5 py-3 rounded-xl mt-1"
            style={{ backgroundColor: primaryColor }}
            onPress={() => { refetchOrg(); refetchSettings(); }}
          >
            <Ionicons name="refresh-outline" size={16} color="#FFF" />
            <Body className="text-white font-outfit-semibold text-sm">Retry</Body>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="gap-4">
        {/* Org identity hero */}
        {(() => {
          const orgData = (org as any)?.data ?? (org as any);
          const logoUrl = orgData?.logoUrl;
          return (
            <Card className="p-4">
              <View className="flex-row items-center gap-4 mb-4">
                <View className="w-16 h-16 rounded-2xl items-center justify-center overflow-hidden" style={{ backgroundColor: primaryColor + '20' }}>
                  {logoUrl ? (
                    <Image
                      source={{ uri: logoUrl.startsWith('http') ? logoUrl : `${API_BASE_ROOT}${logoUrl}` }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons name="business" size={28} color={primaryColor} />
                  )}
                </View>
                <View className="flex-1">
                  <Body className="font-outfit-bold text-base">{orgData?.name ?? '—'}</Body>
                  <Caption color="secondary" className="text-xs">{orgData?.email ?? '—'}</Caption>
                  <View className="flex-row items-center gap-1 mt-1">
                    <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <Caption color="secondary" style={{ fontSize: 10 }}>Active Organisation</Caption>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setIsEditing(!isEditing)}
                  className="px-3 py-2 rounded-xl"
                  style={{ backgroundColor: isEditing ? '#FEE2E2' : primaryColor + '15' }}
                >
                  <Caption style={{ color: isEditing ? '#DC2626' : primaryColor, fontSize: 11, fontWeight: '600' }}>
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Caption>
                </TouchableOpacity>
              </View>
            </Card>
          );
        })()}

        {/* Organisation Details */}
        <Card className="p-4">
          <Body className="font-outfit-semibold mb-4">Organisation Details</Body>
          <View className="gap-3">
            {[
              { label: 'Organisation Name',   key: 'name',                 editable: true  },
              { label: 'Email Address',        key: 'email',                editable: false },
              { label: 'Trading Name',         key: 'tradingName',          editable: true  },
              { label: 'Company Number',       key: 'registrationNumber',   editable: true  },
              { label: 'Industry',             key: 'industry',             editable: true  },
              { label: 'Website',              key: 'website',              editable: true  },
              { label: 'Phone Number',         key: 'phone',                editable: true  },
            ].map(({ label, key, editable }) => (
              <View key={key}>
                <Caption color="secondary" className="mb-1.5 text-xs">{label}</Caption>
                {isEditing && editable ? (
                  <Input
                    value={(orgForm as any)[key]}
                    onChangeText={(v: string) => setOrgForm(f => ({ ...f, [key]: v }))}
                  />
                ) : (
                  <View className="px-4 py-3 rounded-xl" style={{ backgroundColor: rowBg }}>
                    <Body className="text-sm">{(orgForm as any)[key] || '—'}</Body>
                  </View>
                )}
              </View>
            ))}
          </View>
        </Card>

        {/* Branding */}
        <Card className="p-4">
          <Body className="font-outfit-semibold mb-4">Branding</Body>

          {/* Logo + Cover uploads */}
          <View className="flex-row gap-3 mb-5">
            {/* Logo */}
            <View className="flex-1">
              <Caption color="secondary" className="text-xs mb-2 font-outfit-semibold">Company Logo</Caption>
              <TouchableOpacity
                onPress={handlePickLogo}
                disabled={uploadingLogo}
                className="h-24 rounded-xl border-2 border-dashed items-center justify-center overflow-hidden"
                style={{ borderColor: isDark ? '#374151' : '#D1D5DB', backgroundColor: rowBg }}
              >
                {uploadingLogo ? (
                  <ActivityIndicator size="small" color={primaryColor} />
                ) : (() => { const u = ((org as any)?.data ?? (org as any))?.logoUrl; return u ? (
                  <Image source={{ uri: u.startsWith('http') ? u : `${API_BASE_ROOT}${u}` }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                ) : (
                  <View className="items-center gap-1">
                    <Ionicons name="cloud-upload-outline" size={24} color="#9CA3AF" />
                    <Caption color="secondary" style={{ fontSize: 10 }}>Upload Logo</Caption>
                  </View>
                ); })()}
              </TouchableOpacity>
              <Caption color="secondary" style={{ fontSize: 10, marginTop: 4 }}>PNG, JPG up to 2MB</Caption>
            </View>

            {/* Cover */}
            <View className="flex-1">
              <Caption color="secondary" className="text-xs mb-2 font-outfit-semibold">Cover Image</Caption>
              <TouchableOpacity
                onPress={handlePickCover}
                disabled={uploadingCover}
                className="h-24 rounded-xl border-2 border-dashed items-center justify-center overflow-hidden"
                style={{ borderColor: isDark ? '#374151' : '#D1D5DB', backgroundColor: rowBg }}
              >
                {uploadingCover ? (
                  <ActivityIndicator size="small" color={primaryColor} />
                ) : (() => { const u = ((org as any)?.data ?? (org as any))?.coverImageUrl; return u ? (
                  <Image source={{ uri: u.startsWith('http') ? u : `${API_BASE_ROOT}${u}` }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <View className="items-center gap-1">
                    <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                    <Caption color="secondary" style={{ fontSize: 10 }}>Upload Cover</Caption>
                  </View>
                ); })()}
              </TouchableOpacity>
              <Caption color="secondary" style={{ fontSize: 10, marginTop: 4 }}>PNG, JPG up to 5MB (1200×400)</Caption>
            </View>
          </View>

          {/* Color pickers */}
          <View className="gap-3 mb-4">
            {([
              { label: 'Primary Color',   value: primaryColorInput,   onChange: setPrimaryColor },
              { label: 'Secondary Color', value: secondaryColorInput, onChange: setSecondaryColor },
            ] as const).map(({ label, value, onChange }) => (
              <View key={label}>
                <Caption color="secondary" className="text-xs mb-2">{label}</Caption>
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-xl border" style={{ backgroundColor: value, borderColor: isDark ? '#374151' : '#D1D5DB' }} />
                  <View className="flex-1">
                    <Input value={value} onChangeText={onChange} placeholder="#000000" />
                  </View>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            className="py-3 rounded-xl flex-row items-center justify-center gap-2"
            style={{ backgroundColor: primaryColor, opacity: savingBranding ? 0.7 : 1 }}
            onPress={handleSaveBranding}
            disabled={savingBranding}
          >
            {savingBranding
              ? <ActivityIndicator size="small" color="#FFF" />
              : <Ionicons name="color-palette-outline" size={16} color="#FFF" />}
            <Body className="text-white font-outfit-semibold text-sm">Save Branding</Body>
          </TouchableOpacity>
        </Card>

        {/* Locations */}
        <Card className="p-4">
          <View className="flex-row items-center justify-between mb-4">
            <Body className="font-outfit-semibold">Locations</Body>
            <TouchableOpacity
              className="flex-row items-center gap-1 px-3 py-2 rounded-xl"
              style={{ borderColor: primaryColor, borderWidth: 1 }}
              onPress={() => { setEditingLocation(null); setLocationModal(true); }}
            >
              <Ionicons name="add" size={15} color={primaryColor} />
              <Caption style={{ color: primaryColor, fontSize: 11 }}>Add</Caption>
            </TouchableOpacity>
          </View>
          {locationsLoading ? (
            <View className="py-6 items-center">
              <ActivityIndicator size="small" color={primaryColor} />
            </View>
          ) : locations.length === 0 ? (
            <View className="py-6 items-center">
              <Ionicons name="location-outline" size={28} color="#9CA3AF" />
              <Caption color="secondary" className="text-xs mt-2">No locations added yet</Caption>
            </View>
          ) : (
            <View className="gap-3">
              {locations.map((loc: any) => (
                <View key={loc.id} className="p-4 rounded-xl" style={{ backgroundColor: rowBg }}>
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row items-start gap-3 flex-1">
                      <View className="w-8 h-8 rounded-full items-center justify-center mt-0.5" style={{ backgroundColor: primaryColor + '20' }}>
                        <Ionicons name="location" size={14} color={primaryColor} />
                      </View>
                      <View className="flex-1">
                        <Body className="font-outfit-semibold text-sm">{loc.name}</Body>
                        <Caption color="secondary" className="text-xs">{loc.address}</Caption>
                      </View>
                    </View>
                    <View className="flex-row items-center gap-2">
                      {loc.isPrimary && <Badge variant="success" className="text-[10px]">Primary</Badge>}
                      <TouchableOpacity onPress={() => { setEditingLocation(loc); setLocationModal(true); }}>
                        <Ionicons name="create-outline" size={17} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Admin Account */}
        <Card className="p-4">
          <View className="flex-row items-center justify-between mb-4">
            <Body className="font-outfit-semibold">My Account</Body>
            <TouchableOpacity
              className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{ backgroundColor: rowBg }}
              onPress={() => setPasswordModal(true)}
            >
              <Ionicons name="lock-closed-outline" size={14} color="#9CA3AF" />
              <Caption color="secondary" style={{ fontSize: 11 }}>Change Password</Caption>
            </TouchableOpacity>
          </View>
          <View className="gap-3">
            {[
              { label: 'Full Name',     value: (admin as any)?.fullName ?? '—' },
              { label: 'Email Address', value: (admin as any)?.email    ?? '—' },
              { label: 'Phone',         value: (admin as any)?.phone    ?? '—' },
            ].map(({ label, value }) => (
              <View key={label} className="flex-row items-center justify-between py-2" style={{ borderBottomWidth: 1, borderBottomColor: divider }}>
                <Caption color="secondary" className="text-xs">{label}</Caption>
                <Body className="text-sm font-outfit-semibold">{value}</Body>
              </View>
            ))}
          </View>
        </Card>

        {/* Save button */}
        {isEditing && (
          <TouchableOpacity
            className="py-4 rounded-xl items-center flex-row justify-center gap-2"
            style={{ backgroundColor: primaryColor, opacity: savingOrg ? 0.7 : 1 }}
            onPress={handleSaveOrg}
            disabled={savingOrg}
          >
            {savingOrg
              ? <ActivityIndicator size="small" color="#FFF" />
              : <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />}
            <Body className="text-white font-outfit-semibold">Save Changes</Body>
          </TouchableOpacity>
        )}

        {/* Danger Zone */}
        <Card className="p-4" style={{ borderColor: '#FECACA', backgroundColor: isDark ? '#450A0A' : '#FEF2F2' }}>
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="warning-outline" size={16} color="#DC2626" />
            <Body className="font-outfit-semibold" style={{ color: '#991B1B' }}>Danger Zone</Body>
          </View>
          <Caption className="text-xs mb-4" style={{ color: isDark ? '#FCA5A5' : '#7F1D1D' }}>
            Once you delete your account, there is no going back. Please be certain.
          </Caption>
          <TouchableOpacity
            className="py-3 rounded-xl items-center"
            style={{ borderColor: '#DC2626', borderWidth: 1 }}
            onPress={() => setDeleteAccount(true)}
          >
            <Body style={{ color: '#DC2626', fontSize: 14 }}>Delete Account</Body>
          </TouchableOpacity>
        </Card>
      </View>
    );
  };

  const renderUsersPermission = () => (
    <View className="gap-4">
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChangeText={setSearch}
            leftIcon={<Ionicons name="search-outline" size={18} color="#9CA3AF" />}
          />
        </View>
        <TouchableOpacity
          className="w-12 h-12 rounded-xl items-center justify-center"
          style={{ backgroundColor: rowBg }}
        >
          <Ionicons name="filter-outline" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {usersLoading ? (
        <View className="py-10 items-center gap-3">
          <ActivityIndicator size="large" color={primaryColor} />
          <Caption color="secondary" style={{ fontSize: 12 }}>Loading staff...</Caption>
        </View>
      ) : usersError ? (
        <View className="py-12 items-center gap-3">
          <Ionicons name="cloud-offline-outline" size={32} color="#DC2626" />
          <Body className="font-outfit-semibold text-sm">Failed to load staff</Body>
          <TouchableOpacity
            className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ backgroundColor: primaryColor }}
            onPress={() => refetchManagers()}
          >
            <Ionicons name="refresh-outline" size={14} color="#FFF" />
            <Caption style={{ color: '#FFF', fontSize: 12 }}>Retry</Caption>
          </TouchableOpacity>
        </View>
      ) : managers.length === 0 ? (
        <View className="py-12 items-center gap-2">
          <Ionicons name="people-outline" size={40} color="#9CA3AF" />
          <Body className="font-outfit-semibold text-sm">No staff found</Body>
          <Caption color="secondary" className="text-xs">Invite staff using the button above</Caption>
        </View>
      ) : (
        <View className="gap-3">
          {managers.map((user: any) => {
            const roleStyle = ROLE_COLORS[user.role] ?? { bg: '#F3F4F6', color: '#6B7280' };
            return (
              <Card key={user.id} className="p-4">
                {/* Avatar + name row */}
                <View className="flex-row items-center gap-3 mb-3">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: roleStyle.bg }}
                  >
                    <Body className="text-sm font-outfit-bold" style={{ color: roleStyle.color }}>
                      {getInitials(user.fullName)}
                    </Body>
                  </View>
                  <View className="flex-1">
                    <Body className="font-outfit-semibold">{user.fullName}</Body>
                    <Caption color="secondary" className="text-xs">{user.email}</Caption>
                  </View>
                  <View
                    className="px-2 py-1 rounded-full"
                    style={{ backgroundColor: user.status === 'ACTIVE' ? '#D1FAE5' : '#FEE2E2' }}
                  >
                    <Caption style={{ color: user.status === 'ACTIVE' ? '#059669' : '#DC2626', fontSize: 10, fontWeight: '600' }}>
                      {user.status}
                    </Caption>
                  </View>
                </View>

                {/* Role + permissions */}
                <View className="flex-row gap-3 mb-3">
                  <View className="flex-1 p-2.5 rounded-xl" style={{ backgroundColor: roleStyle.bg }}>
                    <Caption style={{ color: roleStyle.color, fontSize: 10, fontWeight: '600' }}>ROLE</Caption>
                    <Body className="text-xs font-outfit-semibold mt-0.5" style={{ color: roleStyle.color }}>
                      {user.role.replace(/_/g, ' ')}
                    </Body>
                  </View>
                  <View className="flex-1 p-2.5 rounded-xl" style={{ backgroundColor: rowBg }}>
                    <Caption color="secondary" style={{ fontSize: 10, fontWeight: '600' }}>ACCESS</Caption>
                    <Caption color="secondary" className="text-xs mt-0.5" numberOfLines={2}>
                      {ROLE_PERMISSIONS[user.role] ?? 'Standard Access'}
                    </Caption>
                  </View>
                </View>

                {/* Last login */}
                {user.lastLoginAt && (
                  <View className="flex-row items-center gap-1.5 mb-3">
                    <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                    <Caption color="secondary" style={{ fontSize: 11 }}>Last active {timeAgo(user.lastLoginAt)}</Caption>
                  </View>
                )}

                {/* Actions */}
                <View className="flex-row gap-2 pt-3" style={{ borderTopWidth: 1, borderTopColor: divider }}>
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl gap-1"
                    style={{ backgroundColor: rowBg }}
                  >
                    <Ionicons name="create-outline" size={14} color="#9CA3AF" />
                    <Caption color="secondary" style={{ fontSize: 11 }}>Edit Role</Caption>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl gap-1"
                    style={{ backgroundColor: user.status === 'ACTIVE' ? '#FEF3C7' : '#D1FAE5' }}
                    onPress={() => handleToggleStatus(user.id, user.status)}
                  >
                    <Ionicons
                      name={user.status === 'ACTIVE' ? 'pause-circle-outline' : 'play-circle-outline'}
                      size={14}
                      color={user.status === 'ACTIVE' ? '#D97706' : '#059669'}
                    />
                    <Caption style={{ fontSize: 11, color: user.status === 'ACTIVE' ? '#D97706' : '#059669', fontWeight: '600' }}>
                      {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </Caption>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderNotification = () => {
    const FILTERS = ['All', 'Unread', 'SHIFT', 'PAYROLL', 'HOLIDAY', 'SYSTEM'];

    return (
      <View className="gap-4">
        {/* Header row */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Body className="font-outfit-semibold">Notifications</Body>
            {unreadCount > 0 && (
              <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: primaryColor }}>
                <Caption className="text-white" style={{ fontSize: 10 }}>{unreadCount}</Caption>
              </View>
            )}
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{ backgroundColor: rowBg }}
            onPress={handleMarkAllRead}
          >
            <Ionicons name="checkmark-done" size={15} color="#9CA3AF" />
            <Caption color="secondary" style={{ fontSize: 11 }}>Mark all read</Caption>
          </TouchableOpacity>
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-grow-0">
          <View className="flex-row gap-2 pb-1">
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                className="px-4 py-2 rounded-full"
                style={notifFilter === f
                  ? { backgroundColor: primaryColor }
                  : { backgroundColor: rowBg }}
                onPress={() => setNotifFilter(f)}
              >
                <Caption style={{ fontSize: 12, color: notifFilter === f ? '#FFF' : (isDark ? '#9CA3AF' : '#6B7280'), fontWeight: '600' }}>
                  {f === 'All' ? 'All' : f === 'Unread' ? `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` : f.charAt(0) + f.slice(1).toLowerCase()}
                </Caption>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* List */}
        {notifLoading ? (
          <View className="py-10 items-center gap-3">
            <ActivityIndicator size="large" color={primaryColor} />
            <Caption color="secondary" style={{ fontSize: 12 }}>Loading notifications...</Caption>
          </View>
        ) : notifError ? (
          <View className="py-12 items-center gap-3">
            <Ionicons name="cloud-offline-outline" size={32} color="#DC2626" />
            <Body className="font-outfit-semibold text-sm">Failed to load notifications</Body>
            <TouchableOpacity
              className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ backgroundColor: primaryColor }}
              onPress={() => refetchNotifs()}
            >
              <Ionicons name="refresh-outline" size={14} color="#FFF" />
              <Caption style={{ color: '#FFF', fontSize: 12 }}>Retry</Caption>
            </TouchableOpacity>
          </View>
        ) : filteredNotifs.length === 0 ? (
          <View className="py-12 items-center gap-2">
            <Ionicons name="notifications-off-outline" size={40} color="#9CA3AF" />
            <Body className="font-outfit-semibold text-sm">No notifications</Body>
          </View>
        ) : (
          <View className="gap-2">
            {filteredNotifs.map((notif: any) => {
              const style = notifIcon(notif.type);
              return (
                <TouchableOpacity
                  key={notif.id}
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: notif.isRead ? rowBg : (isDark ? 'rgba(99,102,241,0.12)' : '#EEF2FF'),
                    borderWidth: notif.isRead ? 0 : 1,
                    borderColor: isDark ? 'rgba(99,102,241,0.3)' : '#C7D2FE',
                  }}
                  onPress={() => !notif.isRead && handleMarkRead(notif.id)}
                >
                  <View className="flex-row gap-3">
                    <View className="w-10 h-10 rounded-full items-center justify-center flex-shrink-0" style={{ backgroundColor: style.bg }}>
                      <Ionicons name={style.icon as any} size={18} color={style.color} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-start justify-between gap-2">
                        <Body className="font-outfit-semibold text-sm flex-1">{notif.title}</Body>
                        <Caption color="secondary" style={{ fontSize: 10, flexShrink: 0 }}>{timeAgo(notif.createdAt)}</Caption>
                      </View>
                      <Caption color="secondary" className="text-xs mt-1">{notif.body}</Caption>
                      {!notif.isRead && (
                        <View className="flex-row items-center gap-1 mt-2">
                          <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                          <Caption style={{ color: primaryColor, fontSize: 10 }}>Tap to mark as read</Caption>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const TAB_LABELS: Record<TabKey, string> = {
    agency: 'Agency Profile',
    users: 'Users & Roles',
    notification: 'Notifications',
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>

      {/* ── Header ── */}
      <View className="px-5 pt-2 pb-3 flex-row items-center gap-3">
        {navigation.canGoBack() && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={isDark ? '#FFF' : '#000035'} />
          </TouchableOpacity>
        )}
        <View className="flex-1">
          <H2>Settings</H2>
          <Caption color="secondary">Manage your agency profile and team</Caption>
        </View>
        {/* Tab-specific action button */}
        {activeTab === 'agency' && (
          <TouchableOpacity
            className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{ backgroundColor: rowBg }}
            onPress={() => setPasswordModal(true)}
          >
            <Ionicons name="lock-closed-outline" size={14} color="#9CA3AF" />
            <Caption color="secondary" style={{ fontSize: 11 }}>Password</Caption>
          </TouchableOpacity>
        )}
        {activeTab === 'users' && (
          <TouchableOpacity
            className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{ backgroundColor: primaryColor }}
            onPress={() => setRoleModal(true)}
          >
            <Ionicons name="person-add-outline" size={14} color="#FFF" />
            <Caption className="text-white font-outfit-semibold" style={{ fontSize: 11 }}>Invite</Caption>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Tabs ── */}
      <View className="flex-row px-5" style={{ borderBottomWidth: 1, borderBottomColor: divider }}>
        {(['agency', 'users', 'notification'] as TabKey[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            className="flex-1 py-3"
            style={activeTab === tab ? { borderBottomWidth: 2, borderBottomColor: primaryColor } : {}}
            onPress={() => setActiveTab(tab)}
          >
            <View className="flex-row items-center justify-center gap-1">
              <Caption
                className="text-center font-outfit-semibold"
                style={{ fontSize: 12, color: activeTab === tab ? primaryColor : (isDark ? '#9CA3AF' : '#6B7280') }}
              >
                {TAB_LABELS[tab]}
              </Caption>
              {tab === 'notification' && unreadCount > 0 && (
                <View className="w-4 h-4 rounded-full items-center justify-center" style={{ backgroundColor: primaryColor }}>
                  <Caption className="text-white" style={{ fontSize: 9 }}>{unreadCount}</Caption>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ── */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16 }}>
        {activeTab === 'agency'       && renderAgencyProfile()}
        {activeTab === 'users'        && renderUsersPermission()}
        {activeTab === 'notification' && renderNotification()}
        <View className="h-24" />
      </ScrollView>

      {/* ── Modals ── */}
      <ChangePasswordModal open={passwordModalOpen} onClose={() => setPasswordModal(false)} />
      <AddRoleModal open={roleModalOpen} onClose={() => { setRoleModal(false); refetchManagers(); }} />
      <AddLocationModal
        open={locationModalOpen}
        onClose={() => { setLocationModal(false); setEditingLocation(null); }}
        editLocation={editingLocation}
      />
      <DeleteAccountModal
        open={deleteAccountOpen}
        onClose={() => setDeleteAccount(false)}
        onConfirm={() => setDeleteAccount(false)}
      />
    </View>
  );
}

export default SettingsScreen;
