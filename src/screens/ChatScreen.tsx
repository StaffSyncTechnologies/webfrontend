import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Modal, TouchableWithoutFeedback, Alert, Image
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from 'expo-audio';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme } from '../contexts';
import { useAppSelector } from '../store/hooks';
import { H2, Body, Caption } from '../components/ui';
import {
  useWorkerGetOrCreateRoomMutation,
  useGetRoomMessagesQuery,
  useUploadFileMutation,
  useSendMessageWithAttachmentsMutation,
} from '../store/api/chatApi';
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

function transformMessage(message: any): ChatMessage {
  return {
    id: message.id || crypto.randomUUID(),
    chatRoomId: message.chatRoomId || message.room || '',
    senderId: message.senderId || message.from || '',
    content: message.content || message.text || '',
    messageType: message.messageType || 'TEXT',
    status: message.status || 'SENT',
    createdAt: message.createdAt || message.timestamp || new Date().toISOString(),
    readAt: message.readAt || null,
    sender: message.sender || {
      id: message.senderId || message.from || '',
      fullName: '',
      role: '',
    },
    attachments: message.attachments || [],
  };
}

export const ChatScreen: React.FC<RootStackScreenProps<'Chat'>> = ({ navigation, route }) => {
  const { primaryColor, secondaryColor } = useOrgTheme();
  const colorScheme = useColorScheme();
  const currentUserId = useAppSelector((state) => state?.auth.worker?.id);
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const [inputText, setInputText] = useState('');
  const [roomId, setRoomId] = useState<string | undefined>(route.params?.roomId);
  const [recipientName, setRecipientName] = useState(route.params?.recipientName || 'Manager');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ✅ expo-audio hook — called unconditionally at top level
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [getOrCreateRoom, { isLoading: isCreatingRoom }] = useWorkerGetOrCreateRoomMutation();
  const [uploadFile] = useUploadFileMutation();
  const [sendMessageWithAttachments] = useSendMessageWithAttachmentsMutation();

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

  const onTyping = useCallback(
    (data: { userId: string; isTyping: boolean }) => {
      if (String(data.userId) !== String(currentUserId)) setIsOtherTyping(data.isTyping);
    },
    [currentUserId]
  );

  const { sendMessage: sendMessageSocket, sendTyping, markAsRead, isConnected } = useSocket({
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
          setRecipientName(result.data.hrUser?.fullName || 'Manager');
        }
      } catch (err) {
        console.error('Failed to get/create chat room:', err);
      }
    })();
  }, [roomId, getOrCreateRoom]);

  // Sync fetched messages
  useEffect(() => {
    if (messagesData?.data) {
      setLocalMessages((prev) => {
        const transformedMessages = messagesData.data.map(transformMessage);
        const fetchedIds = new Set(transformedMessages.map((m) => m.id));
        const socketOnly = prev.filter((m) => !fetchedIds.has(m.id));
        return [...transformedMessages, ...socketOnly];
      });
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 150);
    }
  }, [messagesData]);

  // Mark as read
  useEffect(() => {
    if (roomId && isConnected) markAsRead();
  }, [roomId, isConnected, markAsRead]);

  // ✅ Request mic permission + set audio mode once on mount
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        console.warn('Microphone permission not granted');
      }
      // ✅ expo-audio uses playsInSilentMode / allowsRecording (no "iOS" suffix)
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !roomId) return;
    try {
      sendMessageSocket(text);
      setInputText('');
      sendTyping(false);
    } catch (error: any) {
      console.error('Error sending message:', error);
      Alert.alert('Error', error.message || 'Failed to send message');
    }
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

  const handlePickImage = async () => {
    setShowAttachmentMenu(false);
    try {
      // Request permissions first for iOS
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'StaffSync needs access to your photo library to send images in chat.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // Use array instead of deprecated MediaTypeOptions
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // iOS-specific: Check if we got a valid URI
        if (!asset.uri) {
          Alert.alert('Error', 'Failed to get image from library');
          return;
        }

        // Create FormData for upload
        const formData = new FormData();
        const fileName = asset.fileName || `photo_${Date.now()}.jpg`;
        
        // iOS-specific: Handle file URI properly
        let fileUri = asset.uri;
        if (Platform.OS === 'ios' && asset.uri.startsWith('file://')) {
          fileUri = asset.uri;
        }

        formData.append('file', {
          uri: fileUri,
          type: asset.mimeType || 'image/jpeg',
          name: fileName,
        } as any);

        try {
          const uploadResult = await uploadFile(formData).unwrap();
          if (uploadResult.success && roomId) {
            await sendMessageWithAttachments({
              roomId,
              messageType: 'IMAGE',
              attachments: [uploadResult.data],
            }).unwrap();
          } else {
            Alert.alert('Error', 'Failed to upload image');
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handlePickDocument = async () => {
    setShowAttachmentMenu(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const formData = new FormData();
        formData.append('file', {
          uri: asset.uri,
          type: asset.mimeType || 'application/pdf',
          name: asset.name || 'document.pdf',
        } as any);
        const uploadResult = await uploadFile(formData).unwrap();
        if (uploadResult.success && roomId) {
          await sendMessageWithAttachments({
            roomId,
            messageType: 'DOCUMENT',
            attachments: [uploadResult.data],
          }).unwrap();
        }
      }
    } catch (error: any) {
      console.error('Error picking document:', error);
      Alert.alert('Error', error.message || 'Failed to pick document');
    }
  };

  // ✅ expo-audio recording flow:
  //    prepareToRecordAsync() → record() → stop() → read audioRecorder.uri
  const startRecording = async () => {
    setShowAttachmentMenu(false);
    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();           // synchronous after prepare

      setIsRecording(true);
      setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    setIsRecording(false);

    const capturedDuration = recordingDuration;
    setRecordingDuration(0);

    try {
      // ✅ stop() finalises the file; uri lives on audioRecorder.uri
      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      if (!uri || !roomId) return;

      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'audio/m4a',                         // HIGH_QUALITY → .m4a on iOS
        name: `voice_message_${Date.now()}.m4a`,
      } as any);

      const uploadResult = await uploadFile(formData).unwrap();

      if (uploadResult.success) {
        await sendMessageWithAttachments({
          roomId,
          messageType: 'AUDIO',
          attachments: [{ ...uploadResult.data, duration: capturedDuration }],
        }).unwrap();
      } else {
        Alert.alert('Error', 'Failed to upload voice message');
      }
    } catch (error: any) {
      console.error('Error stopping / uploading audio:', error);
      Alert.alert('Error', error.message || 'Failed to send voice message');
    }
  };

  const cancelRecording = async () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    setIsRecording(false);
    setRecordingDuration(0);
    try {
      // ✅ Must call stop() to release native resources even on cancel
      await audioRecorder.stop();
    } catch (_) {
      // Ignore errors on cancel
    }
  };

  // Group messages by date label
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
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 60 : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          className="px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
          keyboardShouldPersistTaps="handled"
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
                const isMe = String(msg.senderId) === String(currentUserId);
                return (
                  <View
                    key={msg.id}
                    className={`flex-row mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
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
                        {/* Text */}
                        {msg.messageType === 'TEXT' && msg.content && (
                          <Body style={{ color: isMe ? '#FFFFFF' : '#1F2937' }}>
                            {msg.content}
                          </Body>
                        )}

                        {/* Image */}
                        {msg.messageType === 'IMAGE' && (
                          <View>
                            {msg.attachments?.[0] ? (
                              <Image
                                source={{ uri: msg.attachments[0].fileUrl }}
                                style={{ width: 200, height: 150, borderRadius: 8 }}
                                resizeMode="cover"
                                onError={(e) =>
                                  console.error('Image load error:', e.nativeEvent.error)
                                }
                              />
                            ) : (
                              <View
                                style={{
                                  width: 200,
                                  height: 150,
                                  borderRadius: 8,
                                  backgroundColor: '#F3F4F6',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                                <Body style={{ color: '#6B7280', marginTop: 8 }}>
                                  No attachment data
                                </Body>
                              </View>
                            )}
                            {msg.content && (
                              <Body style={{ color: isMe ? '#FFFFFF' : '#1F2937', marginTop: 8 }}>
                                {msg.content}
                              </Body>
                            )}
                          </View>
                        )}

                        {/* Document */}
                        {msg.messageType === 'DOCUMENT' && msg.attachments?.[0] && (
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons
                              name="document-text-outline"
                              size={24}
                              color={isMe ? '#FFFFFF' : '#1F2937'}
                            />
                            <View style={{ marginLeft: 8, flex: 1 }}>
                              <Body style={{ color: isMe ? '#FFFFFF' : '#1F2937' }}>
                                {msg.attachments[0].fileName}
                              </Body>
                              <Caption style={{ color: isMe ? '#FFFFFF80' : '#6B7280' }}>
                                {Math.round(msg.attachments[0].fileSize / 1024)} KB
                              </Caption>
                            </View>
                          </View>
                        )}

                        {/* Audio */}
                        {msg.messageType === 'AUDIO' && msg.attachments?.[0] && (
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons
                              name="play-circle-outline"
                              size={24}
                              color={isMe ? '#FFFFFF' : '#1F2937'}
                            />
                            <View style={{ marginLeft: 8 }}>
                              <Body style={{ color: isMe ? '#FFFFFF' : '#1F2937' }}>
                                Voice Message
                              </Body>
                              <Caption style={{ color: isMe ? '#FFFFFF80' : '#6B7280' }}>
                                {msg.attachments[0].duration}s
                              </Caption>
                            </View>
                          </View>
                        )}
                      </View>

                      <View
                        className={`flex-row items-center mt-1 gap-1 ${
                          isMe ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <Caption color="muted">{formatTime(msg.createdAt)}</Caption>
                        {isMe && (
                          <Ionicons
                            name={
                              msg.status === 'READ'
                                ? 'checkmark-done'
                                : msg.status === 'DELIVERED'
                                ? 'checkmark-done-outline'
                                : 'checkmark'
                            }
                            size={14}
                            color={
                              msg.status === 'READ' ? (secondaryColor || '#38BDF8') : '#9CA3AF'
                            }
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
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: '#E2E8F0',
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: insets.bottom + 10,
          }}
        >
          <View className="flex-row items-center bg-light-background-secondary dark:bg-dark-background-secondary rounded-full px-4 py-2">
            <TouchableOpacity className="mr-2">
              <Ionicons name="happy-outline" size={22} color="#9CA3AF" />
            </TouchableOpacity>
            <TextInput
              className="flex-1 font-outfit text-base py-1"
              style={{ color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }}
              placeholder="Type here..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={handleTextChange}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity className="mr-2" onPress={() => setShowAttachmentMenu(true)}>
              <Ionicons name="attach-outline" size={22} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSend}
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{
                backgroundColor: inputText.trim() ? (secondaryColor || '#38BDF8') : '#D1D5DB',
              }}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Attachment Menu Modal */}
        <Modal
          visible={showAttachmentMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAttachmentMenu(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowAttachmentMenu(false)}>
            <View className="flex-1 justify-end bg-black/50">
              <TouchableWithoutFeedback>
                <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6">
                  <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6" />
                  <View className="space-y-4">
                    <TouchableOpacity
                      onPress={handlePickImage}
                      className="flex-row items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    >
                      <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center mr-4">
                        <Ionicons name="image-outline" size={20} color="#3B82F6" />
                      </View>
                      <View className="flex-1">
                        <Body className="font-semibold">Photo & Video</Body>
                        <Caption color="secondary">Share photos and videos</Caption>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handlePickDocument}
                      className="flex-row items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    >
                      <View className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full items-center justify-center mr-4">
                        <Ionicons name="document-outline" size={20} color="#10B981" />
                      </View>
                      <View className="flex-1">
                        <Body className="font-semibold">Document</Body>
                        <Caption color="secondary">Share PDF, Word documents</Caption>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={startRecording}
                      className="flex-row items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    >
                      <View className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full items-center justify-center mr-4">
                        <Ionicons name="mic" size={20} color="#EF4444" />
                      </View>
                      <View>
                        <Body className="text-gray-800 dark:text-gray-200 font-semibold">
                          Voice Message
                        </Body>
                        <Caption className="text-gray-500 dark:text-gray-400">
                          Record and send voice message
                        </Caption>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setShowAttachmentMenu(false)}
                      className="mt-6 p-4 bg-gray-100 dark:bg-gray-600 rounded-xl"
                    >
                      <Body className="text-center text-gray-600 dark:text-gray-300">Cancel</Body>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Recording Indicator (top) */}
        {isRecording && (
          <View className="absolute top-20 left-0 right-0 items-center">
            <View className="bg-red-500 px-6 py-3 rounded-full flex-row items-center">
              <View className="w-3 h-3 bg-white rounded-full mr-3 animate-pulse" />
              <Body className="text-white font-semibold">
                Recording {Math.floor(recordingDuration / 60)}:
                {(recordingDuration % 60).toString().padStart(2, '0')}
              </Body>
              <TouchableOpacity onPress={cancelRecording} className="ml-4">
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Recording Controls (bottom card) */}
        {isRecording && (
          <View className="absolute bottom-20 left-0 right-0 items-center pb-8">
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg items-center">
              <View className="w-16 h-16 bg-red-500 rounded-full items-center justify-center mb-4">
                <Ionicons name="mic" size={32} color="#FFFFFF" />
              </View>
              <Body className="text-center mb-4">
                {Math.floor(recordingDuration / 60)}:
                {(recordingDuration % 60).toString().padStart(2, '0')}
              </Body>
              <View className="flex-row space-x-4 w-full">
                <TouchableOpacity
                  onPress={cancelRecording}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 p-3 rounded-xl"
                >
                  <Body className="text-center text-gray-600 dark:text-gray-300">Cancel</Body>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={stopRecording}
                  className="flex-1 bg-blue-500 p-3 rounded-xl"
                >
                  <Body className="text-center text-white">Send</Body>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;
