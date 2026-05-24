import React, { useState, useEffect, } from 'react';
import { View, Modal, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Linking, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOrgTheme } from '../contexts';
import { useTheme } from '../contexts';
import { Button, Input, H1, Body, DatePickerModal } from './ui';
import { useGetMyRTWQuery, useSubmitMyRTWMutation, useWorkerGetOrCreateRoomMutation } from '../store';
import { useSocket } from '../hooks/useSocket';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import type { ChatMessage } from '../store/api/chatApi';

export function RTWBlockerModal() {
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [shareCode, setShareCode] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dobDate, setDobDate] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatRoomId, setChatRoomId] = useState<string | undefined>();
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);

  const dispatch = useAppDispatch();
  const { data: rtwData, isLoading: rtwLoading, refetch } = useGetMyRTWQuery();
  const [submitRTW, { isLoading: isSubmitting }] = useSubmitMyRTWMutation();
  const [getOrCreateRoom, { isLoading: isCreatingChatRoom }] = useWorkerGetOrCreateRoomMutation();
  const currentUserId = useAppSelector((state) => state.auth.worker?.id);
  const authToken = useAppSelector((state) => state.auth.token);

  // Socket connection for real-time messaging
  const onNewMessage = (message: ChatMessage) => {
    setLocalMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  };

  const { sendMessage, isConnected, hasJoinedRoom } = useSocket({
    roomId: chatRoomId,
    onNewMessage,
  });

  // Send RTW context message when chat opens
  const sendRTWContextMessage = () => {
    const contextMessage = `Hi, I need help with my Right to Work verification. My share code (${rtw?.rtwShareCode || 'N/A'}) has been submitted and is currently pending review. Could you please check the status?`;
    console.log('🚀 Attempting to send RTW context message:', {
      message: contextMessage,
      chatRoomId,
      hasSendMessage: !!sendMessage,
      isConnected,
      hasJoinedRoom
    });
    if (sendMessage && chatRoomId) {
      sendMessage(contextMessage);
      console.log('✅ RTW context message sent via socket');
    } else {
      console.error('❌ Cannot send RTW message - missing sendMessage or chatRoomId');
    }
  };

  useEffect(() => {
    console.log('🔄 RTW Chat useEffect:', { isConnected, hasJoinedRoom, chatRoomId, showChatModal });
    if (isConnected && hasJoinedRoom && chatRoomId && showChatModal) {
      console.log('✅ All conditions met, will send RTW context message after delay');
      // Small delay to ensure socket is ready
      const timer = setTimeout(() => {
        console.log('⏰ Timer triggered, sending RTW context message...');
        sendRTWContextMessage();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      console.log('⏳ Waiting for conditions:', {
        isConnected,
        hasJoinedRoom,
        hasChatRoomId: !!chatRoomId,
        showChatModal
      });
    }
  }, [isConnected, hasJoinedRoom, chatRoomId, showChatModal]);

  const rtw = (rtwData as any)?.data || rtwData;
  const rtwStatus = rtw?.rtwStatus || 'NOT_STARTED';

  const isExpired = rtwStatus === 'EXPIRED';
  const isPending = rtwStatus === 'PENDING';
  const hasNoShareCode = !rtw?.rtwShareCode;
  // Show form when: no share code, expired, rejected, or requires review
  const needsShareCodeUpdate = ['NOT_STARTED', 'EXPIRED', 'REJECTED', 'REQUIRES_REVIEW'].includes(rtwStatus) || hasNoShareCode;
  // Show contact admin when: pending (share code submitted, awaiting compliance verification)
  const needsAdminAction = isPending;

  // Don't show if loading or approved
  if (rtwLoading || rtwStatus === 'APPROVED') {
    return null;
  }

  // Don't show if no action needed
  if (!needsShareCodeUpdate && !needsAdminAction) {
    return null;
  }

  const bgColor = isDark ? '#0D0D1A' : '#FFFFFF';

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const cleanCode = shareCode.trim().replace(/[-\s]/g, '');
    if (!cleanCode) newErrors.shareCode = 'Share code is required';
    else if (cleanCode.length !== 9) newErrors.shareCode = 'Share code must be 9 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSuccessMsg('');
    try {
      await submitRTW({
        shareCode: shareCode.trim().replace(/[-\s]/g, ''),
        dateOfBirth: dobDate ? dobDate.toISOString().split('T')[0] : '',
      }).unwrap();
      setSuccessMsg('Share code submitted! Your RTW is now being reviewed.');
      setShareCode('');
      setDateOfBirth('');
      setDobDate(undefined);
      setErrors({});
      setTimeout(() => refetch(), 1500);
    } catch (err: any) {
      setErrors({ submit: err?.data?.message || 'Submission failed. Please check your details and try again.' });
    }
  };

  const renderModal = () => {
    // ── PENDING: Contact Admin Modal ──
    if (needsAdminAction) {
      return (
        <View style={{ flex: 1, backgroundColor: bgColor }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20, paddingHorizontal: 24 }}
          >
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <View style={{
                  width: 80, height: 80, borderRadius: 40,
                  backgroundColor: '#3B82F615',
                  alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Ionicons name="hourglass-outline" size={40} color="#3B82F6" />
                </View>
                <H1 style={{ textAlign: 'center', marginBottom: 8 }}>RTW Verification Pending</H1>
                <Body color="secondary" style={{ textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 }}>
                  Your share code has been submitted and is awaiting verification by your employer's compliance team.
                </Body>
              </View>

              {rtw?.rtwShareCode && (
                <View style={{
                  backgroundColor: isDark ? '#1A1A2E' : '#F3F4F6',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 24,
                  alignItems: 'center',
                }}>
                  <Body color="muted" style={{ fontSize: 12, marginBottom: 4 }}>Share Code Submitted</Body>
                  <Body style={{ fontSize: 18, fontWeight: '700', letterSpacing: 2 }}>{rtw.rtwShareCode}</Body>
                </View>
              )}

              <View style={{
                backgroundColor: `${primaryColor}10`,
                borderLeftWidth: 4,
                borderLeftColor: primaryColor,
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Ionicons name="call-outline" size={20} color={primaryColor} style={{ marginRight: 10, marginTop: 1 }} />
                  <View style={{ flex: 1 }}>
                    <Body style={{ fontWeight: '600', fontSize: 14, marginBottom: 4 }}>Contact Your Admin</Body>
                    <Body color="secondary" style={{ lineHeight: 20, fontSize: 13 }}>
                      Please contact your agency administrator to complete the Right to Work verification. They will review and approve your share code.
                    </Body>
                  </View>
                </View>
              </View>

              <Button onPress={() => refetch()}>
                Check Status
              </Button>

              <View style={{ alignItems: 'center', marginTop: 16 }}>
                <TouchableOpacity
                  onPress={async () => {
                    if (!authToken) {
                      console.error('❌ No auth token available');
                      return;
                    }
                    console.log('🔍 Creating chat room...');
                    try {
                      const result = await getOrCreateRoom().unwrap();
                      if (result.data) {
                        console.log('✅ Chat room created successfully:', result.data.id);
                        setChatRoomId(result.data.id);
                        setShowChatModal(true);
                      } else {
                        console.error('❌ No room data in response');
                      }
                    } catch (err: any) {
                      console.error('❌ Failed to get/create chat room:', err);
                      // Show error to user
                      setErrors({ submit: 'Unable to connect to chat. Please try again.' });
                    }
                  }}
                  disabled={isCreatingChatRoom || !authToken}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                    backgroundColor: `${primaryColor}10`,
                    borderWidth: 1,
                    borderColor: primaryColor,
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={18} color={primaryColor} style={{ marginRight: 8 }} />
                  <Body style={{ color: primaryColor, fontWeight: '600', fontSize: 14 }}>
                    Quick Chat with Admin
                  </Body>
                </TouchableOpacity>
              </View>

              <View style={{ alignItems: 'center', marginTop: 24 }}>
                <Body color="muted" style={{ fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
                  This verification is required by your employer to comply with UK employment law.
                </Body>
              </View>

              <View style={{ alignItems: 'center', marginTop: 20 }}>
                <TouchableOpacity
                  onPress={() => dispatch(logout())}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16 }}
                >
                  <Ionicons name="log-out-outline" size={16} color="#EF4444" />
                  <Body style={{ color: '#EF4444', fontSize: 13, fontWeight: '600' }}>Log Out</Body>
                </TouchableOpacity>
              </View>

            {/* Error Message */}
            {errors.submit && (
              <View style={{
                backgroundColor: '#FEF2F2',
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Ionicons name="close-circle" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                <Body style={{ color: '#991B1B', fontSize: 13, flex: 1 }}>{errors.submit}</Body>
              </View>
            )}
            </ScrollView>
        </View>
      );
    }

    // ── Status config for share code update form ──
    const statusConfig: Record<string, { icon: string; color: string; title: string; description: string }> = {
      NOT_STARTED: {
        icon: 'shield-outline',
        color: '#F59E0B',
        title: 'Right to Work Verification Required',
        description: 'You need to verify your Right to Work before you can access shifts and other features. Please enter your share code below.',
      },
      EXPIRED: {
        icon: 'alert-circle-outline',
        color: '#EF4444',
        title: 'Share Code Expired',
        description: 'Your Right to Work share code has expired. Please obtain a new share code from the Home Office and enter it below to continue.',
      },
      REJECTED: {
        icon: 'close-circle-outline',
        color: '#EF4444',
        title: 'RTW Verification Failed',
        description: 'Your Right to Work verification was unsuccessful. Please check your details and try again with a valid share code.',
      },
      REQUIRES_REVIEW: {
        icon: 'time-outline',
        color: '#F59E0B',
        title: 'RTW Needs Attention',
        description: 'Your Right to Work status requires an update. Please submit your current share code to proceed.',
      },
    };

    const config = statusConfig[rtwStatus] || statusConfig.NOT_STARTED;

    // ── Share Code Update Form ──
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: bgColor }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20, paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
        >
            {/* Status Icon */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{
                width: 80, height: 80, borderRadius: 40,
                backgroundColor: `${config.color}15`,
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Ionicons name={config.icon as any} size={40} color={config.color} />
              </View>
              <H1 style={{ textAlign: 'center', marginBottom: 8 }}>{config.title}</H1>
              <Body color="secondary" style={{ textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 }}>
                {config.description}
              </Body>
            </View>

            {/* Info Box */}
            <View style={{
              backgroundColor: `${primaryColor}10`,
              borderLeftWidth: 4,
              borderLeftColor: primaryColor,
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Ionicons name="information-circle" size={20} color={primaryColor} style={{ marginRight: 10, marginTop: 1 }} />
                <View style={{ flex: 1 }}>
                  <Body color="secondary" style={{ lineHeight: 20, fontSize: 13 }}>
                    You can get your 9-character share code from the{' '}
                    <Body style={{ fontWeight: '700', fontSize: 13 }}>Home Office online service</Body>.
                  </Body>
                  <TouchableOpacity onPress={() => Linking.openURL('https://www.gov.uk/view-right-to-work')} style={{ marginTop: 6 }}>
                    <Body style={{ color: primaryColor, fontWeight: '600', fontSize: 13 }}>
                      Get your share code →
                    </Body>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Expiry Warning */}
            {isExpired && rtw?.rtwExpiresAt && (
              <View style={{
                backgroundColor: '#FEF2F2',
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Ionicons name="warning" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                <Body style={{ color: '#991B1B', fontSize: 13, flex: 1 }}>
                  Expired on {new Date(rtw.rtwExpiresAt).toLocaleDateString('en-GB')}
                </Body>
              </View>
            )}

            {/* Form */}
            <View style={{ gap: 16, marginBottom: 24 }}>
              <Input
                label="Share Code"
                placeholder="e.g: A23 - 994 - 49H"
                value={shareCode}
                onChangeText={(t) => { setShareCode(t.toUpperCase()); setErrors({ ...errors, shareCode: '' }); }}
                autoCapitalize="characters"
                error={errors.shareCode}
                hint="9-character code from the Home Office"
              />
              <Input
                label="Date of Birth (optional)"
                placeholder="DD/MM/YYYY"
                value={dateOfBirth}
                onPressIn={() => setShowDatePicker(true)}
                editable={false}
                error={errors.dateOfBirth}
                hint="Must match the date on your RTW check"
              />

              <DatePickerModal
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => {
                  const dd = date.getDate().toString().padStart(2, '0');
                  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
                  const yyyy = date.getFullYear();
                  setDobDate(date);
                  setDateOfBirth(`${dd}/${mm}/${yyyy}`);
                  setErrors({ ...errors, dateOfBirth: '' });
                  setShowDatePicker(false);
                }}
                initialDate={dobDate || new Date(2000, 0, 1)}
                maximumDate={new Date()}
              />
            </View>

            {/* Error / Success Messages */}
            {errors.submit && (
              <View style={{
                backgroundColor: '#FEF2F2',
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Ionicons name="close-circle" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                <Body style={{ color: '#991B1B', fontSize: 13, flex: 1 }}>{errors.submit}</Body>
              </View>
            )}

            {successMsg !== '' && (
              <View style={{
                backgroundColor: '#F0FDF4',
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Ionicons name="checkmark-circle" size={18} color="#16A34A" style={{ marginRight: 8 }} />
                <Body style={{ color: '#166534', fontSize: 13, flex: 1 }}>{successMsg}</Body>
              </View>
            )}

            {/* Submit Button */}
            <Button onPress={handleSubmit} loading={isSubmitting} disabled={isSubmitting}>
              {isExpired ? 'Update Share Code' : 'Submit Share Code'}
            </Button>

            {/* Footer */}
            <View style={{ alignItems: 'center', marginTop: 24 }}>
              <Body color="muted" style={{ fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
                This verification is required by your employer to comply with UK employment law.
              </Body>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
    );
  };

  
  // Single modal approach - render either main content or chat
  return (
    <Modal visible animationType="slide" transparent={false} statusBarTranslucent>
      {showChatModal ? (
        // Real Chat Interface
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, backgroundColor: isDark ? '#0D0D1A' : '#FFFFFF' }}
        >
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: insets.top + 16,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#374151' : '#E5E7EB',
          }}>
            <TouchableOpacity onPress={() => setShowChatModal(false)} style={{ marginRight: 12 }}>
              <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? '#374151' : '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              <Ionicons 
                name="person" 
                size={20} 
                color={isDark ? '#9CA3AF' : '#6B7280'} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Body style={{ fontSize: 16, fontWeight: '600', color: isDark ? '#FFFFFF' : '#000000' }}>
                Admin Support
              </Body>
              {isConnected && (
                <Body style={{ fontSize: 12, color: primaryColor }}>Online</Body>
              )}
            </View>
            {!isConnected && (
              <View style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 10,
                backgroundColor: '#FEF3C7',
              }}>
                <Body style={{ fontSize: 10, color: '#92400E' }}>Reconnecting</Body>
              </View>
            )}
          </View>

          {/* Messages */}
          <ScrollView
            style={{ flex: 1, paddingHorizontal: 20 }}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
          >
            
            {/* Chat messages */}
            {localMessages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <View key={msg.id} style={{ alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                  <View style={{
                    backgroundColor: isMe ? (primaryColor) : (isDark ? '#374151' : '#F3F4F6'),
                    borderRadius: 16,
                    borderBottomRightRadius: isMe ? 4 : 16,
                    borderBottomLeftRadius: isMe ? 16 : 4,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    maxWidth: '75%',
                  }}>
                    <Body style={{ color: isMe ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#1F2937'), fontSize: 14 }}>
                      {msg.content}
                    </Body>
                  </View>
                  <Body style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, marginHorizontal: 4 }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Body>
                </View>
              );
            })}

            {localMessages.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
                <Body style={{ color: '#9CA3AF', marginTop: 12, textAlign: 'center' }}>
                  Admin will respond shortly{'\n'}to help with your RTW verification
                </Body>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: isDark ? '#374151' : '#E5E7EB',
            paddingBottom: Math.max(insets.bottom, 12),
          }}>
            <View style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
              borderRadius: 24,
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginRight: 12,
            }}>
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: isDark ? '#FFFFFF' : '#000000',
                  paddingVertical: 4,
                }}
                placeholder="Type your message..."
                placeholderTextColor="#9CA3AF"
                value={chatMessage}
                onChangeText={setChatMessage}
                multiline
                maxLength={500}
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                if (chatMessage.trim() && chatRoomId) {
                  sendMessage(chatMessage.trim());
                  setChatMessage('');
                }
              }}
              disabled={!chatMessage.trim() || !isConnected}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: chatMessage.trim() && isConnected ? primaryColor : '#D1D5DB',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        // Main Modal Content
        renderModal()
      )}
    </Modal>
  );
}

export default RTWBlockerModal;
