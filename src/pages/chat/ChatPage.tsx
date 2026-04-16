import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  EmojiEmotions,
  AttachFile,
  Send,
  Add,
  DoneAll,
  Done,
  ChatBubbleOutline,
  Image,
  Description,
  AudioFile,
} from '@mui/icons-material';
import {
  Box,
  styled,
  TextField,
  InputAdornment,
  Avatar,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Menu,
  MenuItem,
} from '@mui/material';
import { useDocumentTitle, useWebSocket } from '../../hooks';
import { useAppSelector } from '../../store';
import { DashboardContainer } from '../../components/layout';
import { colors } from '../../utilities/colors';
import { API_BASE_URL } from '../../services/endpoints';
import {
  useGetMyRoomsQuery,
  useGetOrCreateRoomMutation,
  useGetRoomMessagesQuery,
  useMarkRoomAsReadMutation,
  useGetAssignedWorkersQuery,
} from '../../store/slices/chatSlice';
import type { ChatMessage, ChatRoom } from '../../types/api';

// ============ HELPERS ============
function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

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

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function transformMessage(message: any): ChatMessage {
  return {
    id: message.id || crypto.randomUUID(),
    chatRoomId: message.chatRoomId || message.room || '',
    senderId: message.senderId || message.from || '',
    senderType: message.senderType || ('user' as const),
    content: message.content || message.text || '',
    messageType: message.messageType || 'TEXT',
    status: message.status || ('SENT' as const),
    createdAt: message.createdAt || message.timestamp || new Date().toISOString(),
    readAt: message.readAt || null,
    sender: message.sender || {
      id: message.senderId || message.from || '',
      fullName: '',
      role: '',
    },
    senderUser: message.senderUser || message.sender || {
      id: message.senderId || message.from || '',
      fullName: '',
      role: '',
    },
    attachments: message.attachments || [],
  };
}

// ============ STYLED COMPONENTS ============
const PageTitle = styled('h1')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '28px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: '0 0 24px',
});

const ChatContainer = styled(Box)({
  display: 'flex',
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  height: 'calc(100vh - 180px)',
  minHeight: '500px',
  overflow: 'hidden',
});

const InboxPanel = styled(Box)({
  width: '380px',
  borderRight: '1px solid #E5E7EB',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
});

const InboxHeader = styled(Box)({
  padding: '20px 20px 16px',
  '& h2': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '18px',
    fontWeight: 700,
    color: colors.primary.navy,
    margin: '0 0 16px',
  },
});

const InboxSearchRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const InboxSearch = styled(TextField)({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#F9FAFB',
    '& fieldset': { borderColor: '#E5E7EB' },
  },
  '& .MuiInputBase-input': {
    padding: '10px 14px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
  },
});

const NewChatBtn = styled(IconButton)({
  backgroundColor: colors.primary.blue,
  color: colors.secondary.white,
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  '&:hover': { backgroundColor: '#0099D6' },
});

const InboxList = styled(Box)({
  flex: 1,
  overflowY: 'auto',
});

const InboxItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '14px 20px',
  cursor: 'pointer',
  backgroundColor: active ? '#F0F7FF' : 'transparent',
  borderLeft: active ? `3px solid ${colors.primary.blue}` : '3px solid transparent',
  transition: 'background-color 0.15s ease',
  '&:hover': { backgroundColor: active ? '#F0F7FF' : '#F9FAFB' },
}));

const InboxItemContent = styled(Box)({
  flex: 1,
  minWidth: 0,
  '& .name': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: colors.primary.navy,
  },
  '& .preview': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    color: colors.text.secondary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: '2px',
  },
});

const InboxItemMeta = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '4px',
  flexShrink: 0,
  '& .time': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    color: colors.text.secondary,
  },
});

const UnreadBadge = styled(Box)({
  backgroundColor: colors.primary.blue,
  color: colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '11px',
  fontWeight: 600,
  borderRadius: '10px',
  minWidth: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 6px',
});

const ConversationPanel = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

const ConversationHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px 20px',
  borderBottom: '1px solid #E5E7EB',
});

const MessagesArea = styled(Box)({
  flex: 1,
  padding: '20px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

const DateDivider = styled(Box)({
  textAlign: 'center',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  color: colors.text.secondary,
  margin: '8px 0',
});

const InputArea = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px 20px',
  borderTop: '1px solid #E5E7EB',
});

const MessageInput = styled(TextField)({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    borderRadius: '24px',
    backgroundColor: '#F9FAFB',
    '& fieldset': { borderColor: '#E5E7EB' },
  },
  '& .MuiInputBase-input': {
    padding: '12px 16px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
  },
});

const SendButton = styled(IconButton)({
  backgroundColor: colors.primary.blue,
  color: colors.secondary.white,
  width: '40px',
  height: '40px',
  '&:hover': { backgroundColor: '#0099D6' },
});

const EmptyState = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  color: colors.text.secondary,
});

const TypingIndicator = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  color: colors.primary.blue,
  fontStyle: 'italic',
});

// ============ COMPONENT ============
export function ChatPage() {
  useDocumentTitle('Chat');

  const currentUser = useAppSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id;

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [workerSearch, setWorkerSearch] = useState('');
  const [attachmentMenuAnchor, setAttachmentMenuAnchor] = useState<null | HTMLElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: rooms = [], isLoading: isLoadingRooms, refetch: refetchRooms } = useGetMyRoomsQuery();

  const { data: messages = [], isLoading: isLoadingMessages } = useGetRoomMessagesQuery(
    { roomId: selectedRoomId! },
    { skip: !selectedRoomId, refetchOnMountOrArgChange: true }
  );

  
  const { data: workers = [] } = useGetAssignedWorkersQuery(undefined, { skip: !newChatDialogOpen });

  const [getOrCreateRoom] = useGetOrCreateRoomMutation();
  const [markAsReadApi] = useMarkRoomAsReadMutation();

  const selectedRoom = rooms.find((r: ChatRoom) => r.id === selectedRoomId);

  const otherUser = selectedRoom
    ? selectedRoom.hrUserId === currentUserId
      ? selectedRoom.worker
      : selectedRoom.hrUser
    : null;

  const onNewMessage = useCallback((msg: ChatMessage) => {
    setLocalMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const onTyping = useCallback(
    (data: { userId: string; isTyping: boolean }) => {
      if (String(data.userId) !== String(currentUserId)) {
        setIsOtherTyping(data.isTyping);
      }
    },
    [currentUserId]
  );

  const onNewRoomMessage = useCallback(() => {
    refetchRooms();
  }, [refetchRooms]);

  const { sendMessage: socketSend, sendTyping, markAsRead, isConnected } = useWebSocket({
    roomId: selectedRoomId,
    onNewMessage,
    onTyping,
    onNewRoomMessage,
  });

  useEffect(() => {
    if (messages.length > 0) {
      setLocalMessages((prev) => {
        const transformedMessages = messages.map(transformMessage);
        const fetchedIds = new Set(transformedMessages.map((m: ChatMessage) => m.id));
        const socketOnly = prev.filter((m) => !fetchedIds.has(m.id));
        return [...transformedMessages, ...socketOnly];
      });
    } else {
      setLocalMessages([]);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  useEffect(() => {
    if (selectedRoomId && isConnected) {
      markAsRead();
      markAsReadApi(selectedRoomId);
    }
  }, [selectedRoomId, isConnected, markAsRead, markAsReadApi]);

  useEffect(() => {
    setLocalMessages([]);
    setIsOtherTyping(false);
  }, [selectedRoomId]);

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  const handleSend = () => {
    const text = message.trim();
    if (!text || !selectedRoomId) return;
    socketSend(text);
    setMessage('');
    sendTyping(false);
  };

  const handleInputChange = (text: string) => {
    setMessage(text);

    if (text.length > 0) {
      sendTyping(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(false);
      }, 2000);
    } else {
      sendTyping(false);
    }
  };

  const handleStartNewChat = async (workerId: string) => {
    try {
      const room = await getOrCreateRoom({ workerId }).unwrap();
      setNewChatDialogOpen(false);
      setWorkerSearch('');

      if (room) {
        setSelectedRoomId(room.id);
      }
    } catch (err) {
      console.error('Failed to create chat room:', err);
    }
  };

  const handleAttachmentMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAttachmentMenuAnchor(event.currentTarget);
  };

  const handleAttachmentMenuClose = () => {
    setAttachmentMenuAnchor(null);
  };

  const handleFileSelect = () => {
    handleAttachmentMenuClose();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedRoomId) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResult = await fetch(`${API_BASE_URL}/chat/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'X-API-Key': import.meta.env.VITE_API_KEY || '',
        },
        body: formData,
      }).then((res) => res.json());

      if (!uploadResult.success) {
        throw new Error(uploadResult.message || 'Failed to upload file');
      }

      const attachment = uploadResult.data;

      let messageType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' = 'DOCUMENT';

      if (file.type.startsWith('image/')) {
        messageType = 'IMAGE';
      } else if (file.type.startsWith('video/')) {
        messageType = 'VIDEO';
      } else if (file.type.startsWith('audio/')) {
        messageType = 'AUDIO';
      }

      const messageResult = await fetch(
        `${API_BASE_URL}/chat/rooms/${selectedRoomId}/send-with-attachments`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
            'X-API-Key': import.meta.env.VITE_API_KEY || '',
          },
          body: JSON.stringify({
            content: `Shared ${file.name}`,
            messageType,
            attachments: [attachment],
          }),
        }
      ).then((res) => res.json());

      if (!messageResult.success) {
        throw new Error(messageResult.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('File upload error:', error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
 

  const filteredRooms = rooms.filter((r: ChatRoom) => {
    if (!searchTerm) return true;
    const name =
      r.hrUserId === currentUserId
        ? r.worker?.fullName || 'Unknown'
        : r.hrUser?.fullName || 'Unknown';

    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredWorkers = workers.filter((w) => {
    if (!workerSearch) return true;
    return (
      w.fullName.toLowerCase().includes(workerSearch.toLowerCase()) ||
      w.email.toLowerCase().includes(workerSearch.toLowerCase())
    );
  });

  return (
    <DashboardContainer>
      <PageTitle>Chat</PageTitle>

      <ChatContainer>
        {/* Left sidebar */}
        <InboxPanel>
          <InboxHeader>
            <h2>Inbox</h2>

            <InboxSearchRow>
              <InboxSearch
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#9CA3AF', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <NewChatBtn onClick={() => setNewChatDialogOpen(true)} title="New Chat">
                <Add sx={{ fontSize: 20 }} />
              </NewChatBtn>
            </InboxSearchRow>
          </InboxHeader>

          <InboxList>
            {isLoadingRooms ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : filteredRooms.length === 0 ? (
              <EmptyState sx={{ py: 4 }}>
                <ChatBubbleOutline sx={{ fontSize: 36 }} />
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}>
                  {searchTerm ? 'No conversations found' : 'No conversations yet'}
                </Typography>
                <Typography
                  onClick={() => setNewChatDialogOpen(true)}
                  sx={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '13px',
                    color: colors.primary.blue,
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Start a new chat
                </Typography>
              </EmptyState>
            ) : (
              filteredRooms.map((room: ChatRoom) => {
                const other = room.hrUserId === currentUserId ? room.worker : room.hrUser;
                const lastMsg = room.messages?.[0];

                return (
                  <InboxItem
                    key={room.id}
                    active={room.id === selectedRoomId}
                    onClick={() => handleSelectRoom(room.id)}
                  >
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: '#E5E7EB',
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {getInitials(other?.fullName || '?')}
                    </Avatar>

                    <InboxItemContent>
                      <div className="name">{other?.fullName || 'Unknown'}</div>
                      <div className="preview">
                        {lastMsg ? lastMsg.content : 'No messages yet'}
                      </div>
                    </InboxItemContent>

                    <InboxItemMeta>
                      <span className="time">{formatRelativeTime(room.lastMessageAt)}</span>
                      {room.unreadCount > 0 && <UnreadBadge>{room.unreadCount}</UnreadBadge>}
                    </InboxItemMeta>
                  </InboxItem>
                );
              })
            )}
          </InboxList>
        </InboxPanel>

        {/* Right side */}
        {!selectedRoomId ? (
          <EmptyState>
            <ChatBubbleOutline sx={{ fontSize: 56, color: '#D1D5DB' }} />
            <Typography
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '16px',
                fontWeight: 600,
                color: colors.primary.navy,
              }}
            >
              Select a conversation
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
                color: colors.text.secondary,
              }}
            >
              Choose a chat from the inbox or start a new conversation
            </Typography>
          </EmptyState>
        ) : (
          <ConversationPanel>
            <ConversationHeader>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: '#E5E7EB',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {otherUser ? getInitials(otherUser.fullName) : '?'}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '16px',
                    fontWeight: 600,
                    color: colors.primary.navy,
                  }}
                >
                  {otherUser?.fullName || 'Chat'}
                </Typography>
                {isOtherTyping && <TypingIndicator>typing...</TypingIndicator>}
              </Box>

              {!isConnected && (
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '12px',
                    bgcolor: '#FEF3C7',
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '11px',
                    color: '#D97706',
                  }}
                >
                  reconnecting...
                </Box>
              )}
            </ConversationHeader>

            <MessagesArea>
              {isLoadingMessages && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              )}

              {groupedMessages.map((group) => (
                <Box key={group.label}>
                  <DateDivider>{group.label}</DateDivider>

                  {group.messages.map((msg) => {
                    const isMine = String(msg.senderId) === String(currentUserId);
                    const senderName =
                      (msg.sender as any)?.fullName ||
                      (msg as any)?.senderUser?.fullName ||
                      'User';

                    return (
                      <Box
                        key={msg.id}
                        sx={{
                          display: 'flex',
                          justifyContent: isMine ? 'flex-end' : 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            flexDirection: isMine ? 'row-reverse' : 'row',
                            gap: 1,
                            maxWidth: '75%',
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: isMine ? colors.primary.blue : '#E5E7EB',
                              fontSize: 11,
                              color: isMine ? '#fff' : colors.primary.navy,
                              flexShrink: 0,
                            }}
                          >
                            {isMine
                              ? getInitials((currentUser as any)?.fullName || 'Me')
                              : getInitials(senderName)}
                          </Avatar>

                          <Box>
                            <Box
                              sx={{
                                px: 2,
                                py: 1.5,
                                borderRadius: isMine
                                  ? '12px 12px 4px 12px'
                                  : '12px 12px 12px 4px',
                                backgroundColor: isMine ? colors.primary.blue : '#F3F4F6',
                                color: isMine ? colors.secondary.white : colors.primary.navy,
                                fontFamily: "'Outfit', sans-serif",
                                fontSize: '14px',
                                lineHeight: 1.5,
                                wordBreak: 'break-word',
                              }}
                            >
                              {msg.content && (
                                <Box sx={{ mb: msg.attachments?.length ? 1 : 0 }}>
                                  {msg.content}
                                </Box>
                              )}

                              {msg.attachments && msg.attachments.length > 0 && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {msg.attachments.map((attachment: any) => {
                                    if (!attachment || !attachment.id) return null;

                                    if (attachment.fileType?.startsWith('image/')) {
                                      return (
                                        <Box
                                          key={attachment.id}
                                          component="img"
                                          src={attachment.fileUrl}
                                          alt={attachment.fileName}
                                          sx={{
                                            maxWidth: '220px',
                                            maxHeight: '220px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'block',
                                          }}
                                          onClick={() =>
                                            window.open(attachment.fileUrl, '_blank')
                                          }
                                        />
                                      );
                                    }

                                    if (attachment.fileType?.startsWith('video/')) {
                                      return (
                                        <Box key={attachment.id}>
                                          <Box
                                            component="video"
                                            src={attachment.fileUrl}
                                            controls
                                            sx={{
                                              maxWidth: '220px',
                                              maxHeight: '220px',
                                              borderRadius: '8px',
                                            }}
                                          />
                                        </Box>
                                      );
                                    }

                                    if (attachment.fileType?.startsWith('audio/')) {
                                      return (
                                        <Box key={attachment.id}>
                                          <Box
                                            component="audio"
                                            src={attachment.fileUrl}
                                            controls
                                            sx={{ maxWidth: '220px' }}
                                          />
                                        </Box>
                                      );
                                    }

                                    return (
                                      <Box
                                        key={attachment.id}
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1,
                                          p: 1,
                                          bgcolor: isMine
                                            ? 'rgba(255,255,255,0.12)'
                                            : 'rgba(0,0,0,0.05)',
                                          borderRadius: '8px',
                                          cursor: 'pointer',
                                        }}
                                        onClick={() =>
                                          window.open(attachment.fileUrl, '_blank')
                                        }
                                      >
                                        {attachment.fileType?.includes('pdf') ? (
                                          <Description sx={{ fontSize: 24 }} />
                                        ) : (
                                          <AttachFile sx={{ fontSize: 24 }} />
                                        )}

                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                          <Typography
                                            sx={{
                                              fontSize: '12px',
                                              fontWeight: 500,
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                            }}
                                          >
                                            {attachment.fileName}
                                          </Typography>
                                          <Typography sx={{ fontSize: '10px', opacity: 0.7 }}>
                                            {attachment.fileSize
                                              ? `${(attachment.fileSize / 1024).toFixed(1)} KB`
                                              : ''}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    );
                                  })}
                                </Box>
                              )}
                            </Box>

                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                mt: 0.5,
                                justifyContent: isMine ? 'flex-end' : 'flex-start',
                              }}
                            >
                              <Typography sx={{ fontSize: '12px', color: colors.text.secondary }}>
                                {formatTime(msg.createdAt)}
                              </Typography>

                              {isMine &&
                                (msg.status === 'READ' ? (
                                  <DoneAll sx={{ fontSize: 14, color: colors.primary.blue }} />
                                ) : msg.status === 'DELIVERED' ? (
                                  <DoneAll sx={{ fontSize: 14, color: '#9CA3AF' }} />
                                ) : (
                                  <Done sx={{ fontSize: 14, color: '#9CA3AF' }} />
                                ))}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              ))}

              {localMessages.length === 0 && !isLoadingMessages && (
                <EmptyState>
                  <ChatBubbleOutline sx={{ fontSize: 40, color: '#D1D5DB' }} />
                  <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}>
                    No messages yet. Send a message to start the conversation.
                  </Typography>
                </EmptyState>
              )}

              <div ref={messagesEndRef} />
            </MessagesArea>

            <InputArea>
              <IconButton size="small">
                <EmojiEmotions sx={{ color: '#9CA3AF' }} />
              </IconButton>

              <MessageInput
                placeholder="Type here..."
                value={message}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />

              <IconButton size="small" onClick={handleAttachmentMenuOpen}>
                <AttachFile sx={{ color: '#9CA3AF' }} />
              </IconButton>

              <SendButton onClick={handleSend} disabled={!message.trim()}>
                <Send sx={{ fontSize: 18 }} />
              </SendButton>

              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="image/*,video/*,application/pdf,.doc,.docx,audio/*"
              />

              <Menu
                anchorEl={attachmentMenuAnchor}
                open={Boolean(attachmentMenuAnchor)}
                onClose={handleAttachmentMenuClose}
                PaperProps={{
                  sx: { mt: 1, minWidth: 200 },
                }}
              >
                <MenuItem onClick={handleFileSelect}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Image sx={{ color: '#9CA3AF' }} />
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}>
                      Photo & Video
                    </Typography>
                  </Box>
                </MenuItem>

                <MenuItem onClick={handleFileSelect}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Description sx={{ color: '#9CA3AF' }} />
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}>
                      Document
                    </Typography>
                  </Box>
                </MenuItem>

                <MenuItem onClick={handleFileSelect}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AudioFile sx={{ color: '#9CA3AF' }} />
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}>
                      Audio
                    </Typography>
                  </Box>
                </MenuItem>
              </Menu>
            </InputArea>
          </ConversationPanel>
        )}
      </ChatContainer>

      <Dialog
        open={newChatDialogOpen}
        onClose={() => {
          setNewChatDialogOpen(false);
          setWorkerSearch('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            color: colors.primary.navy,
          }}
        >
          Start New Chat
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            placeholder="Search workers..."
            value={workerSearch}
            onChange={(e) => setWorkerSearch(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#9CA3AF', fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '8px',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
              },
            }}
          />

          <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
            {filteredWorkers.length === 0 ? (
              <Typography
                sx={{
                  textAlign: 'center',
                  py: 3,
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '14px',
                  color: colors.text.secondary,
                }}
              >
                No workers found
              </Typography>
            ) : (
              filteredWorkers.map((worker) => (
                <ListItem
                  key={worker.id}
                  onClick={() => handleStartNewChat(worker.id)}
                  sx={{
                    borderRadius: '8px',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#F9FAFB' },
                    mb: 0.5,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: '#E5E7EB',
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {getInitials(worker.fullName)}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={worker.fullName}
                    secondary={worker.email}
                    primaryTypographyProps={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 600,
                      fontSize: '14px',
                      color: colors.primary.navy,
                    }}
                    secondaryTypographyProps={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '13px',
                    }}
                  />
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>
      </Dialog>
    </DashboardContainer>
  );
}

export default ChatPage;