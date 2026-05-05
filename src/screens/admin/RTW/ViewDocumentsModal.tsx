import React, { useState } from 'react';
import { View, Modal, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme, useTheme, useToast } from '../../../contexts';
import { H3, Body, Caption, Card, Badge } from '../../../components/ui';
import { useGetComplianceDocumentsQuery, useVerifyComplianceDocumentMutation, ComplianceDocument } from '../../../store/slices/adminSlices/complianceSlice';
import { API_BASE_ROOT } from '../../../services/endpoints';

// ─── Types ─────────────────────────────────────────────────────────────────

type Document = ComplianceDocument & { mimeType?: string };

interface ViewDocumentsModalProps {
  visible: boolean;
  onClose: () => void;
  worker: any;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

const getDocIcon = (type?: string, mimeType?: string): string => {
  if (mimeType?.includes('image'))  return 'image-outline';
  if (mimeType?.includes('pdf'))    return 'document-outline';
  const t = (type ?? '').toUpperCase();
  if (t.includes('PASSPORT'))       return 'card-outline';
  if (t.includes('VISA'))           return 'airplane-outline';
  if (t.includes('LICENCE') || t.includes('LICENSE')) return 'car-outline';
  if (t.includes('DBS'))            return 'shield-checkmark-outline';
  if (t.includes('SIA'))            return 'shield-outline';
  if (t.includes('CERT') || t.includes('TRAINING'))   return 'ribbon-outline';
  if (t.includes('FIRST_AID'))      return 'medkit-outline';
  return 'document-text-outline';
};

const getDocAccentColor = (type?: string): { bg: string; color: string } => {
  const t = (type ?? '').toUpperCase();
  if (t.includes('PASSPORT') || t.includes('VISA'))        return { bg: '#DBEAFE', color: '#2563EB' };
  if (t.includes('DBS'))                                   return { bg: '#D1FAE5', color: '#059669' };
  if (t.includes('SIA'))                                   return { bg: '#EDE9FE', color: '#7C3AED' };
  if (t.includes('LICENCE') || t.includes('LICENSE'))      return { bg: '#FEF3C7', color: '#D97706' };
  if (t.includes('CERT') || t.includes('FIRST') || t.includes('TRAINING')) return { bg: '#FFEDD5', color: '#EA580C' };
  return { bg: '#F3F4F6', color: '#6B7280' };
};

const isExpiringSoon = (expiresAt?: string | null): boolean => {
  if (!expiresAt) return false;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000; // within 30 days
};

const isExpired = (expiresAt?: string | null): boolean => {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
};

// ─── Document type pill ────────────────────────────────────────────────────

function DocTypePill({ label, accent }: { label: string; accent: { bg: string; color: string } }) {
  return (
    <View className="px-2 py-0.5 rounded-full self-start" style={{ backgroundColor: accent.bg }}>
      <Caption className="text-[10px] font-outfit-medium" style={{ color: accent.color }}>{label}</Caption>
    </View>
  );
}

// ─── Filter tab ────────────────────────────────────────────────────────────

function FilterTab({ label, active, count, onPress, primaryColor }: {
  label: string; active: boolean; count: number; onPress: () => void; primaryColor: string;
}) {
  const { isDark } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center gap-1.5 px-4 py-2 rounded-full"
      style={{ backgroundColor: active ? primaryColor : (isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6') }}
    >
      <Body className="text-xs font-outfit-semibold" style={{ color: active ? '#FFF' : (isDark ? '#D1D5DB' : '#374151') }}>
        {label}
      </Body>
      {count > 0 && (
        <View
          className="w-4 h-4 rounded-full items-center justify-center"
          style={{ backgroundColor: active ? 'rgba(255,255,255,0.25)' : (isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB') }}
        >
          <Caption className="text-[9px] font-outfit-bold" style={{ color: active ? '#FFF' : '#9CA3AF' }}>{count}</Caption>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Document card ─────────────────────────────────────────────────────────

function DocumentCard({ item, primaryColor, isDark, onVerify, onView }: {
  item: Document; primaryColor: string; isDark: boolean;
  onVerify: (id: string) => void; onView: (url: string) => void;
}) {
  const accent     = getDocAccentColor(item.documentType || item.type);
  const docIcon    = getDocIcon(item.documentType || item.type, item.mimeType);
  const expiringSoon = isExpiringSoon(item.expiresAt);
  const expired      = isExpired(item.expiresAt);
  const label        = item.title || item.documentType || item.type || 'Document';

  return (
    <Card className="p-4">
      {/* ── Top row ── */}
      <View className="flex-row items-start gap-3 mb-3">
        {/* Doc type icon */}
        <View
          className="w-11 h-11 rounded-xl items-center justify-center shrink-0"
          style={{ backgroundColor: accent.bg }}
        >
          <Ionicons name={docIcon as any} size={20} color={accent.color} />
        </View>

        {/* Title + meta */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-0.5">
            <Body className="font-outfit-semibold text-sm flex-1 pr-2" numberOfLines={1}>{label}</Body>
            <Badge variant={item.verified ? 'success' : 'warning'} className="text-[10px] shrink-0">
              {item.verified ? 'Verified' : 'Pending'}
            </Badge>
          </View>

          {/* Doc type pill */}
          {item.documentType && item.documentType !== label && (
            <DocTypePill label={item.documentType} accent={accent} />
          )}

          {item.documentNumber && (
            <View className="flex-row items-center gap-1 mt-1">
              <Ionicons name="barcode-outline" size={11} color="#9CA3AF" />
              <Caption color="secondary" className="text-[10px]">#{item.documentNumber}</Caption>
            </View>
          )}
        </View>
      </View>

      {/* ── Date info strip ── */}
      <View
        className="flex-row gap-3 px-3 py-2 rounded-xl mb-3"
        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}
      >
        {item.createdAt && (
          <View className="flex-row items-center gap-1.5 flex-1">
            <Ionicons name="cloud-upload-outline" size={12} color="#9CA3AF" />
            <Caption color="secondary" className="text-[10px]">Uploaded {item.createdAt}</Caption>
          </View>
        )}
        {item.expiresAt && (
          <View className="flex-row items-center gap-1.5 flex-1">
            <Ionicons
              name="time-outline"
              size={12}
              color={expired ? '#EF4444' : expiringSoon ? '#F59E0B' : '#9CA3AF'}
            />
            <Caption
              className="text-[10px]"
              style={{ color: expired ? '#EF4444' : expiringSoon ? '#F59E0B' : undefined }}
              color={expired || expiringSoon ? undefined : 'secondary'}
            >
              {expired ? 'Expired ' : expiringSoon ? 'Expires soon ' : 'Expires '}
              {item.expiresAt}
            </Caption>
          </View>
        )}
      </View>

      {/* ── Expiry warning ── */}
      {(expired || expiringSoon) && (
        <View
          className="flex-row items-center gap-2 px-3 py-2 rounded-xl mb-3"
          style={{
            backgroundColor: expired
              ? (isDark ? 'rgba(239,68,68,0.12)' : '#FEE2E2')
              : (isDark ? 'rgba(245,158,11,0.12)' : '#FFFBEB'),
          }}
        >
          <Ionicons
            name="alert-circle-outline"
            size={13}
            color={expired ? '#EF4444' : '#F59E0B'}
          />
          <Caption
            className="text-[10px] flex-1"
            style={{ color: expired ? '#DC2626' : '#92400E' }}
          >
            {expired
              ? 'This document has expired. A new document must be uploaded.'
              : 'This document expires within 30 days. Request renewal soon.'}
          </Caption>
        </View>
      )}

      {/* ── Actions ── */}
      <View className="flex-row gap-2 pt-3 border-t border-light-border-light dark:border-dark-border-light">
        {!item.verified && (
          <TouchableOpacity
            onPress={() => onVerify(item.id)}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl"
            style={{ backgroundColor: primaryColor }}
          >
            <Ionicons name="checkmark-circle-outline" size={14} color="#FFF" />
            <Body className="text-xs text-white font-outfit-medium">Verify</Body>
          </TouchableOpacity>
        )}
        {item.fileUrl && (
          <TouchableOpacity
            onPress={() => onView(item.fileUrl!)}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-light-background-secondary dark:bg-dark-background-secondary"
          >
            <Ionicons name="eye-outline" size={14} color={isDark ? '#FFF' : '#374151'} />
            <Body className="text-xs">View File</Body>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="w-9 h-9 items-center justify-center rounded-xl bg-light-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons name="ellipsis-horizontal" size={14} color={isDark ? '#FFF' : '#374151'} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

// ─── Main modal ────────────────────────────────────────────────────────────

const formatDocDate = (iso: string | null | undefined) => {
  if (!iso) return undefined;
  try { return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
};

export function ViewDocumentsModal({ visible, onClose, worker }: ViewDocumentsModalProps) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const { showToast } = useToast();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'EXPIRING'>('ALL');

  const { data: docsData, isLoading: docsLoading, isError: docsError, refetch: refetchDocs } =
    useGetComplianceDocumentsQuery(worker?.id ?? '', { skip: !worker?.id || !visible, refetchOnMountOrArgChange: true });

  const [verifyDocument] = useVerifyComplianceDocumentMutation();

  const documents: Document[] = (docsData ?? []).map((d: any) => ({
    ...d,
    fileUrl: d.fileUrl && !d.fileUrl.startsWith('http') ? `${API_BASE_ROOT}${d.fileUrl}` : d.fileUrl,
    createdAt: formatDocDate(d.createdAt),
    expiresAt: formatDocDate(d.expiresAt),
  }));

  const handleVerifyDocument = async (docId: string) => {
    try {
      await verifyDocument({ workerId: worker?.id, docId }).unwrap();
      showToast('Document verified', 'success');
      refetchDocs();
    } catch (e: any) {
      showToast(e?.data?.message ?? 'Failed to verify document', 'error');
    }
  };
  const handleViewDocument = (fileUrl: string) => Linking.openURL(fileUrl);

  // ── Derived counts ───────────────────────────────────────────────────
  const pendingCount  = documents.filter(d => !d.verified).length;
  const verifiedCount = documents.filter(d => d.verified).length;
  const expiringCount = documents.filter(d => isExpiringSoon(d.expiresAt) || isExpired(d.expiresAt)).length;

  const filtered = documents.filter(d => {
    if (activeFilter === 'PENDING')  return !d.verified;
    if (activeFilter === 'VERIFIED') return d.verified;
    if (activeFilter === 'EXPIRING') return isExpiringSoon(d.expiresAt) || isExpired(d.expiresAt);
    return true;
  });

  // ── Summary stats ────────────────────────────────────────────────────
  const stats = [
    { icon: 'documents-outline',      color: '#2563EB', bg: '#DBEAFE', label: 'Total',    value: documents.length },
    { icon: 'checkmark-circle',       color: '#10B981', bg: '#D1FAE5', label: 'Verified', value: verifiedCount   },
    { icon: 'time-outline',           color: '#F59E0B', bg: '#FEF3C7', label: 'Pending',  value: pendingCount    },
    { icon: 'alert-circle-outline',   color: '#EF4444', bg: '#FFE4E6', label: 'Expiring', value: expiringCount   },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary">

        {/* ── Header ──────────────────────────────────────────────── */}
        <View
          className="flex-row items-center justify-between px-5 pb-3 border-b border-light-border-light dark:border-dark-border-light"
          style={{ paddingTop: insets.top + 12 }}
        >
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 rounded-full items-center justify-center bg-light-background-secondary dark:bg-dark-background-secondary"
          >
            <Ionicons name="close" size={20} color={isDark ? '#FFF' : '#374151'} />
          </TouchableOpacity>
          <View className="items-center">
            <H3>Worker Documents</H3>
            {worker && (
              <Caption color="secondary" className="text-[10px]">{worker.fullName}</Caption>
            )}
          </View>
          {/* Upload placeholder (right balance) */}
          <TouchableOpacity
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: primaryColor + '20' }}
          >
            <Ionicons name="cloud-upload-outline" size={18} color={primaryColor} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-5 pt-5">

            {/* ── Worker card ─────────────────────────────────────── */}
            {worker && (
              <Card className="p-4 mb-5">
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: primaryColor + '20' }}
                  >
                    <Body className="font-outfit-bold text-sm" style={{ color: primaryColor }}>
                      {getInitials(worker.fullName)}
                    </Body>
                  </View>
                  <View className="flex-1">
                    <Body className="font-outfit-semibold text-base">{worker.fullName}</Body>
                    <Caption color="secondary" className="text-xs">{worker.email}</Caption>
                  </View>
                  {/* Overall doc health indicator */}
                  {documents.length > 0 && (
                    <View className="items-end">
                      <Body
                        className="font-outfit-bold text-lg"
                        style={{ color: pendingCount === 0 ? '#10B981' : '#F59E0B' }}
                      >
                        {Math.round((verifiedCount / documents.length) * 100)}%
                      </Body>
                      <Caption color="secondary" className="text-[10px]">verified</Caption>
                    </View>
                  )}
                </View>

                {/* Mini progress bar */}
                {documents.length > 0 && (
                  <View className="mt-3">
                    <View
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB' }}
                    >
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round((verifiedCount / documents.length) * 100)}%`,
                          backgroundColor: pendingCount === 0 ? '#10B981' : '#F59E0B',
                        }}
                      />
                    </View>
                  </View>
                )}
              </Card>
            )}

            {/* ── Stat row ────────────────────────────────────────── */}
            {documents.length > 0 && (
              <View className="flex-row gap-2 mb-5">
                {stats.map((s, i) => (
                  <View
                    key={i}
                    className="flex-1 items-center py-3 rounded-xl"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#E5E7EB' }}
                  >
                    <View
                      className="w-7 h-7 rounded-lg items-center justify-center mb-1.5"
                      style={{ backgroundColor: s.bg }}
                    >
                      <Ionicons name={s.icon as any} size={14} color={s.color} />
                    </View>
                    <Body className="font-outfit-bold text-base">{s.value}</Body>
                    <Caption color="secondary" className="text-[9px]">{s.label}</Caption>
                  </View>
                ))}
              </View>
            )}

            {/* ── Filter pills ────────────────────────────────────── */}
            {documents.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
                className="mb-4"
              >
                {[
                  { key: 'ALL',      label: 'All',      count: documents.length },
                  { key: 'PENDING',  label: 'Pending',  count: pendingCount     },
                  { key: 'VERIFIED', label: 'Verified', count: verifiedCount    },
                  { key: 'EXPIRING', label: 'Expiring', count: expiringCount    },
                ].map(f => (
                  <FilterTab
                    key={f.key}
                    label={f.label}
                    count={f.count}
                    active={activeFilter === f.key as any}
                    onPress={() => setActiveFilter(f.key as any)}
                    primaryColor={primaryColor}
                  />
                ))}
              </ScrollView>
            )}

            {/* ── Section label ────────────────────────────────────── */}
            <View className="flex-row items-center justify-between mb-3">
              <Body className="font-outfit-semibold text-sm">
                Documents{' '}
                <Caption color="secondary">{filtered.length}</Caption>
              </Body>
            </View>

            {/* ── Loading state ──────────────────────────────────────── */}
            {docsLoading ? (
              <View className="items-center justify-center py-16 gap-3">
                <ActivityIndicator size="large" color={primaryColor} />
                <Caption color="secondary" className="text-xs">Loading documents…</Caption>
              </View>
            ) : docsError ? (
              <View className="items-center justify-center py-16 gap-3">
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : '#FEE2E2' }}
                >
                  <Ionicons name="alert-circle-outline" size={30} color="#EF4444" />
                </View>
                <Body className="font-outfit-semibold text-sm">Failed to load documents</Body>
                <TouchableOpacity
                  onPress={() => refetchDocs()}
                  className="px-5 py-3 rounded-xl flex-row items-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Ionicons name="refresh-outline" size={16} color="#FFF" />
                  <Body className="text-white font-outfit-semibold text-sm">Retry</Body>
                </TouchableOpacity>
              </View>
            ) : filtered.length === 0 ? (
              <View className="items-center justify-center py-16 gap-3">
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6' }}
                >
                  <Ionicons name="document-text-outline" size={30} color="#9CA3AF" />
                </View>
                <Body className="font-outfit-semibold text-sm">No documents found</Body>
                <Caption color="secondary" className="text-xs text-center">
                  {activeFilter === 'ALL'
                    ? 'No documents have been uploaded for this worker yet.'
                    : `No ${activeFilter.toLowerCase()} documents to show.`}
                </Caption>
              </View>
            ) : (
              <View className="gap-3">
                {filtered.map(doc => (
                  <DocumentCard
                    key={doc.id}
                    item={doc}
                    primaryColor={primaryColor}
                    isDark={isDark}
                    onVerify={handleVerifyDocument}
                    onView={handleViewDocument}
                  />
                ))}
              </View>
            )}

          </View>
          <View className="h-24" />
        </ScrollView>
      </View>
    </Modal>
  );
}

export default ViewDocumentsModal;
