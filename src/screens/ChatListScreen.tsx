import React, { useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme } from '../contexts';
import { H2, Body, Caption } from '../components/ui';
import { useGetMyRoomsQuery, useWorkerGetOrCreateRoomMutation } from '../store/api/chatApi';
import type { ChatRoom } from '../store/api/chatApi';
import { useAppSelector } from '../store/hooks';

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

export function ChatListScreen({ navigation }: RootStackScreenProps<'ChatList'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor, secondaryColor } = useOrgTheme();
  const currentUserId = useAppSelector((state) => state.auth.worker?.id);
  const { data: roomsData, isLoading, refetch } = useGetMyRoomsQuery();
  const [getOrCreateRoom, { isLoading: isCreatingRoom }] = useWorkerGetOrCreateRoomMutation();

  const rooms: ChatRoom[] = roomsData?.data || [];

  // Refetch rooms when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleChatManager = async () => {
    try {
      const result = await getOrCreateRoom().unwrap();
      if (result.data) {
        const other = result.data.hrUser;
        navigation.navigate('Chat', {
          roomId: result.data.id,
          recipientName: other?.fullName || 'Manager',
        });
      }
    } catch (err) {
      console.error('Failed to get/create chat room:', err);
    }
  };

  const handleOpenRoom = (room: ChatRoom) => {
    const other = room.hrUserId === currentUserId ? room.worker : room.hrUser;
    navigation.navigate('Chat', {
      roomId: room.id,
      recipientName: other.fullName,
    });
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color="#000035" />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <H2>Messages</H2>
        </View>
      </View>

      {/* Chat with Manager button */}
      <View className="px-5 mb-3">
        <TouchableOpacity
          onPress={handleChatManager}
          disabled={isCreatingRoom}
          className="flex-row items-center p-4 rounded-xl"
          style={{ backgroundColor: primaryColor || '#000035' }}
        >
          <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
          </View>
          <View className="flex-1">
            <Body className="font-outfit-bold" style={{ color: '#fff' }}>Chat with Manager</Body>
            <Caption style={{ color: 'rgba(255,255,255,0.7)' }}>Start or continue a conversation</Caption>
          </View>
          {isCreatingRoom ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Conversations list */}
      <View className="px-5 mb-2">
        <Body className="font-outfit-bold">All Conversations</Body>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color={secondaryColor || '#00AFEF'} />
          </View>
        ) : rooms.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
            <Body color="secondary" className="mt-3 text-center">
              No conversations yet.{'\n'}Tap "Chat with Manager" to start.
            </Body>
          </View>
        ) : (
          rooms.map((room) => {
            const other = room.hrUserId === currentUserId ? room.worker : room.hrUser;
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
                    {getInitials(other.fullName)}
                  </Body>
                </View>

                {/* Name + preview */}
                <View className="flex-1 mr-2" style={{ minWidth: 0 }}>
                  <Body className="font-outfit-bold" numberOfLines={1}>{other.fullName}</Body>
                  <Caption color="secondary" numberOfLines={1} className="mt-0.5">
                    {lastMsg ? lastMsg.content : 'No messages yet'}
                  </Caption>
                </View>

                {/* Time + unread */}
                <View className="items-end">
                  <Caption color="secondary" style={{ fontSize: 11 }}>
                    {formatRelativeTime(room.lastMessageAt)}
                  </Caption>
                  {room.unreadCount > 0 && (
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
    </View>
  );
}

export default ChatListScreen;
