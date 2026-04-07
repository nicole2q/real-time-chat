# 5-Minute Quick Start Guide

## For Local Development

```bash
# 1. Install dependencies
npm run install-all

# 2. Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# 3. Start development (in project root)
npm run dev

# Frontend:  http://localhost:3000
# Backend:   http://localhost:5000
```

## For Production Deployment

### Option A: Docker (Recommended - 10 minutes)

```bash
# 1. Build the app
npm run build

# 2. Build and run with Docker
docker-compose up -d

# Your app is now running on port 80 (HTTP) / 443 (HTTPS)
# Configure your domain's DNS to point to your server
```

### Option B: Traditional Server (15 minutes)

```bash
# 1. On your Ubuntu/Debian server, run:
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx git

# 2. Clone and setup
cd /var/www
sudo git clone <your-repo-url> chat-app
cd chat-app
sudo npm run install-all

# 3. Create .env files with production values
sudo nano server/.env
sudo nano client/.env

# 4. Build
npm run build

# 5. Install as service (see DEPLOYMENT.md for full setup)
# Then visit http://yourdomain.com
```

### Option C: Heroku (5 minutes)

```bash
# 1. Install Heroku CLI
brew tap heroku/brew && brew install heroku

# 2. Deploy
heroku login
heroku create your-app-name
git push heroku main

# Your app is live at https://your-app-name.herokuapp.com
```

## Essential Environment Variables

**For Production (server/.env):**
```
PORT=5000
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
```

**For Production (client/.env):**
```
REACT_APP_SERVER_URL=https://yourdomain.com
REACT_APP_DEMO_MODE=false
```

## Verify It's Working

1. Open your domain in browser
2. Enter a name and login
3. Send a message
4. Open in another browser/window
5. Message appears in real-time ✅

## Done! 🎉

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for detailed instructions.  
See **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** before going live.  
See **[PRODUCTION_READY.md](PRODUCTION_READY.md)** for complete changes summary.

---

**Need help?** Check DEPLOYMENT.md or SECURITY.md for comprehensive guides.
