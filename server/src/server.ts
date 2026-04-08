import express, { Request, Response, NextFunction } from 'express';
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

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

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User registration
  socket.on('user_register', (userData: any) => {
    try {
      // Validate user data
      if (!userData || !userData.name || typeof userData.name !== 'string') {
        socket.emit('error', { message: 'Invalid user data' });
        return;
      }

      const userId = uuidv4();
      const user = {
        id: userId,
        socketId: socket.id,
        name: userData.name.trim().slice(0, 100),
        email: userData.email ? userData.email.trim().slice(0, 255) : '',
        avatar: userData.avatar || '',
        status: 'online' as const,
        lastSeen: new Date(),
      };

      users.set(userId, user);
      socket.join(`user_${userId}`);
      socket.emit('user_registered', { userId, user });
      io.emit('user_status_changed', { userId, status: 'online' });
      console.log(`User registered: ${userId}`);
    } catch (error) {
      console.error('Error registering user:', error);
      socket.emit('error', { message: 'Registration failed' });
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

app.get('/api/conversations/:userId', (req: Request, res: Response) => {
  try {
    if (!req.params.userId || typeof req.params.userId !== 'string') {
      return res.status(400).json({ error: 'Invalid userId' });
    }
    const userConversations = Array.from(conversations.values()).filter(
      (conv) => conv.participants.includes(req.params.userId)
    );
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
