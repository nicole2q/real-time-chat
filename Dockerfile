FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install root dependencies
RUN npm install

# Copy server files
COPY server/ ./server/

# Copy client files  
COPY client/ ./client/

# Build client
WORKDIR /app/client
RUN npm install
RUN npm run build

# Build server
WORKDIR /app/server
RUN npm install
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --only=production

# Copy built files
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/build ./client/build

# Set environment
ENV NODE_ENV=production
EXPOSE 5000

# Start server
CMD ["node", "server/dist/server.js"]
