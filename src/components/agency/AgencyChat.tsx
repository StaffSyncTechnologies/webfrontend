import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Badge,
  Divider,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ListItemButton,
} from '@mui/material';
import {
  Send,
  ArrowBack,
  Chat as ChatIcon,
  MarkEmailRead,
  Person,
  Business,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { formatDistanceToNow } from 'date-fns';
import {
  useAgencyGetMyRoomsQuery,
  useAgencyCreateRoomMutation,
  useAgencyGetAvailableClientsQuery,
  useGetRoomMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
  useGetChatUnreadCountQuery,
  ChatRoom,
  ChatMessage,
} from '../../store/api/chatApi';
import { useToast } from '../../hooks/useToast';

interface AgencyChatProps {
  agencyUserId: string;
}

export const AgencyChat: React.FC<AgencyChatProps> = ({ agencyUserId }) => {
  const theme = useTheme();
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('');

  // API hooks
  const { data: rooms, isLoading: roomsLoading, refetch: refetchRooms } = useAgencyGetMyRoomsQuery();
  const { data: unreadCount } = useGetChatUnreadCountQuery();
  const { data: availableClients, isLoading: clientsLoading } = useAgencyGetAvailableClientsQuery();
  const [createRoom] = useAgencyCreateRoomMutation();
  const { data: messages, isLoading: messagesLoading } = useGetRoomMessagesQuery(
    { roomId: selectedRoom?.id || '' },
    { skip: !selectedRoom }
  );
  const [sendMessage] = useSendMessageMutation();
  const [markAsRead] = useMarkMessagesAsReadMutation();

  // Get rooms data properly
  const roomsData = rooms?.data || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle room selection
  const handleRoomSelect = async (room: ChatRoom) => {
    setSelectedRoom(room);
    setMessageInput('');
    setShowNewChat(false);
    
    // Mark messages as read
    if (room.unreadCount > 0) {
      await markAsRead(room.id);
      refetchRooms();
    }
  };

  // Handle creating a new chat room
  const handleCreateRoom = async () => {
    if (!selectedClient) {
      toast.error('Please select a client');
      return;
    }

    try {
      const result = await createRoom({ clientUserId: selectedClient }).unwrap();
      if (result.success) {
        setSelectedRoom(result.data);
        setShowNewChat(false);
        setSelectedClient('');
        refetchRooms();
        toast.success('Chat room created');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create chat room');
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedRoom) return;

    try {
      const result = await sendMessage({
        roomId: selectedRoom.id,
        content: messageInput.trim(),
      }).unwrap();

      if (result.success) {
        setMessageInput('');
        // Messages will be updated via refetch or socket
        refetchRooms();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
  };

  // Handle message input change
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get room display name
  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.clientUser) {
      return room.clientUser.fullName;
    }
    return 'Unknown Client';
  };

  // Get room avatar
  const getRoomAvatar = (room: ChatRoom) => {
    if (room.clientUser) {
      return room.clientUser.fullName.charAt(0).toUpperCase();
    }
    return 'C';
  };

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  // Render message bubble
  const renderMessage = (message: ChatMessage) => {
    const isOwn = message.senderType === 'user';
    
    return (
      <Box
        key={message.id}
        sx={{
          display: 'flex',
          justifyContent: isOwn ? 'flex-end' : 'flex-start',
          mb: 2,
        }}
      >
        <Box
          sx={{
            maxWidth: '70%',
            backgroundColor: isOwn ? theme.palette.primary.main : theme.palette.grey[100],
            color: isOwn ? 'white' : 'text.primary',
            borderRadius: 2,
            p: 1.5,
          }}
        >
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {message.content}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.5,
              opacity: 0.7,
              fontSize: '0.75rem',
            }}
          >
            {formatMessageTime(message.createdAt)}
            {message.status === 'READ' && ' ✓'}
          </Typography>
        </Box>
      </Box>
    );
  };

  if (roomsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <ChatIcon color="primary" />
            <Typography variant="h6">Client Communications</Typography>
            {unreadCount && unreadCount.data.count > 0 && (
              <Badge badgeContent={unreadCount.data.count} color="error">
                <ChatIcon />
              </Badge>
            )}
          </Box>
          <Button
            variant="contained"
            onClick={() => setShowNewChat(true)}
            startIcon={<Person />}
            disabled={showNewChat}
          >
            New Chat
          </Button>
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Rooms List */}
        {!selectedRoom && !showNewChat && (
          <Box sx={{ width: '100%', overflow: 'auto' }}>
            {roomsData.length > 0 ? (
              <List>
                {roomsData.map((room: ChatRoom) => {
                  const roomId = room.id;
                  return (
                  <ListItemButton
                    key={roomId}
                    onClick={() => handleRoomSelect(room)}
                    selected={selectedRoom?.id === roomId}
                    sx={{
                      borderBottom: 1,
                      borderColor: 'divider',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <Avatar sx={{ mr: 2, bgcolor: theme.palette.secondary.main }}>
                      {getRoomAvatar(room)}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1">
                            {getRoomDisplayName(room)}
                          </Typography>
                          {room.unreadCount > 0 && (
                            <Chip
                              label={room.unreadCount}
                              size="small"
                              color="primary"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        room.messages.length > 0 ? (
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                color: room.unreadCount > 0 ? theme.palette.primary.main : 'inherit',
                                fontWeight: room.unreadCount > 0 ? 'bold' : 'normal',
                              }}
                            >
                              {room.messages[0].content}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatMessageTime(room.messages[0].createdAt)}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No messages yet
                          </Typography>
                        )
                      }
                    />
                  </ListItemButton>
                  );
                })}
              </List>
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                }}
              >
                <ChatIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No client conversations yet
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                  Start conversations with clients to provide support and manage their staffing needs.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setShowNewChat(true)}
                  startIcon={<Person />}
                >
                  Start New Chat
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* New Chat Form */}
        {showNewChat && (
          <Box sx={{ width: '100%', p: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <IconButton onClick={() => setShowNewChat(false)}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h6">Start New Chat</Typography>
            </Box>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Client</InputLabel>
              <Select
                value={selectedClient}
                label="Select Client"
                onChange={(e) => setSelectedClient(e.target.value)}
                disabled={clientsLoading}
              >
                {availableClients && availableClients.data.map((client: any) => (
                  <MenuItem key={client.id} value={client.id}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: theme.palette.secondary.main }}>
                        {client.fullName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{client.fullName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {client.clientCompany?.name}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                onClick={() => setShowNewChat(false)}
                sx={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateRoom}
                disabled={!selectedClient || clientsLoading}
                sx={{ flex: 1 }}
              >
                Start Chat
              </Button>
            </Box>
          </Box>
        )}

        {/* Chat Room */}
        {selectedRoom && (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Box display="flex" alignItems="center" gap={2}>
                <IconButton onClick={() => setSelectedRoom(null)}>
                  <ArrowBack />
                </IconButton>
                <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                  {getRoomAvatar(selectedRoom)}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="subtitle1">
                    {getRoomDisplayName(selectedRoom)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedRoom.clientCompany?.name}
                  </Typography>
                </Box>
                {selectedRoom.unreadCount > 0 && (
                  <IconButton onClick={() => markAsRead(selectedRoom.id)}>
                    <MarkEmailRead />
                  </IconButton>
                )}
              </Box>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {messagesLoading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress />
                </Box>
              ) : messages && messages.data.length > 0 ? (
                <>
                  {messages.data.map(renderMessage)}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No messages yet. Start the conversation!
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Message Input */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={handleMessageChange}
                  onKeyPress={handleKeyPress}
                  multiline
                  maxRows={3}
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  sx={{ minWidth: 'auto' }}
                >
                  <Send />
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
