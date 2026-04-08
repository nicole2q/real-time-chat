import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'file';
}

interface User {
  id: string;
  name: string;
  email: string;
  status: 'online' | 'offline';
  lastSeen: Date;
  avatar?: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addedAt: Date;
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
  contacts: Contact[];
  currentConversation: Conversation | null;
  joinConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string) => void;
  startAudioCall: (recipientId: string) => void;
  startVideoCall: (recipientId: string) => void;
  registerUser: (userData: Omit<User, 'id' | 'status' | 'lastSeen'>) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  authenticateWithToken: (token: string) => Promise<void>;
  isAuthenticated: boolean;
  addContact: (name: string, email: string, phone?: string) => Promise<void>;
  getContacts: () => Promise<void>;
  deleteContact: (contactId: string) => Promise<void>;
  startConversationWithContact: (contactEmail: string, contactName: string) => Promise<void>;
  fetchConversations: () => Promise<void>;
  sendMessageWithMedia: (conversationId: string, content: string, mediaFile?: File) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
  const API_BASE = serverUrl + '/api';

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(serverUrl);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('new_message', (message: Message) => {
      console.log('📬 New message received:', message);
      // Add message to messages list
      setMessages((prev) => {
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
      // Update conversation's last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === message.conversationId
            ? { ...conv, lastMessage: message }
            : conv
        )
      );
    });

    newSocket.on('load_messages', (loadedMessages: Message[]) => {
      setMessages(loadedMessages);
    });

    newSocket.on('user_status_changed', (data) => {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === data.userId
            ? { ...user, status: data.status, lastSeen: new Date() }
            : user
        )
      );
    });

    newSocket.on('user_authenticated', (data) => {
      console.log('User authenticated:', data);
    });

    newSocket.on('incoming_audio_call', (data) => {
      console.log('Incoming audio call from:', data.callerName);
    });

    newSocket.on('incoming_video_call', (data) => {
      console.log('Incoming video call from:', data.callerName);
    });

    newSocket.on('user_typing', (data) => {
      console.log('User typing:', data.userName);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [serverUrl, currentConversation?.id]);

  // Authentication functions
  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Signup failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setCurrentUser({
        id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        status: 'online',
        lastSeen: new Date(),
      });
      setIsAuthenticated(true);
      if (socket) {
        socket.emit('user_auth', { token: data.token });
      }
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setCurrentUser({
        id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        status: 'online',
        lastSeen: new Date(),
      });
      setIsAuthenticated(true);
      if (socket) {
        socket.emit('user_auth', { token: data.token });
      }
    } catch (error) {
      throw error;
    }
  };

  const authenticateWithToken = async (token: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        localStorage.removeItem('token');
        throw new Error('Invalid token');
      }

      const data = await response.json();
      setCurrentUser({
        id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        status: 'online',
        lastSeen: new Date(),
      });
      setIsAuthenticated(true);
      localStorage.setItem('token', token);
      if (socket) {
        socket.emit('user_auth', { token });
      }
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setMessages([]);
    setContacts([]);
    setConversations([]);
    setCurrentConversation(null);
    if (socket) {
      socket.disconnect();
    }
  };

  const registerUser = (
    userData: Omit<User, 'id' | 'status' | 'lastSeen'>
  ) => {
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
      console.log('🚪 Joining conversation:', conversationId);
      socket.emit('join_conversation', conversationId);
    }
  };

  const sendMessage = (conversationId: string, content: string) => {
    if (socket && currentUser) {
      console.log('📤 Sending message to:', conversationId);
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
      // Get the other participant from conversation
      const recipient = currentConversation?.participants.find(p => p !== currentUser.id || p !== currentUser.email);
      const actualRecipientId = recipient || recipientId;
      console.log('📞 Starting audio call to:', actualRecipientId);
      socket.emit('start_audio_call', {
        callerId: currentUser.id,
        callerName: currentUser.name,
        recipientId: actualRecipientId,
      });
    }
  };

  const startVideoCall = (recipientId: string) => {
    if (socket && currentUser) {
      // Get the other participant from conversation
      const recipient = currentConversation?.participants.find(p => p !== currentUser.id && p !== currentUser.email);
      const actualRecipientId = recipient || recipientId;
      console.log('📹 Starting video call to:', actualRecipientId);
      socket.emit('start_video_call', {
        callerId: currentUser.id,
        callerName: currentUser.name,
        recipientId: actualRecipientId,
      });
    }
  };

  const addContact = async (
    name: string,
    email: string,
    phone?: string
  ): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('📤 Adding contact:', { name, email, phone });

      const response = await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, phone }),
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Server error:', errorData);
        throw new Error(errorData.error || 'Failed to add contact');
      }

      const contact = await response.json();
      console.log('✅ Contact added successfully:', contact);
      setContacts((prev) => [...prev, contact]);
    } catch (error) {
      console.error('❌ Error in addContact:', error);
      throw error;
    }
  };

  const getContacts = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE}/contacts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const contactList = await response.json();
      setContacts(contactList);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  };

  const deleteContact = async (contactId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE}/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      setContacts((prev) => prev.filter((c) => c.id !== contactId));
    } catch (error) {
      throw error;
    }
  };

  const startConversationWithContact = async (
    contactEmail: string,
    contactName: string
  ): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('📧 Starting conversation with:', { contactEmail, contactName });

      const response = await fetch(
        `${API_BASE}/conversations/with-contact/${encodeURIComponent(contactEmail)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ contactName }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }

      const conversation = await response.json();
      console.log('✅ Conversation started:', conversation);
      setCurrentConversation(conversation);
    } catch (error) {
      console.error('❌ Error starting conversation:', error);
      throw error;
    }
  };

  const fetchConversations = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !currentUser) {
        return;
      }

      const response = await fetch(`${API_BASE}/conversations/${currentUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const convs = await response.json();
      console.log('📋 Conversations fetched:', convs);
      setConversations(convs);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const sendMessageWithMedia = (
    conversationId: string,
    content: string,
    mediaFile?: File
  ): void => {
    if (socket && currentUser) {
      if (mediaFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const mediaData = e.target?.result as string;
          console.log('📤 Sending message with media');
          socket.emit('send_message', {
            conversationId,
            senderId: currentUser.id,
            senderName: currentUser.name,
            content: content || mediaFile.name,
            mediaUrl: mediaData,
            mediaType: mediaFile.type.startsWith('image/')
              ? 'image'
              : mediaFile.type.startsWith('video/')
              ? 'video'
              : 'file',
          });
        };
        reader.readAsDataURL(mediaFile);
      } else {
        sendMessage(conversationId, content);
      }
    }
  };

  // Auto-join conversation and load messages when current conversation changes
  useEffect(() => {
    if (currentConversation && socket) {
      joinConversation(currentConversation.id);
      setMessages([]); // Clear messages when switching conversations
    }
  }, [currentConversation?.id, socket]);

  // Fetch conversations when user authenticates
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchConversations();
    }
  }, [isAuthenticated, currentUser]);

  return (
    <ChatContext.Provider
      value={{
        socket,
        currentUser,
        conversations,
        messages,
        users,
        contacts,
        currentConversation,
        joinConversation,
        sendMessage,
        startAudioCall,
        startVideoCall,
        registerUser: () => {}, // Deprecated, use signup instead
        setCurrentConversation,
        login,
        signup,
        logout,
        authenticateWithToken,
        isAuthenticated,
        addContact,
        getContacts,
        deleteContact,
        startConversationWithContact,
        fetchConversations,
        sendMessageWithMedia,
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
