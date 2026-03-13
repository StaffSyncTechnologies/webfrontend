import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme } from '../contexts';
import { useAppSelector } from '../store/hooks';
import { H2, Body, Caption } from '../components/ui';
import { useWorkerGetOrCreateRoomMutation, useGetRoomMessagesQuery } from '../store/api/chatApi';
import { useSocket } from '../hooks/useSocket';
import type { ChatMessage } from '../store/api/chatApi';

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

export function ChatScreen({ navigation, route }: RootStackScreenProps<'Chat'>) {
  const insets = useSafeAreaInsets();
  const { secondaryColor } = useOrgTheme();
  const currentUserId = useAppSelector((state) => state.auth.worker?.id);
  const scrollRef = useRef<ScrollView>(null);

  const [inputText, setInputText] = useState('');
  const [roomId, setRoomId] = useState<string | undefined>(route.params?.roomId);
  const [recipientName, setRecipientName] = useState(route.params?.recipientName || 'Manager');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get or create room for worker
  const [getOrCreateRoom, { isLoading: isCreatingRoom }] = useWorkerGetOrCreateRoomMutation();

  // Fetch messages once we have a roomId (always refetch on mount to get latest)
  const { data: messagesData, isLoading: isLoadingMessages } = useGetRoomMessagesQuery(
    { roomId: roomId! },
    { skip: !roomId, refetchOnMountOrArgChange: true }
  );

  // Socket connection for real-time messaging
  const onNewMessage = useCallback((message: ChatMessage) => {
    setLocalMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const onTyping = useCallback((data: { userId: string; isTyping: boolean }) => {
    if (data.userId !== currentUserId) {
      setIsOtherTyping(data.isTyping);
    }
  }, [currentUserId]);

  const { sendMessage, sendTyping, markAsRead, isConnected } = useSocket({
    roomId,
    onNewMessage,
    onTyping,
  });

  // Initialize: get or create room if no roomId provided
  useEffect(() => {
    if (roomId) return;

    (async () => {
      try {
        const result = await getOrCreateRoom().unwrap();
        if (result.data) {
          setRoomId(result.data.id);
          const other = result.data.hrUser;
          setRecipientName(other?.fullName || 'Manager');
        }
      } catch (err) {
        console.error('Failed to get/create chat room:', err);
      }
    })();
  }, [roomId, getOrCreateRoom]);

  // Sync fetched messages into local state (merge with any socket messages)
  useEffect(() => {
    if (messagesData?.data) {
      setLocalMessages((prev) => {
        const fetchedIds = new Set(messagesData.data.map((m) => m.id));
        // Keep any socket messages not yet in the fetched batch
        const socketOnly = prev.filter((m) => !fetchedIds.has(m.id));
        return [...messagesData.data, ...socketOnly];
      });
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 150);
    }
  }, [messagesData]);

  // Mark messages as read when entering the room
  useEffect(() => {
    if (roomId && isConnected) {
      markAsRead();
    }
  }, [roomId, isConnected, markAsRead]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || !roomId) return;

    sendMessage(text);
    setInputText('');
    sendTyping(false);
  };

  const handleTextChange = (text: string) => {
    setInputText(text);

    if (text.length > 0) {
      sendTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => sendTyping(false), 2000);
    } else {
      sendTyping(false);
    }
  };

  // Group messages by date
  const groupedMessages: { label: string; messages: ChatMessage[] }[] = [];
  let currentLabel = '';
  for (const msg of localMessages) {
    const label = formatDateLabel(msg.createdAt);
    if (label !== currentLabel) {
      currentLabel = label;
      groupedMessages.push({ label, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  }

  if (isCreatingRoom || (!roomId && isLoadingMessages)) {
    return (
      <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary items-center justify-center">
        <ActivityIndicator size="large" color={secondaryColor || '#38BDF8'} />
        <Body color="secondary" className="mt-3">Connecting to chat...</Body>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-3" style={{ borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Ionicons name="chevron-back" size={24} color="#000035" />
        </TouchableOpacity>
        <View className="w-10 h-10 rounded-full bg-gray-300 items-center justify-center mr-3 overflow-hidden">
          <Ionicons name="person" size={20} color="#6B7280" />
        </View>
        <View className="flex-1">
          <H2 className="text-lg">{recipientName}</H2>
          {isConnected && isOtherTyping && (
            <Caption style={{ color: secondaryColor || '#38BDF8' }}>typing...</Caption>
          )}
        </View>
        {!isConnected && (
          <View className="px-2 py-1 rounded-full bg-yellow-100">
            <Caption style={{ color: '#D97706', fontSize: 10 }}>reconnecting</Caption>
          </View>
        )}
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 10 : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ justifyContent: 'flex-end', flexGrow: 1 }}
        >
          {isLoadingMessages && (
            <View className="items-center py-8">
              <ActivityIndicator size="small" color="#9CA3AF" />
            </View>
          )}

          {groupedMessages.map((group) => (
            <View key={group.label}>
              <View className="items-center py-4">
                <Caption color="muted">{group.label}</Caption>
              </View>

              {group.messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <View key={msg.id} className={`flex-row mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center mr-2 mt-1 overflow-hidden">
                        <Ionicons name="person" size={14} color="#6B7280" />
                      </View>
                    )}
                    <View style={{ maxWidth: '75%', flexShrink: 1 }}>
                      <View
                        style={{
                          backgroundColor: isMe ? (secondaryColor || '#38BDF8') : '#F3F4F6',
                          borderRadius: 16,
                          borderBottomRightRadius: isMe ? 4 : 16,
                          borderBottomLeftRadius: isMe ? 16 : 4,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <Body style={{ color: isMe ? '#FFFFFF' : '#1F2937' }}>{msg.content}</Body>
                      </View>
                      <View className={`flex-row items-center mt-1 gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <Caption color="muted">{formatTime(msg.createdAt)}</Caption>
                        {isMe && (
                          <Ionicons
                            name={msg.status === 'READ' ? 'checkmark-done' : msg.status === 'DELIVERED' ? 'checkmark-done-outline' : 'checkmark'}
                            size={14}
                            color={msg.status === 'READ' ? (secondaryColor || '#38BDF8') : '#9CA3AF'}
                          />
                        )}
                      </View>
                    </View>
                    {isMe && (
                      <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center ml-2 mt-1 overflow-hidden">
                        <Ionicons name="person" size={14} color="#6B7280" />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))}

          {localMessages.length === 0 && !isLoadingMessages && (
            <View className="flex-1 items-center justify-center py-12">
              <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
              <Body color="secondary" className="mt-3 text-center">
                No messages yet.{'\n'}Send a message to start the conversation.
              </Body>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View className="px-4 py-3" style={{ borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingBottom: Math.max(insets.bottom, 12) }}>
          <View className="flex-row items-center bg-light-background-secondary dark:bg-dark-background-secondary rounded-full px-4 py-2">
            <TouchableOpacity className="mr-2">
              <Ionicons name="happy-outline" size={22} color="#9CA3AF" />
            </TouchableOpacity>
            <TextInput
              className="flex-1 font-outfit text-base py-1"
              placeholder="Type here..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={handleTextChange}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity className="mr-2">
              <Ionicons name="attach-outline" size={22} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSend}
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{ backgroundColor: inputText.trim() ? (secondaryColor || '#38BDF8') : '#D1D5DB' }}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

export default ChatScreen;
