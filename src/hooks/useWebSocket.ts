import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '../store';
import type { ChatMessage } from '../types/api';

const API_BASE = 'https://backend-rp5c.onrender.com';

interface UseWebSocketOptions {
  roomId?: string | null;
  onNewMessage?: (message: ChatMessage) => void;
  onTyping?: (data: { userId: string; isTyping: boolean }) => void;
  onMessagesRead?: (data: { roomId: string; readBy: string }) => void;
  onNewRoomMessage?: (data: { roomId: string; message: ChatMessage }) => void;
}

export function useWebSocket({
  roomId,
  onNewMessage,
  onTyping,
  onMessagesRead,
  onNewRoomMessage,
}: UseWebSocketOptions = {}) {
  const token = useAppSelector((state) => state.auth.token);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    if (!token) return;

    const socket = io(API_BASE, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('🔌 Web socket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔌 Web socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.log('🔌 Web socket error:', err.message);
    });

    // Listen for new messages on any room (for inbox updates)
    socket.on('chat:new_message', (data: { roomId: string; message: ChatMessage }) => {
      onNewRoomMessage?.(data);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Join/leave specific room and set up room-specific listeners
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !isConnected || !roomId) return;

    socket.emit('chat:join', { roomId });

    const handleMessage = (message: ChatMessage) => {
      onNewMessage?.(message);
    };

    const handleTyping = (data: { userId: string; isTyping: boolean }) => {
      onTyping?.(data);
    };

    const handleRead = (data: { roomId: string; readBy: string }) => {
      onMessagesRead?.(data);
    };

    socket.on('chat:message', handleMessage);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:messages_read', handleRead);

    return () => {
      socket.emit('chat:leave', { roomId });
      socket.off('chat:message', handleMessage);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:messages_read', handleRead);
    };
  }, [roomId, isConnected, onNewMessage, onTyping, onMessagesRead]);

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('chat:message', { roomId, content });
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
    sendMessage,
    sendTyping,
    markAsRead,
  };
}
