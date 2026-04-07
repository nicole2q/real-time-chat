# RG Copilot Instructions

## Project Overview
This is a full-stack real-time chat application built with React (TypeScript) and Node.js/Express with Socket.io for real-time messaging.

## Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Socket.io Client
- **Backend**: Node.js, Express, Socket.io, MongoDB (optional), JWT
- **Real-time**: Socket.io WebSockets
- **Styling**: CSS Variables with theme support

## Project Structure
```
npm workspace monorepo with:
- /server - Node.js/Express backend
- /client - React frontend
```

## Key Features Implemented
1. ✅ Real-time messaging with Socket.io
2. ✅ Multiple themes (Light, Dark, Blue, Green)
3. ✅ Search functionality
4. ✅ Add contact modal
5. ✅ Audio/Video call buttons (integration ready)
6. ✅ User settings panel
7. ✅ Responsive design
8. ✅ Dark mode support

## Development Commands
```bash
npm run install-all   # Install all dependencies
npm run dev          # Start both server and client
npm run build        # Build both projects
```

## Notes
- The chat system uses Socket.io for real-time communication
- In-memory storage is used (replace with MongoDB in production)
- Twilio integration is prepared for voice/video calls
- Theme persistence uses localStorage
