import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '../store/hooks';
import { API_BASE_URL } from '../services/endpoints';
import type { ChatMessage } from '../store/api/chatApi';

// Socket server URL (strip /api/v1 path)
const SOCKET_URL = API_BASE_URL.replace('/api/v1', '');

interface UseSocketOptions {
  roomId?: string;
  onNewMessage?: (message: ChatMessage) => void;
  onTyping?: (data: { userId: string; isTyping: boolean }) => void;
  onMessagesRead?: (data: { roomId: string; readBy: string }) => void;
}

export function useSocket({ roomId, onNewMessage, onTyping, onMessagesRead }: UseSocketOptions = {}) {
  const token = useAppSelector((state) => state.auth.token);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);

  // Use refs to prevent useEffect from running when callbacks change
  const onNewMessageRef = useRef(onNewMessage);
  const onTypingRef = useRef(onTyping);
  const onMessagesReadRef = useRef(onMessagesRead);

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
    onTypingRef.current = onTyping;
    onMessagesReadRef.current = onMessagesRead;
  }, [onNewMessage, onTyping, onMessagesRead]);

  // Initialize socket connection
  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Socket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.log('❌ Socket connection error:', err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [token]);

  // Join/leave room and set up room-specific listeners
  useEffect(() => {
    const socket = socketRef.current;
    console.log('🔌 Room join useEffect:', { hasSocket: !!socket, isConnected, roomId });
    if (!socket || !isConnected || !roomId) {
      console.log('⏳ Skipping room join - missing prerequisites');
      return;
    }

    console.log('📤 Emitting chat:join for room:', roomId);
    setHasJoinedRoom(false);
    socket.emit('chat:join', { roomId });

    const handleJoined = (data: { roomId: string }) => {
      console.log('✅ Received chat:joined event for room:', data.roomId);
      setHasJoinedRoom(true);
    };

    const handleMessage = (message: any) => {
      // Transform backend message format to frontend ChatMessage interface
      const transformedMessage: ChatMessage = {
        id: message.id || crypto.randomUUID(),
        chatRoomId: message.chatRoomId || '',
        senderId: message.senderId || '',
        content: message.content || '',
        messageType: message.messageType || 'TEXT' as any,
        status: message.status || 'SENT' as const,
        createdAt: message.createdAt || new Date().toISOString(),
        readAt: message.readAt || null,
        sender: message.sender || {
          id: message.senderId || '',
          fullName: '', // Backend doesn't send sender name in socket message
          role: message.senderType || 'user' // Use senderType as role if available
        },
        attachments: message.attachments || []
      };
      onNewMessageRef.current?.(transformedMessage);
    };

    const handleTyping = (data: { userId: string; isTyping: boolean }) => {
      onTypingRef.current?.(data);
    };

    const handleRead = (data: { roomId: string; readBy: string }) => {
      onMessagesReadRef.current?.(data);
    };

    socket.on('chat:joined', handleJoined);
    socket.on('chat:message', handleMessage);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:messages_read', handleRead);

    return () => {
      socket.emit('chat:leave', { roomId });
      setHasJoinedRoom(false);
      socket.off('chat:joined', handleJoined);
      socket.off('chat:message', handleMessage);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:messages_read', handleRead);
    };
  }, [roomId, isConnected]);

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('chat:message', { 
      roomId: roomId,
      content: content,
      attachments: []
    });
  }, [roomId]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('chat:typing', { roomId, isTyping });
  }, [roomId]);

  const markAsRead = useCallback(() => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('chat:read', { roomId });
  }, [roomId]);

  return {
    isConnected,
    hasJoinedRoom,
    sendMessage,
    sendTyping,
    markAsRead,
  };
}
