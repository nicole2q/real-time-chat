import express, { Request, Response, NextFunction } from 'express';
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['PORT', 'CLIENT_URL'];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar] && envVar !== 'PORT') {
    console.warn(`Warning: ${envVar} not set in environment variables`);
  }
});

const app = express();
const httpServer = createServer(app);

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000').split(',');

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Security headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Error handler middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
};

// In-memory storage (replace with database in production)
const users = new Map();
const conversations = new Map();
const messages = new Map();
const contacts = new Map<string, Map<string, { id: string; name: string; email: string; phone?: string; addedAt: Date }>>();

// Authentication utils
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key-change-in-production';

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
};

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const verified = verifyToken(token);
  if (!verified) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  (req as any).userId = verified.userId;
  next();
};

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User registration/authentication via JWT
  socket.on('user_auth', (data: any) => {
    try {
      const { token } = data;
      
      if (!token) {
        socket.emit('error', { message: 'Token required' });
        return;
      }

      const verified = verifyToken(token);
      if (!verified) {
        socket.emit('error', { message: 'Invalid token' });
        return;
      }

      const userId = verified.userId;
      const user = users.get(userId);

      if (!user) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      // Update user's socket and status
      user.socketId = socket.id;
      user.status = 'online';
      user.lastSeen = new Date();

      socket.join(`user_${userId}`);
      socket.emit('user_authenticated', { userId, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
      io.emit('user_status_changed', { userId, status: 'online' });
      console.log(`User authenticated: ${userId}`);
    } catch (error) {
      console.error('Error authenticating user:', error);
      socket.emit('error', { message: 'Authentication failed' });
    }
  });

  // Send message
  socket.on('send_message', (data: any) => {
    try {
      if (!data || !data.conversationId || !data.content || typeof data.content !== 'string') {
        socket.emit('error', { message: 'Invalid message data' });
        return;
      }

      const messageId = uuidv4();
      const message = {
        id: messageId,
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderName: data.senderName,
        content: data.content.trim().slice(0, 5000),
        timestamp: new Date(),
      };

      if (!messages.has(data.conversationId)) {
        messages.set(data.conversationId, []);
      }
      messages.get(data.conversationId)!.push(message);
      
      io.to(`conversation_${data.conversationId}`).emit('new_message', message);
      console.log(`Message sent in conversation ${data.conversationId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Join conversation
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    const convMessages = messages.get(conversationId) || [];
    socket.emit('load_messages', convMessages);
  });

  // Start audio call
  socket.on('start_audio_call', (data) => {
    io.to(`user_${data.recipientId}`).emit('incoming_audio_call', {
      callerId: data.callerId,
      callerName: data.callerName,
    });
  });

  // Start video call
  socket.on('start_video_call', (data) => {
    io.to(`user_${data.recipientId}`).emit('incoming_video_call', {
      callerId: data.callerId,
      callerName: data.callerName,
    });
  });

  // Call response
  socket.on('call_response', (data) => {
    io.to(`user_${data.callerId}`).emit('call_answered', {
      recipientId: data.recipientId,
      accepted: data.accepted,
    });
  });

  // Typing indicator
  socket.on('user_typing', (data) => {
    io.to(`conversation_${data.conversationId}`).emit('user_typing', {
      userId: data.userId,
      isTyping: data.isTyping,
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    try {
      let userId;
      for (const [id, user] of users.entries()) {
        if (user.socketId === socket.id) {
          userId = id;
          user.status = 'offline';
          user.lastSeen = new Date();
          break;
        }
      }
      if (userId) {
        io.emit('user_status_changed', { userId, status: 'offline' });
        console.log(`User disconnected: ${userId}`);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });

  // Error event
  socket.on('error', (error: Error) => {
    console.error('Socket error:', error);
  });
});

// REST API routes

// Auth endpoints
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    for (const user of users.values()) {
      if (user.email === email) {
        return res.status(409).json({ error: 'Email already registered' });
      }
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);
    
    // Create user
    const userId = uuidv4();
    const user = {
      id: userId,
      email,
      name: name.trim().slice(0, 100),
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      status: 'offline',
      lastSeen: new Date(),
      createdAt: new Date(),
      socketId: null,
    };

    users.set(userId, user);
    const token = generateToken(userId);

    res.status(201).json({
      id: userId,
      email,
      name: user.name,
      avatar: user.avatar,
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to signup' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    let user: any = null;
    for (const u of users.values()) {
      if (u.email === email) {
        user = u;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    user.lastSeen = new Date();

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.post('/api/auth/verify', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = users.get(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify token' });
  }
});
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'running', timestamp: new Date().toISOString() });
});

app.get('/api/users', (req: Request, res: Response) => {
  try {
    const userList = Array.from(users.values()).map(({ socketId, ...user }) => user);
    res.json(userList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/conversations/:userId', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const paramUserId = req.params.userId;
    
    // Verify user can only fetch their own conversations
    if (userId !== paramUserId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const userConversations = Array.from(conversations.values()).filter(
      (conv) => conv.participants.includes(userId)
    );
    console.log('📋 Fetching conversations for user:', userId, 'found:', userConversations.length);
    res.json(userConversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

app.post('/api/conversations', (req: Request, res: Response) => {
  try {
    const { participants, name } = req.body;
    
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: 'Invalid participants' });
    }
    
    const conversationId = uuidv4();
    const conversation = {
      id: conversationId,
      participants: participants.slice(0, 100),
      name: name ? String(name).slice(0, 255) : undefined,
      createdAt: new Date(),
    };
    conversations.set(conversationId, conversation);
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Start conversation with contact
app.post('/api/conversations/with-contact/:contactEmail', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { contactEmail } = req.params;
    const { contactName } = req.body;

    if (!contactEmail || !contactName) {
      return res.status(400).json({ error: 'Contact email and name are required' });
    }

    // Create a unique conversation ID based on the two users
    // Sort emails to ensure same ID regardless of who initiated
    const sortedEmails = [userId, contactEmail].sort().join('_');
    const conversationId = `dm_${sortedEmails}`;

    // Check if conversation already exists
    if (!conversations.has(conversationId)) {
      const conversation = {
        id: conversationId,
        participants: [userId, contactEmail],
        name: contactName,
        createdAt: new Date(),
      };
      conversations.set(conversationId, conversation);
      console.log('✅ Direct message conversation created:', { conversationId, participants: [userId, contactEmail] });
    }

    res.json({
      id: conversationId,
      participants: [userId, contactEmail],
      name: contactName,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('❌ Error starting conversation:', error);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

// Contact management endpoints
app.post('/api/contacts', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    if (!contacts.has(userId)) {
      contacts.set(userId, new Map());
    }

    const contactId = uuidv4();
    const userContacts = contacts.get(userId)!;
    const contact = {
      id: contactId,
      name: String(name).slice(0, 100),
      email: String(email).toLowerCase().slice(0, 255),
      phone: phone ? String(phone).slice(0, 20) : undefined,
      addedAt: new Date(),
    };

    userContacts.set(contactId, contact);
    console.log('✅ Contact added:', { userId, contact });
    res.status(201).json(contact);
  } catch (error) {
    console.error('❌ Error adding contact:', error);
    res.status(500).json({ error: 'Failed to add contact' });
  }
});

app.get('/api/contacts', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const userContacts = contacts.get(userId);
    
    if (!userContacts) {
      return res.json([]);
    }

    const contactList = Array.from(userContacts.values());
    res.json(contactList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

app.delete('/api/contacts/:contactId', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { contactId } = req.params;

    const userContacts = contacts.get(userId);
    if (!userContacts || !userContacts.has(contactId)) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    userContacts.delete(contactId);
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// Twilio token generation (optional)
app.post('/api/twilio/token', (req: Request, res: Response) => {
  try {
    const { identity, room } = req.body;
    
    if (!identity || !room) {
      return res.status(400).json({ error: 'Missing identity or room' });
    }
    
    // TODO: Implement Twilio token generation
    // Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN in .env
    res.status(501).json({ error: 'Twilio integration not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  console.error('Unhandled Rejection:', reason);
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

export { app, httpServer, io };
