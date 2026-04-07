# RG - Real-time Chat Application

A production-ready, full-stack real-time chat application built with React 18 and Node.js/Express, featuring Socket.io for real-time messaging, multiple themes, and video/audio call integration.

## 🚀 Features

- ✅ Real-time Messaging with Socket.io WebSockets
- ✅ Multiple Themes (Light, Dark, Blue, Green) with persistence
- ✅ User Status Indicators (Online/Offline)
- ✅ Search Conversations and Contacts
- ✅ Add Contacts Modal
- ✅ Audio & Video Call Integration (Twilio ready)
- ✅ Settings & User Preferences
- ✅ Responsive Design (Mobile & Desktop)
- ✅ Dark Mode Support
- ✅ Type-Safe with TypeScript
- ✅ Security Headers & Input Validation
- ✅ Error Handling & Logging
- ✅ Production-Ready Architecture

## Project Structure

```
rg/
├── .github/
│   └── copilot-instructions.md
├── server/                    # Node.js/Express backend
│   ├── src/
│   │   └── server.ts         # Modular server with Socket.io
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
├── client/                    # React 18 frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # Theme & Chat context
│   │   ├── public/
│   │   ├── index.tsx
│   │   └── App.tsx
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
├── package.json               # Root workspace config
└── README.md
```

## Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm >= 7.0.0

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd rg

# 2. Install all dependencies
npm run install-all

# 3. Set up environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env

# 4. Update .env files with your configuration
# Edit server/.env and client/.env as needed
```

### Development Mode

```bash
# Start both server and client simultaneously
npm run dev

# Server: http://localhost:5000
# Client: http://localhost:3000
```

### Access the Application

1. Open http://localhost:3000 in your browser
2. Enter your name to login
3. Start chatting!

For demo mode, you can also login as Alice, Bob, or Charlie (only shown when `REACT_APP_DEMO_MODE=true`)

## Environment Variables

### Server Configuration (server/.env)

```env
# Server Settings
PORT=5000
NODE_ENV=production
CLIENT_URL=http://localhost:3000

# Database (for production)
MONGODB_URI=mongodb://localhost:27017/chat-app

# Security
JWT_SECRET=your-secret-key-change-in-production

# Optional: Twilio for Voice/Video Calls
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token

# CORS Configuration (multiple origins separated by comma)
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Client Configuration (client/.env)

```env
# Server Connection
REACT_APP_SERVER_URL=http://localhost:5000

# Demo Mode (shows demo users on login)
REACT_APP_DEMO_MODE=true

# Optional: Twilio Integration
REACT_APP_TWILIO_TOKEN_URL=http://localhost:5000/api/twilio/token
```

## Building for Production

### Build Process

```bash
# 1. Build both client and server
npm run build

# 2. The dist folders will be created:
# - client/build/     (optimized React build)
# - server/dist/      (compiled TypeScript)
```

### Production Deployment

#### Option 1: Traditional Server Hosting (AWS EC2, DigitalOcean, etc.)

```bash
# On your server, install Node.js and npm, then:

# 1. Set production environment variables
export PORT=5000
export NODE_ENV=production
export CLIENT_URL=https://yourdomain.com

# 2. Start the server
npm run build
npm run start:prod

# 3. Serve frontend with reverse proxy (nginx/Apache)
# Point your web server to client/build directory
```

**Nginx Configuration Example:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/client/build;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:5000/socket.io;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection \"Upgrade\";
    }
}
```

#### Option 2: Docker Deployment

Create `Dockerfile` in root:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY server/dist ./server/dist
COPY client/build ./client/build

ENV NODE_ENV=production
EXPOSE 5000

CMD [\"node\", \"server/dist/server.js\"]
```

Build and run:
```bash
docker build -t chat-app .
docker run -p 5000:5000 -e PORT=5000 -e CLIENT_URL=https://yourdomain.com chat-app
```

#### Option 3: Heroku Deployment

1. Install Heroku CLI
2. Create Procfile:
```
web: npm run start:prod
```

3. Deploy:
```bash
heroku create chat-app-name
git push heroku main
```

#### Option 4: Vercel + Backend Hosting

For the frontend, Vercel handles React beautifully:
```bash
vercel --prod
```

For the backend, use platforms like:
- Heroku (free tier available)
- Railway.app  
- Render.com
- DigitalOcean App Platform

## Production Checklist

Before deploying to production:

- [ ] Remove all console.log statements or use proper logging
- [ ] Set `REACT_APP_DEMO_MODE=false` in production
- [ ] Update `CLIENT_URL` to your actual domain
- [ ] Set strong `JWT_SECRET` (if using JWT)
- [ ] Configure HTTPS/SSL certificate
- [ ] Set up proper CORS origins
- [ ] Use environment variables for all secrets (never commit .env files)
- [ ] Enable rate limiting on the backend
- [ ] Set up database (MongoDB) connection
- [ ] Configure Twilio credentials if using voice/video calls
- [ ] Set up backups and monitoring
- [ ] Add error tracking (Sentry, LogRocket, etc.)
- [ ] Test on multiple browsers/devices
- [ ] Set up CI/CD pipeline (GitHub Actions, GitLab CI, etc.)
- [ ] Configure CDN for static assets
- [ ] Add security headers (CORS, CSP, etc.)
- [ ] Enable compression (gzip)
- [ ] Set up logging and monitoring
- [ ] Regular security audits

## Technologies Used

| Component | Technology |
|-----------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS |
| State Management | React Context API |
| Real-time Communication | Socket.io |
| Backend | Node.js, Express |
| Runtime | Node.js 16+ |
| Styling | Tailwind CSS, CSS Variables |
| Icons | Lucide React |
| Code Quality | TypeScript strict mode |

## Key Features Implementation Details

### Real-time Messaging
- Built with Socket.io for bidirectional communication
- Automatic reconnection handling
- Support for multiple transports (WebSocket + polling)

### Themes
- Light, Dark, Blue, Green themes
- Persistent storage using localStorage
- CSS variables for easy customization

### User Management
- Real-time status updates (online/offline)
- User presence tracking
- Last seen timestamps

### Security
- Security headers (XSS, Clickjacking protection)
- Input validation and sanitization
- CORS configuration
- Error handling without exposing sensitive info

## API Endpoints

### Health Check
```
GET /api/health
```

### Users
```
GET /api/users
```

### Conversations
```
GET /api/conversations/:userId
POST /api/conversations
```

### Twilio (Optional)
```
POST /api/twilio/token
```

## Socket.io Events

### Client -> Server
- `user_register` - Register a new user
- `send_message` - Send a message
- `join_conversation` - Join a conversation room
- `start_audio_call` - Initiate audio call
- `start_video_call` - Initiate video call
- `call_response` - Respond to incoming call
- `user_typing` - Emit typing indicator

### Server -> Client
- `user_registered` - Confirmation of registration
- `new_message` - Receive new message
- `load_messages` - Load conversation messages
- `user_status_changed` - User status update
- `incoming_audio_call` - Incoming audio call
- `incoming_video_call` - Incoming video call
- `call_answered` - Call response
- `user_typing` - User typing indicator
- `error` - Error events

## Troubleshooting

### Connection Issues
```
Error: Failed to connect to server
```
**Solution:** Ensure server is running and `REACT_APP_SERVER_URL` matches server address

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change `PORT` in .env or kill the process using the port

### Messages Not Persisting
This is expected behavior with in-memory storage. To enable persistence:
1. Connect MongoDB in production
2. Modify server.ts to save messages to database
3. Load messages from database on connection

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security Considerations

- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- ✅ Rate limiting ready (implement with express-rate-limit)
- ⚠️ TODO: Add JWT authentication
- ⚠️ TODO: Implement message encryption (E2E)
- ⚠️ TODO: Add database encryption for stored data
- ⚠️ TODO: Implement refresh tokens

## Performance Optimization

To run the built application:
```bash
npm run build
npm run start:prod
```

The production build:
- Minified React code (client/build)
- Compiled TypeScript (server/dist)
- Optimized assets with Tailwind PurgeCSS

For further optimization:
- Use a CDN for static assets
- Enable gzip compression in nginx/Apache
- Implement caching headers
- Use Redis for session storage
- Optimize database queries with indexes

## License

MIT License - Free to use for personal and commercial projects

## Support

For issues, questions, or suggestions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Join the community Discord (if available)

## Changelog

### v1.0.0 (Initial Release)
- Real-time messaging with Socket.io
- Multiple themes (Light, Dark, Blue, Green)
- User presence/status tracking
- Add contacts feature
- Audio/Video call buttons (integration ready)
- Settings panel
- Responsive mobile design
- Dark mode support

---

**Made with ❤️ by the Chat App Team**
