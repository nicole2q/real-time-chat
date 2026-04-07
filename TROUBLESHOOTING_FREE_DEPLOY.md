# Free Deployment Troubleshooting Guide

## 🔴 Common Issues & Solutions

---

## Issue 1: "Cannot connect to server" / WebSocket fails

### Symptoms:
- Red error in browser console
- Frontend loads but no real-time updates
- "Failed to connect to server" message

### Solutions (Try in order):

**Step 1: Check Railway.app Backend**
```
1. Go to Railway.app dashboard
2. Click your project
3. Check if status is "Running" (green) ✅
4. Click "Deployments" tab
5. Check if latest deployment shows green ✅
6. If red/failed: Click on it to see error logs
```

**Step 2: Verify Environment Variables**
```
Railway Variables Check:
□ NODE_ENV = production
□ PORT = 5000
□ CLIENT_URL = https://your-vercel-url.vercel.app (MUST match Vercel URL)
□ MONGODB_URI = mongodb+srv://... (if using database)
```

**Step 3: Copy Correct Backend URL**
```
1. In Railway, go to your project
2. Click "Railway Domain" (top of page)
3. There's a domain like: rg-prod-xyz.railway.app
4. Go to Vercel → Settings → Environment Variables
5. Update REACT_APP_SERVER_URL to:
   https://[YOUR-RAILWAY-DOMAIN].railway.app
6. Click "Redeploy" on Deployments tab
```

**Step 4: Check Browser Console**
```
1. Open: https://your-frontend.vercel.app
2. Right-click → "Inspect" (or F12)
3. Go to "Console" tab
4. Look for error message
5. If it says "localhost:5000" → Wrong URL in .env
6. If it says "refused to connect" → Backend not running
```

---

## Issue 2: Messages don't appear in real-time

### Symptoms:
- Can login fine
- Type message, nothing happens
- No error messages in console

### Likely Cause:
Backend not receiving messages (connection not actually established)

### Solutions:

**Step 1: Verify WebSocket Connection**
```
1. Open browser Console (F12)
2. Network tab
3. Click to filter: WS (WebSocket)
4. Should see connection to /socket.io
5. If you see only POST requests, WebSocket failed
```

**Step 2: Check Server Logs**
```
1. Go to Railway dashboard
2. Click your project
3. Click "Logs" tab
4. Look for:
   ✅ "User registered: [id]"
   ✅ "Message sent in conversation..."
   ❌ "Cannot connect to MongoDB"
   ❌ "CORS error"
```

**Step 3: Verify CORS Configuration**
Make sure in server.ts:
```typescript
const allowedOrigins = (process.env.CLIENT_URL || ...).split(',');

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,  // ← Should include your Vercel URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
```

---

## Issue 3: "Cannot find module" or Build fails on Vercel

### Symptoms:
- Red build status on Vercel
- "Failed to build project"
- Error mentions missing dependencies

### Solutions:

**Step 1: Check package.json files**
```bash
# In project root, verify:
- package.json exists ✅
- server/package.json exists ✅
- client/package.json exists ✅
```

**Step 2: Verify build scripts**
```bash
# These commands should work locally:
npm run build
npm run build -w server
npm run build -w client
```

**Step 3: Check Vercel build settings**
```
1. Go to Vercel project → Settings
2. → Build & Development Settings
3. Build Command should be: npm run build
4. Output Directory should be: client/build
5. Root Directory should be: ./
```

**Step 4: Check install command**
```
Install Command should be: npm install
(Vercel should auto-detect monorepo)
```

---

## Issue 4: MongoDB connection error

### Symptoms:
- Error: "connect ECONNREFUSED"
- Error: "authentication failed"
- Server logs show MongoDB connection fails

### Solutions:

**Step 1: Verify Connection String**
```
1. Go to MongoDB Atlas
2. Click "Connect" → "Drivers"
3. Copy full connection string
4. Should look like:
   mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/?retryWrites=true

5. Replace <password> with actual MongoDB password
6. Add database name (optional): ?retryWrites=true&w=majority&authSource=admin
```

**Step 2: Check Network Access**
```
1. In MongoDB Atlas, go to "Network Access"
2. Should see entry: 0.0.0.0/0 (Allow from anywhere)
3. If not, click "Add IP Address" 
4. Select "Allow Access from Anywhere"
5. Confirm
```

**Step 3: Verify Password**
```
If password has special characters like: @, !, #, $
→ URL-encode them:
   @ → %40
   ! → %21
   # → %23
   $ → %24

Example:
User: admin
Password: pass@123!
→ admin:pass%40123%21@cluster0...
```

**Step 4: Update Railway Variables**
```
1. Go to Railway → Variables
2. Update MONGODB_URI with correct connection string
3. Save and wait for redeploy (should show green)
```

---

## Issue 5: "Port already in use" error (Local development)

### Symptoms:
- Local `npm run dev` fails
- Error: "EADDRINUSE :::5000"

### Solution:
```bash
# Find process using port 5000:
lsof -i :5000  # macOS/Linux

# Or kill and retry:
npm run dev

# Or use different port:
PORT=3001 npm run dev
```

---

## Issue 6: Frontend shows blank page

### Symptoms:
- Vercel URL loads but shows nothing
- White/blank screen

### Solutions:

**Step 1: Check build logs**
```
1. Go to Vercel → Deployments
2. Click latest deployment
3. Click "Build Logs"
4. Look for error messages
5. Common: "Module not found" or "npm ERR!"
```

**Step 2: Check browser console**
```
1. Open: https://your-vercel-url.vercel.app
2. F12 → Console
3. Look for red errors
4. Common: "Cannot reach server", "require() not defined"
```

**Step 3: Manually test build locally**
```bash
npm run build
# Should complete without errors
```

---

## Issue 7: 404 errors for API requests

### Symptoms:
- Console shows: "GET /api/health 404"
- Backend seems to be running but API calls fail

### Solution:
```
1. Your REACT_APP_SERVER_URL is wrong
2. Go to Vercel Settings → Environment Variables
3. Check REACT_APP_SERVER_URL is set to backend URL
4. Redeploy
5. Wait 2-3 minutes for changes to take effect
```

---

## Issue 8: "Memory limit exceeded" (free tier)

### Symptoms:
- App worked then randomly crashes
- Railway logs show "OOM" (out of memory)
- App is very slow before crashing

### Likely Cause:
- In-memory storage is using too much RAM
- Too many users connected
- Memory leak in code

### Solutions:
```
Short term:
□ Upgrade Railway to paid tier ($10+/month)
□ Clear browser cache and refresh

Long term:
□ Connect to MongoDB for persistence
□ Limit concurrent connections
□ Implement memory cleanup
```

---

## Issue 9: Changes not reflecting after git push

### Symptoms:
- Updated code and pushed to GitHub
- Vercel shows latest commit
- But old code is still running

### Solution:
```
1. Go to Vercel → Deployments
2. Click three dots ⋯ on latest
3. Select "Redeploy"
4. Wait for build to complete
```

---

## Issue 10: "CORS error" - Request blocked

### Symptoms:
- Console error: "Cross-Origin Request Blocked"
- Backend receives no requests from frontend

### Cause:
CORS not properly configured for your domain

### Solution:
```
1. Server code should have:
   const allowedOrigins = (process.env.CLIENT_URL || ...).split(',');
   
   app.use(cors({
     origin: allowedOrigins,
     credentials: true,
   }));

2. Verify CLIENT_URL in Railway includes your Vercel link:
   https://your-project.vercel.app

3. Do NOT include path - just domain:
   ✅ https://my-app.vercel.app
   ❌ https://my-app.vercel.app/chat
```

---

## 🔧 Quick Diagnostic Steps

Run this checklist when something breaks:

```
□ 1. Is Railway backend showing green status?
□ 2. Is Vercel build successful (green)?
□ 3. Are environment variables correct?
□ 4. Is REACT_APP_SERVER_URL the exact Railway domain?
□ 5. Is CLIENT_URL the exact Vercel domain?
□ 6. Did you redeploy after changing variables?
□ 7. Did you wait 2-3 minutes for changes to apply?
□ 8. Check browser console for specific errors
□ 9. Check Railway logs for server errors
□ 10. Try incognito/private window (clear cache)
```

---

## 📞 Getting More Help

**Check these resources:**

1. **Railway Docs:** https://docs.railway.app
2. **Vercel Docs:** https://vercel.com/docs
3. **MongoDB Docs:** https://docs.atlas.mongodb.com
4. **Socket.io Docs:** https://socket.io/docs
5. **Create Issue on GitHub:** Include error message + screenshots

---

## ✅ If All Else Fails

Try completely redeploying:

```bash
# 1. Make sure git has latest code
git add .
git commit -m "Fix deployment"
git push origin main

# 2. Manually redeploy on Vercel
Go to Vercel → Deployments → Latest → Redeploy

# 3. Manually redeploy on Railway
Railway usually auto-redeploys after git push
If not: Redeploy from Railway dashboard

# 4. Hard refresh frontend
Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

---

**Most issues resolve with:** ✅  
1. Waiting 2-3 minutes for deployment
2. Hard refresh browser (Ctrl+Shift+R)
3. Checking environment variables match exactly
4. Looking at actual error messages (console logs)

Good luck! 🚀
