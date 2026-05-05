import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOrgTheme, useTheme, useToast } from '../../contexts';
import { H2, H3, Body, Caption, Card, Badge, PaginatedCardList } from '../../components/ui';
import type { FilterOption } from '../../components/ui/PaginatedCardList';
import {
  useGetInviteRequestsQuery,
  useReviewInviteRequestMutation,
} from '../../store/slices/adminSlices/inviteRequestSlice';
import type { InviteCodeRequest } from '../../store/slices/adminSlices/inviteRequestSlice';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
}

const STATUS_FILTERS: FilterOption[] = [
  { label: 'Pending',  value: 'PENDING'  },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
  PENDING:  { bg: '#FEF3C7', color: '#D97706', icon: 'time-outline'           },
  APPROVED: { bg: '#D1FAE5', color: '#059669', icon: 'checkmark-circle-outline' },
  REJECTED: { bg: '#FFE4E6', color: '#DC2626', icon: 'close-circle-outline'   },
};

// ─── Detail / Reject modals ────────────────────────────────────────────────────

interface DetailModalProps {
  request: InviteCodeRequest;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  reviewing: boolean;
  isDark: boolean;
  primaryColor: string;
}

function DetailModal({ request, onClose, onApprove, onReject, reviewing, isDark, primaryColor }: DetailModalProps) {
  const st = STATUS_STYLE[request.status] ?? STATUS_STYLE.PENDING;
  const rowBg = isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB';
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View
          className="rounded-t-3xl p-6"
          style={{ backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF', maxHeight: '85%' }}
        >
          <View className="flex-row items-center justify-between mb-5">
            <H3 className="font-outfit-bold text-base">Request Details</H3>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={isDark ? '#FFF' : '#374151'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Avatar + name */}
            <View className="items-center mb-5">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: primaryColor }}
              >
                <Body className="text-white text-xl font-outfit-bold">{getInitials(request.fullName)}</Body>
              </View>
              <Body className="font-outfit-bold text-base">{request.fullName}</Body>
              <View
                className="flex-row items-center gap-1 px-3 py-1 rounded-full mt-1"
                style={{ backgroundColor: st.bg }}
              >
                <Ionicons name={st.icon as any} size={13} color={st.color} />
                <Caption style={{ color: st.color, fontSize: 12, fontWeight: '600' }}>{request.status}</Caption>
              </View>
            </View>

            {/* Detail rows */}
            {[
              { icon: 'mail-outline',     label: 'Email',     value: request.email },
              { icon: 'call-outline',     label: 'Phone',     value: request.phone || 'Not provided' },
              { icon: 'calendar-outline', label: 'Submitted', value: `${formatDate(request.createdAt)} at ${formatTime(request.createdAt)}` },
              ...(request.reviewer ? [{ icon: 'person-outline', label: 'Reviewed By', value: request.reviewer.fullName }] : []),
              ...(request.notes    ? [{ icon: 'document-text-outline', label: 'Notes', value: request.notes }] : []),
            ].map(({ icon, label, value }) => (
              <View
                key={label}
                className="flex-row items-center gap-3 p-3 rounded-xl mb-2"
                style={{ backgroundColor: rowBg }}
              >
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB' }}
                >
                  <Ionicons name={icon as any} size={15} color={isDark ? '#9CA3AF' : '#6B7280'} />
                </View>
                <View className="flex-1">
                  <Caption color="secondary" className="text-xs">{label}</Caption>
                  <Body className="text-sm">{value}</Body>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Actions */}
          {request.status === 'PENDING' && (
            <View className="flex-row gap-3 mt-5">
              <TouchableOpacity
                onPress={() => onReject(request.id)}
                disabled={reviewing}
                className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl border"
                style={{ borderColor: '#DC2626' }}
              >
                <Ionicons name="close-circle-outline" size={17} color="#DC2626" />
                <Body style={{ color: '#DC2626', fontWeight: '600', fontSize: 14 }}>Reject</Body>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onApprove(request.id)}
                disabled={reviewing}
                className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl"
                style={{ backgroundColor: '#059669' }}
              >
                {reviewing ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={17} color="#FFF" />
                    <Body className="text-white font-outfit-semibold text-sm">Approve</Body>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

interface RejectModalProps {
  onClose: () => void;
  onConfirm: (notes: string) => void;
  reviewing: boolean;
  isDark: boolean;
}

function RejectModal({ onClose, onConfirm, reviewing, isDark }: RejectModalProps) {
  const [notes, setNotes] = useState('');
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center px-5 bg-black/50">
        <View
          className="w-full rounded-2xl p-6"
          style={{ backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }}
        >
          <H3 className="font-outfit-bold text-base mb-2">Reject Request</H3>
          <Caption color="secondary" className="text-sm mb-4">
            You can optionally provide a reason for rejection.
          </Caption>
          <View
            className="rounded-xl border mb-4"
            style={{
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F9FAFB',
            }}
          >
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Reason for rejection (optional)"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              style={{
                padding: 12,
                color: isDark ? '#FFF' : '#111827',
                fontSize: 14,
                fontFamily: 'Outfit-Regular',
                minHeight: 80,
                textAlignVertical: 'top',
              }}
            />
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-3.5 rounded-xl items-center"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }}
            >
              <Body className="font-outfit-medium text-sm">Cancel</Body>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirm(notes)}
              disabled={reviewing}
              className="flex-1 py-3.5 rounded-xl items-center"
              style={{ backgroundColor: '#DC2626' }}
            >
              {reviewing ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Body className="text-white font-outfit-semibold text-sm">Reject</Body>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────────

export function InviteRequestsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const toast = useToast();

  const [detailRequest, setDetailRequest] = useState<InviteCodeRequest | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useGetInviteRequestsQuery();
  const [reviewRequest, { isLoading: reviewing }] = useReviewInviteRequestMutation();

  const allRequests = data?.data ?? [];

  const stats = useMemo(() => ({
    total:    allRequests.length,
    pending:  allRequests.filter((r) => r.status === 'PENDING').length,
    approved: allRequests.filter((r) => r.status === 'APPROVED').length,
    rejected: allRequests.filter((r) => r.status === 'REJECTED').length,
  }), [allRequests]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleApprove = async (id: string) => {
    try {
      await reviewRequest({ id, status: 'APPROVED' }).unwrap();
      toast.success('Request approved');
      setDetailRequest(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to approve request');
    }
  };

  const openReject = (id: string) => {
    setDetailRequest(null);
    setRejectTargetId(id);
  };

  const handleRejectConfirm = async (notes: string) => {
    if (!rejectTargetId) return;
    try {
      await reviewRequest({ id: rejectTargetId, status: 'REJECTED', notes: notes || undefined }).unwrap();
      toast.success('Request rejected');
      setRejectTargetId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to reject request');
    }
  };

  // ─── Card renderer ────────────────────────────────────────────────────────

  const renderRequest = (req: InviteCodeRequest) => {
    const st = STATUS_STYLE[req.status] ?? STATUS_STYLE.PENDING;
    const rowBg = isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB';

    return (
      <Card className="p-4">
        {/* Header */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <Body className="text-white font-outfit-bold text-sm">{getInitials(req.fullName)}</Body>
            </View>
            <View className="flex-1">
              <Body className="font-outfit-semibold text-sm" numberOfLines={1}>{req.fullName}</Body>
              <Caption color="secondary" className="text-xs" numberOfLines={1}>{req.email}</Caption>
            </View>
          </View>
          <View
            className="flex-row items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ backgroundColor: st.bg }}
          >
            <Ionicons name={st.icon as any} size={12} color={st.color} />
            <Caption style={{ color: st.color, fontSize: 11, fontWeight: '600' }}>{req.status}</Caption>
          </View>
        </View>

        {/* Info strip */}
        <View className="flex-row gap-2 mb-3">
          {req.phone && (
            <View
              className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg flex-1"
              style={{ backgroundColor: rowBg }}
            >
              <Ionicons name="call-outline" size={12} color="#9CA3AF" />
              <Caption color="secondary" className="text-xs" numberOfLines={1}>{req.phone}</Caption>
            </View>
          )}
          <View
            className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg"
            style={{ backgroundColor: rowBg }}
          >
            <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
            <Caption color="secondary" className="text-xs">{formatDate(req.createdAt)}</Caption>
          </View>
        </View>

        {/* Reviewer */}
        {req.reviewer && (
          <View
            className="flex-row items-center gap-2 px-3 py-2 rounded-lg mb-3"
            style={{ backgroundColor: rowBg }}
          >
            <Ionicons name="person-outline" size={13} color="#9CA3AF" />
            <Caption color="secondary" className="text-xs">
              Reviewed by <Caption className="text-xs font-outfit-semibold">{req.reviewer.fullName}</Caption>
              {req.reviewedAt ? ` · ${formatDate(req.reviewedAt)}` : ''}
            </Caption>
          </View>
        )}

        {/* Actions */}
        <View
          className="flex-row gap-2 pt-3"
          style={{ borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6' }}
        >
          <TouchableOpacity
            onPress={() => setDetailRequest(req)}
            className="flex-row items-center gap-1.5 px-3 py-2 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary"
          >
            <Ionicons name="eye-outline" size={14} color={isDark ? '#FFF' : '#374151'} />
            <Body className="text-xs">Details</Body>
          </TouchableOpacity>

          {req.status === 'PENDING' && (
            <>
              <TouchableOpacity
                onPress={() => handleApprove(req.id)}
                disabled={reviewing}
                className="flex-row items-center gap-1.5 px-3 py-2 rounded-lg"
                style={{ backgroundColor: '#D1FAE5' }}
              >
                <Ionicons name="checkmark-circle-outline" size={14} color="#059669" />
                <Body style={{ color: '#059669', fontSize: 12, fontWeight: '600' }}>Approve</Body>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openReject(req.id)}
                disabled={reviewing}
                className="flex-row items-center gap-1.5 px-3 py-2 rounded-lg"
                style={{ backgroundColor: '#FFE4E6' }}
              >
                <Ionicons name="close-circle-outline" size={14} color="#DC2626" />
                <Body style={{ color: '#DC2626', fontSize: 12, fontWeight: '600' }}>Reject</Body>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Card>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View
      className="flex-1 bg-light-background-primary dark:bg-dark-background-primary"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFF' : '#000035'} />
        </TouchableOpacity>
        <View className="flex-1">
          <H2>Invite Requests</H2>
          <Caption color="secondary">Review and manage worker invite requests</Caption>
        </View>
        <TouchableOpacity onPress={refetch} className="w-9 h-9 items-center justify-center rounded-full" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }}>
          <Ionicons name="refresh-outline" size={18} color={isDark ? '#FFF' : '#374151'} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* Stat cards */}
        <View className="px-5 mb-5">
          <Card className="p-5 mb-3" style={{ backgroundColor: primaryColor }}>
            <View className="flex-row items-center justify-between">
              <View>
                <Caption className="text-white/70 text-xs mb-1">Total Requests</Caption>
                <H2 className="text-white text-4xl font-outfit-bold">{stats.total}</H2>
              </View>
              <View className="w-14 h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
                <Ionicons name="person-add" size={26} color="#FFF" />
              </View>
            </View>
          </Card>

          <View className="flex-row gap-3">
            {[
              { icon: 'time-outline',             iconColor: '#D97706', bg: '#FEF3C7', count: stats.pending,  label: 'Pending'  },
              { icon: 'checkmark-circle-outline', iconColor: '#059669', bg: '#D1FAE5', count: stats.approved, label: 'Approved' },
              { icon: 'close-circle-outline',     iconColor: '#DC2626', bg: '#FFE4E6', count: stats.rejected, label: 'Rejected' },
            ].map((s) => (
              <Card key={s.label} className="flex-1 p-4">
                <View className="w-9 h-9 rounded-xl items-center justify-center mb-2" style={{ backgroundColor: s.bg }}>
                  <Ionicons name={s.icon as any} size={18} color={s.iconColor} />
                </View>
                <H3 className="text-xl font-outfit-bold mb-0.5">{s.count}</H3>
                <Caption color="secondary" className="text-xs">{s.label}</Caption>
              </Card>
            ))}
          </View>
        </View>

        {/* List */}
        {isLoading ? (
          <View className="items-center justify-center py-16">
            <ActivityIndicator size="large" color={primaryColor} />
            <Caption color="secondary" className="mt-3 text-xs">Loading requests...</Caption>
          </View>
        ) : error ? (
          <View className="items-center justify-center py-16 px-5">
            <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
            <Body color="secondary" className="mt-3 text-center">Failed to load requests.</Body>
            <TouchableOpacity onPress={refetch} className="mt-3 px-4 py-2 rounded-xl" style={{ backgroundColor: primaryColor }}>
              <Body className="text-white text-sm font-outfit-semibold">Retry</Body>
            </TouchableOpacity>
          </View>
        ) : (
          <PaginatedCardList<InviteCodeRequest>
            data={allRequests}
            defaultPageSize={5}
            pageSizeOptions={[5, 10, 20]}
            renderItem={renderRequest}
            searchKeys={['fullName', 'email', 'phone']}
            searchPlaceholder="Search by name, email or phone..."
            filterOptions={STATUS_FILTERS}
            filterKey="status"
            sectionLabel="Requests"
            emptyTitle="No invite requests found"
            emptySubtitle="Try a different search or filter"
            className="px-5 mb-6"
          />
        )}

        <View className="h-24" />
      </ScrollView>

      {/* Detail modal */}
      {detailRequest && (
        <DetailModal
          request={detailRequest}
          onClose={() => setDetailRequest(null)}
          onApprove={(id) => { handleApprove(id); }}
          onReject={openReject}
          reviewing={reviewing}
          isDark={isDark}
          primaryColor={primaryColor}
        />
      )}

      {/* Reject modal */}
      {rejectTargetId && (
        <RejectModal
          onClose={() => setRejectTargetId(null)}
          onConfirm={handleRejectConfirm}
          reviewing={reviewing}
          isDark={isDark}
        />
      )}
    </View>
  );
}

export default InviteRequestsScreen;
