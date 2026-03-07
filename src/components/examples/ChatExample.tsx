import React, { useState } from 'react';
import { 
  useGetMyRoomsQuery, 
  useGetRoomMessagesQuery, 
  useMarkRoomAsReadMutation,
  useGetUnreadCountQuery,
  useGetOrCreateRoomMutation,
  useGetAssignedWorkersQuery
} from '../../store/slices/chatSlice';

export const ChatExample: React.FC = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  
  // Queries
  const { data: rooms, isLoading: roomsLoading, error: roomsError } = useGetMyRoomsQuery();
  const { data: messages, isLoading: messagesLoading } = useGetRoomMessagesQuery(
    { roomId: selectedRoomId! },
    { skip: !selectedRoomId }
  );
  const { data: unreadCount } = useGetUnreadCountQuery();
  const { data: assignedWorkers } = useGetAssignedWorkersQuery();
  
  // Mutations
  const [markRoomAsRead] = useMarkRoomAsReadMutation();
  const [getOrCreateRoom] = useGetOrCreateRoomMutation();

  // Handle room selection
  const handleRoomSelect = async (roomId: string) => {
    setSelectedRoomId(roomId);
    // Mark room as read when selected
    await markRoomAsRead(roomId);
  };

  // Handle creating a direct message room with a worker
  const handleCreateDirectRoom = async (workerId: string) => {
    try {
      const result = await getOrCreateRoom({
        participantId: workerId,
        type: 'DIRECT'
      }).unwrap();
      setSelectedRoomId(result.id);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const selectedRoom = rooms?.find(room => room.id === selectedRoomId);

  return (
    <div className="chat-example" style={{ display: 'flex', height: '600px', border: '1px solid #ccc' }}>
      {/* Sidebar */}
      <div style={{ width: '300px', borderRight: '1px solid #ccc', padding: '10px' }}>
        <h3>Chat Rooms</h3>
        
        {/* Unread count indicator */}
        {unreadCount && (
          <div style={{ marginBottom: '10px', padding: '5px', backgroundColor: '#f0f0f0' }}>
            Total Unread: {unreadCount.total}
          </div>
        )}
        
        {/* Rooms list */}
        {roomsLoading ? (
          <p>Loading rooms...</p>
        ) : roomsError ? (
          <p>Error loading rooms</p>
        ) : (
          <div>
            {rooms?.map(room => (
              <div
                key={room.id}
                onClick={() => handleRoomSelect(room.id)}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  backgroundColor: selectedRoomId === room.id ? '#e0e0e0' : 'transparent',
                  borderBottom: '1px solid #eee'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{room.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {room.type} • {room.participants.length} participants
                </div>
                {room.unreadCount > 0 && (
                  <div style={{ 
                    backgroundColor: 'red', 
                    color: 'white', 
                    borderRadius: '50%', 
                    width: '20px', 
                    height: '20px', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}>
                    {room.unreadCount}
                  </div>
                )}
                {room.lastMessage && (
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>
                    {room.lastMessage.content.substring(0, 30)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Assigned workers for creating new rooms */}
        <h4 style={{ marginTop: '20px' }}>Start Conversation</h4>
        {assignedWorkers && (
          <div>
            {assignedWorkers.map(worker => (
              <div
                key={worker.id}
                onClick={() => handleCreateDirectRoom(worker.id)}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '4px',
                  marginBottom: '5px'
                }}
              >
                💬 {worker.fullName}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedRoom ? (
          <>
            {/* Room header */}
            <div style={{ padding: '15px', borderBottom: '1px solid #ccc', backgroundColor: '#f8f8f8' }}>
              <h4>{selectedRoom.name}</h4>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {selectedRoom.participants.map(p => p.user.fullName).join(', ')}
              </div>
            </div>

            {/* Messages area */}
            <div style={{ flex: 1, padding: '15px', overflowY: 'auto' }}>
              {messagesLoading ? (
                <p>Loading messages...</p>
              ) : (
                <div>
                  {messages?.map(message => (
                    <div
                      key={message.id}
                      style={{
                        marginBottom: '15px',
                        textAlign: message.senderId === 'current-user' ? 'right' : 'left'
                      }}
                    >
                      <div style={{
                        display: 'inline-block',
                        padding: '10px',
                        borderRadius: '10px',
                        backgroundColor: message.senderId === 'current-user' ? '#007bff' : '#f0f0f0',
                        color: message.senderId === 'current-user' ? 'white' : 'black',
                        maxWidth: '70%'
                      }}>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '5px' }}>
                          {message.sender.fullName}
                        </div>
                        <div>{message.content}</div>
                        <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.7 }}>
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message input */}
            <div style={{ padding: '15px', borderTop: '1px solid #ccc' }}>
              <div style={{ display: 'flex' }}>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && messageInput.trim()) {
                      // Handle message sending here
                      console.log('Send message:', messageInput);
                      setMessageInput('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (messageInput.trim()) {
                      console.log('Send message:', messageInput);
                      setMessageInput('');
                    }
                  }}
                  style={{ 
                    marginLeft: '10px', 
                    padding: '10px 20px', 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: '#999'
          }}>
            Select a room to start chatting
          </div>
        )}
      </div>
    </div>
  );
};
