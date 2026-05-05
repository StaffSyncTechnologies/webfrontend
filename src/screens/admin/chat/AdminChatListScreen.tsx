import React, { useCallback, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackScreenProps } from '../../../types/navigation';
import { useOrgTheme, useTheme } from '../../../contexts';
import { H2, Body, Caption } from '../../../components/ui';
import {
  useGetMyRoomsQuery,
  useHrCreateRoomMutation,
  useGetAssignedChatWorkersQuery,
} from '../../../store/api/chatApi';
import type { ChatRoom } from '../../../store/api/chatApi';
import { useGetMyTeamQuery, useListManagersQuery } from '../../../store/slices/adminSlices/hrSlice';

function formatRelativeTime(dateStr: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export const AdminChatListScreen: React.FC<RootStackScreenProps<'AdminChatList'>> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { primaryColor, secondaryColor } = useOrgTheme();

  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'workers' | 'team' | 'staff'>('workers');
  const [contactSearch, setContactSearch] = useState('');

  const { data: roomsData = [], isLoading: isLoadingRooms, refetch: refetchRooms } = useGetMyRoomsQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: workersData, isLoading: isLoadingWorkers } = useGetAssignedChatWorkersQuery(undefined, { skip: !showNewChatModal });
  const { data: teamData, isLoading: isLoadingTeam } = useGetMyTeamQuery(undefined, { skip: !showNewChatModal });
  const { data: staffData, isLoading: isLoadingStaff } = useListManagersQuery({}, { skip: !showNewChatModal });
  const [hrCreateRoom, { isLoading: isCreatingRoom }] = useHrCreateRoomMutation();

  const rooms: ChatRoom[] = Array.isArray(roomsData) ? roomsData : ((roomsData as any)?.data || []);
  const workers = (Array.isArray(workersData) ? workersData : ((workersData as any)?.data || [])) as { id: string; fullName: string; email: string; profilePicUrl: string | null }[];
  const teamMembers = (Array.isArray(teamData) ? teamData : ((teamData as any)?.data || [])) as { id: string; fullName: string; email: string }[];
  const staffMembers = (staffData?.managers || []) as { id: string; fullName: string; email: string; role: string; roleDisplay: string }[];

  // Refetch rooms when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetchRooms();
    }, [refetchRooms])
  );

  const handleOpenRoom = (room: ChatRoom) => {
    let recipientName = 'Unknown';
    if (room.worker) {
      recipientName = room.worker.fullName;
    } else if (room.hrUser) {
      recipientName = room.hrUser.fullName;
    }
    navigation.navigate('AdminChat', { roomId: room.id, recipientName } as any);
  };

  const handleStartChat = async (contactId: string, contactName: string) => {
    try {
      const result = await hrCreateRoom({ workerId: contactId }).unwrap() as any;
      setShowNewChatModal(false);
      setContactSearch('');
      const roomId = result.data?.id || result.id;
      navigation.navigate('AdminChat' as const, { roomId, recipientName: contactName });
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const filteredWorkers = workers.filter((w) =>
    w.fullName.toLowerCase().includes(contactSearch.toLowerCase()) ||
    w.email.toLowerCase().includes(contactSearch.toLowerCase())
  );
  const filteredTeam = teamMembers.filter((m) =>
    m.fullName.toLowerCase().includes(contactSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(contactSearch.toLowerCase())
  );
  const filteredStaff = staffMembers.filter((s) =>
    s.fullName.toLowerCase().includes(contactSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(contactSearch.toLowerCase())
  );

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000035'} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <H2>Messages</H2>
        </View>
        <TouchableOpacity
          onPress={() => { setShowNewChatModal(true); setContactSearch(''); setActiveTab('workers'); }}
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: primaryColor || '#000035' }}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Conversations list */}
      <View className="px-5 mb-2">
        <Body className="font-outfit-bold">All Conversations</Body>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {isLoadingRooms ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color={secondaryColor || '#00AFEF'} />
          </View>
        ) : rooms.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
            <Body color="secondary" className="mt-3 text-center">
              No conversations yet.
            </Body>
          </View>
        ) : (
          rooms.map((room) => {
            let recipientName = 'Unknown';
            if (room.worker) {
              recipientName = room.worker.fullName;
            } else if (room.hrUser) {
              recipientName = room.hrUser.fullName;
            }
            const lastMsg = room.messages?.[0];
            return (
              <TouchableOpacity
                key={room.id}
                onPress={() => handleOpenRoom(room)}
                className="flex-row items-center py-3.5"
                style={{ borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
              >
                {/* Avatar */}
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: '#E5E7EB' }}
                >
                  <Body className="font-outfit-bold" style={{ color: '#6B7280', fontSize: 14 }}>
                    {getInitials(recipientName)}
                  </Body>
                </View>

                {/* Name + preview */}
                <View className="flex-1 mr-2" style={{ minWidth: 0 }}>
                  <Body className="font-outfit-bold" numberOfLines={1}>{recipientName}</Body>
                  <Caption color="secondary" numberOfLines={1} className="mt-0.5">
                    {lastMsg?.content || 'No messages yet'}
                  </Caption>
                </View>

                {/* Time + unread */}
                <View className="items-end">
                  <Caption color="secondary" style={{ fontSize: 11 }}>
                    {formatRelativeTime(room.lastMessageAt || null)}
                  </Caption>
                  {(room.unreadCount || 0) > 0 && (
                    <View
                      className="mt-1 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: secondaryColor || '#00AFEF',
                        minWidth: 20,
                        height: 20,
                        paddingHorizontal: 5,
                      }}
                    >
                      <Caption style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>
                        {room.unreadCount}
                      </Caption>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View className="h-5" />
      </ScrollView>

      {/* New Chat Modal */}
      <Modal
        visible={showNewChatModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewChatModal(false)}
      >
        <View
          className="flex-1 bg-light-background-primary dark:bg-dark-background-primary"
          style={{ paddingTop: insets.top + 8 }}
        >
          {/* Modal Header */}
          <View
            className="flex-row items-center px-5 py-3"
            style={{ borderBottomWidth: 1, borderBottomColor: isDark ? '#2D2D44' : '#E2E8F0' }}
          >
            <TouchableOpacity onPress={() => setShowNewChatModal(false)} className="mr-4">
              <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000035'} />
            </TouchableOpacity>
            <H2 className="flex-1">New Message</H2>
          </View>

          {/* Search Bar */}
          <View className="px-5 pt-3 pb-2">
            <View
              className="flex-row items-center rounded-xl px-3 py-2"
              style={{ backgroundColor: isDark ? '#2D2D44' : '#F3F4F6' }}
            >
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                placeholder="Search name or email..."
                placeholderTextColor="#9CA3AF"
                value={contactSearch}
                onChangeText={setContactSearch}
                autoCapitalize="none"
                style={{
                  flex: 1,
                  marginLeft: 8,
                  fontSize: 14,
                  color: isDark ? '#FFFFFF' : '#1F2937',
                }}
              />
              {contactSearch.length > 0 && (
                <TouchableOpacity onPress={() => setContactSearch('')}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Tabs */}
          <View className="flex-row px-5 mb-3">
            {(['workers', 'team', 'staff'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className="mr-4 pb-2"
                style={{
                  borderBottomWidth: 2,
                  borderBottomColor: activeTab === tab ? (secondaryColor || '#00AFEF') : 'transparent',
                }}
              >
                <Body
                  style={{
                    fontWeight: activeTab === tab ? '700' : '400',
                    color: activeTab === tab
                      ? (secondaryColor || '#00AFEF')
                      : (isDark ? '#9CA3AF' : '#6B7280'),
                    textTransform: 'capitalize',
                  }}
                >
                  {tab === 'workers' ? 'Workers' : tab === 'team' ? 'Team' : 'Staff'}
                </Body>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact List */}
          <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
            {activeTab === 'staff' ? (
              isLoadingStaff ? (
                <View className="items-center py-12">
                  <ActivityIndicator size="large" color={secondaryColor || '#00AFEF'} />
                </View>
              ) : filteredStaff.length === 0 ? (
                <View className="items-center py-12">
                  <Ionicons name="briefcase-outline" size={48} color="#D1D5DB" />
                  <Body color="secondary" className="mt-3 text-center">
                    {contactSearch ? 'No staff match your search.' : 'No staff members found.'}
                  </Body>
                </View>
              ) : (
                filteredStaff.map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    onPress={() => handleStartChat(member.id, member.fullName)}
                    disabled={isCreatingRoom}
                    className="flex-row items-center py-3.5"
                    style={{ borderBottomWidth: 1, borderBottomColor: isDark ? '#2D2D44' : '#F3F4F6' }}
                  >
                    <View
                      className="w-11 h-11 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: isDark ? '#1E3A2F' : '#D1FAE5' }}
                    >
                      <Body style={{ color: '#059669', fontSize: 13, fontWeight: '700' }}>
                        {getInitials(member.fullName)}
                      </Body>
                    </View>
                    <View className="flex-1">
                      <Body className="font-outfit-semibold">{member.fullName}</Body>
                      <Caption color="secondary">{member.roleDisplay || member.role}</Caption>
                    </View>
                    {isCreatingRoom ? (
                      <ActivityIndicator size="small" color={secondaryColor || '#00AFEF'} />
                    ) : (
                      <Ionicons name="chatbubble-outline" size={20} color={secondaryColor || '#00AFEF'} />
                    )}
                  </TouchableOpacity>
                ))
              )
            ) : activeTab === 'workers' ? (
              isLoadingWorkers ? (
                <View className="items-center py-12">
                  <ActivityIndicator size="large" color={secondaryColor || '#00AFEF'} />
                </View>
              ) : filteredWorkers.length === 0 ? (
                <View className="items-center py-12">
                  <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                  <Body color="secondary" className="mt-3 text-center">
                    {contactSearch ? 'No workers match your search.' : 'No workers assigned to you.'}
                  </Body>
                </View>
              ) : (
                filteredWorkers.map((worker) => (
                  <TouchableOpacity
                    key={worker.id}
                    onPress={() => handleStartChat(worker.id, worker.fullName)}
                    disabled={isCreatingRoom}
                    className="flex-row items-center py-3.5"
                    style={{ borderBottomWidth: 1, borderBottomColor: isDark ? '#2D2D44' : '#F3F4F6' }}
                  >
                    <View
                      className="w-11 h-11 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: isDark ? '#2D2D44' : '#E5E7EB' }}
                    >
                      <Body style={{ color: '#6B7280', fontSize: 13, fontWeight: '700' }}>
                        {getInitials(worker.fullName)}
                      </Body>
                    </View>
                    <View className="flex-1">
                      <Body className="font-outfit-semibold">{worker.fullName}</Body>
                      <Caption color="secondary">{worker.email}</Caption>
                    </View>
                    {isCreatingRoom ? (
                      <ActivityIndicator size="small" color={secondaryColor || '#00AFEF'} />
                    ) : (
                      <Ionicons name="chatbubble-outline" size={20} color={secondaryColor || '#00AFEF'} />
                    )}
                  </TouchableOpacity>
                ))
              )
            ) : activeTab === 'team' ? (
              isLoadingTeam ? (
                <View className="items-center py-12">
                  <ActivityIndicator size="large" color={secondaryColor || '#00AFEF'} />
                </View>
              ) : filteredTeam.length === 0 ? (
                <View className="items-center py-12">
                  <Ionicons name="people-circle-outline" size={48} color="#D1D5DB" />
                  <Body color="secondary" className="mt-3 text-center">
                    {contactSearch ? 'No team members match your search.' : 'No team members found.'}
                  </Body>
                </View>
              ) : (
                filteredTeam.map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    onPress={() => handleStartChat(member.id, member.fullName)}
                    disabled={isCreatingRoom}
                    className="flex-row items-center py-3.5"
                    style={{ borderBottomWidth: 1, borderBottomColor: isDark ? '#2D2D44' : '#F3F4F6' }}
                  >
                    <View
                      className="w-11 h-11 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: isDark ? '#3D2D54' : '#EDE9FE' }}
                    >
                      <Body style={{ color: '#7C3AED', fontSize: 13, fontWeight: '700' }}>
                        {getInitials(member.fullName)}
                      </Body>
                    </View>
                    <View className="flex-1">
                      <Body className="font-outfit-semibold">{member.fullName}</Body>
                      <Caption color="secondary">{member.email}</Caption>
                    </View>
                    {isCreatingRoom ? (
                      <ActivityIndicator size="small" color={secondaryColor || '#00AFEF'} />
                    ) : (
                      <Ionicons name="chatbubble-outline" size={20} color={secondaryColor || '#00AFEF'} />
                    )}
                  </TouchableOpacity>
                ))
              )
            ) : null}
            <View className="h-8" />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

export default AdminChatListScreen;
