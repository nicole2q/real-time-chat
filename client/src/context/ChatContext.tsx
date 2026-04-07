import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

interface User {
  id: string;
  name: string;
  email: string;
  status: 'online' | 'offline';
  lastSeen: Date;
  avatar?: string;
}

interface Conversation {
  id: string;
  participants: string[];
  name?: string;
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: Date;
}

interface ChatContextType {
  socket: Socket | null;
  currentUser: User | null;
  conversations: Conversation[];
  messages: Message[];
  users: User[];
  currentConversation: Conversation | null;
  joinConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string) => void;
  startAudioCall: (recipientId: string) => void;
  startVideoCall: (recipientId: string) => void;
  registerUser: (userData: Omit<User, 'id' | 'status' | 'lastSeen'>) => void;
  setCurrentConversation: (conversation: Conversation) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('new_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('load_messages', (loadedMessages: Message[]) => {
      setMessages(loadedMessages);
    });

    newSocket.on('user_status_changed', (data) => {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === data.userId ? { ...user, status: data.status, lastSeen: new Date() } : user
        )
      );
    });

    newSocket.on('incoming_audio_call', (data) => {
      console.log('Incoming audio call from:', data.callerName);
    });

    newSocket.on('incoming_video_call', (data) => {
      console.log('Incoming video call from:', data.callerName);
    });

    newSocket.on('user_typing', (data) => {
      // Handle typing indicator
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const registerUser = (userData: Omit<User, 'id' | 'status' | 'lastSeen'>) => {
    if (socket) {
      socket.emit('user_register', userData);
      setCurrentUser({
        ...userData,
        id: socket.id || '',
        status: 'online',
        lastSeen: new Date(),
      });
    }
  };

  const joinConversation = (conversationId: string) => {
    if (socket) {
      socket.emit('join_conversation', conversationId);
    }
  };

  const sendMessage = (conversationId: string, content: string) => {
    if (socket && currentUser) {
      socket.emit('send_message', {
        conversationId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        content,
      });
    }
  };

  const startAudioCall = (recipientId: string) => {
    if (socket && currentUser) {
      socket.emit('start_audio_call', {
        callerId: currentUser.id,
        callerName: currentUser.name,
        recipientId,
      });
    }
  };

  const startVideoCall = (recipientId: string) => {
    if (socket && currentUser) {
      socket.emit('start_video_call', {
        callerId: currentUser.id,
        callerName: currentUser.name,
        recipientId,
      });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        socket,
        currentUser,
        conversations,
        messages,
        users,
        currentConversation,
        joinConversation,
        sendMessage,
        startAudioCall,
        startVideoCall,
        registerUser,
        setCurrentConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
