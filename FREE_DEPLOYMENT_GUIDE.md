# Free Deployment Guide (Step-by-Step)

## Complete Setup for Vercel + Railway.app + MongoDB Atlas

### Part 1: Database Setup (5 minutes)

#### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas
2. Click "Sign up for free"
3. Fill in email, password, first name, last name
4. Check the checkbox and click "Create your MongoDB account"
5. Verify your email address
6. Answer questions about your organization (skip or fill quickly)

#### Step 2: Create Free Cluster
1. Click "Build a Database"
2. Select the "M0 FREE" tier (it should be pre-selected)
3. Click "Create"
4. Select "AWS" as cloud provider
5. Choose region closest to you
6. Click "Create Cluster" (wait ~3 minutes for creation)

#### Step 3: Get Connection String
1. Click "Connect" button
2. Select "Drivers"
3. Choose Node.js version 4.1+
4. Copy the connection string
5. **Save it somewhere safe** - you'll need it for Railway

**Your MongoDB connection string will look like:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

### Part 2: Backend Deployment (10 minutes)

#### Option A: Railway.app (RECOMMENDED)

##### Step 1: Create Railway Account
1. Go to: https://railway.app
2. Click "Login"
3. Click "Sign up"
4. Choose "GitHub" (easiest)
5. Authorize Railway to access your GitHub account
6. **IMPORTANT:** Fork the repository to your GitHub first!

**To fork on GitHub:**
1. Go to your repo: https://github.com/your-username/rg
2. Click "Fork" button (top right)
3. Keep all settings default, click "Create fork"

##### Step 2: Create Railway Project
1. On Railway dashboard, click "New Project"
2. Click "Deploy from GitHub repo"
3. Search for "rg" (or your repo name)
4. Select your forked repo
5. Click "Deploy"

##### Step 3: Configure Environment Variables
1. In Railway project, go to "Variables"
2. Add these variables:
```
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.vercel.app
MONGODB_URI=mongodb+srv://username:password@cluster0...
```

**How to get `MONGODB_URI`:**
- Go back to MongoDB Atlas
- Click "Connect" 
- Copy the connection string
- Replace `<password>` with your MongoDB password
- Replace `myFirstDatabase` with `chat-app`

**How to get `CLIENT_URL`:**
- You'll set this after deploying frontend to Vercel
- For now, use placeholder: `https://placeholder.vercel.app`
- Update it later after frontend is deployed

##### Step 4: Deploy
1. Railway should auto-deploy after variables are set
2. Once green checkmark appears, click your project name
3. Go to "Deployments" tab
4. Copy the URL under "Railway Domain"
5. **Save this URL** - it's your backend URL!

---

### Part 3: Frontend Deployment (10 minutes)

#### Step 1: Create Vercel Account
1. Go to: https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Click "Authorize Vercel"
5. Complete setup

#### Step 2: Deploy Repository
1. Click "New Project"
2. Search for "rg" (your forked repo)
3. Click "Import"
4. Leave settings as default
5. Click "Deploy"
   - Wait 2-3 minutes for build to complete

#### Step 3: Configure Environment Variables
1. After deployment, click your project
2. Go to "Settings" → "Environment Variables"
3. Add:
```
REACT_APP_SERVER_URL=https://your-railway-url.railway.app
REACT_APP_DEMO_MODE=false
```

**Important:** Replace `your-railway-url` with the actual Railway domain you got in Part 2!

#### Step 4: Redeploy
1. Go to "Deployments"
2. Click the three dots ⋯ on latest deployment
3. Click "Redeploy"
4. Wait for new build to complete

#### Step 5: Get Your Frontend URL
1. Deployment will show your Vercel domain (something like: `your-project.vercel.app`)
2. **Save this URL**

---

### Part 4: Update Backend With Frontend URL

1. Go back to Railway.app
2. Go to "Variables"
3. Update `CLIENT_URL` to your Vercel URL:
```
CLIENT_URL=https://your-project.vercel.app
```
4. Redeploy on Railway

---

## 🧪 Testing Your Deployment

1. Open: `https://your-project.vercel.app` (your frontend)
2. Enter your name and click "Start Chatting"
3. Open the same URL in **another browser/incognito window**
4. Send a message in one window
5. **Verify it appears in the other window in real-time ✅**

---

## 📊 Free Tier Limits

### Vercel (Frontend)
- ✅ Unlimited deployments
- ✅ 100GB/month bandwidth
- ✅ Unlimited projects
- ✅ Always free

### Railway.app (Backend)
- ✅ $5/month free credits (usually enough)
- ✅ Can add payment later if needed
- ✅ ~3,000 hours/month free computing

### MongoDB Atlas (Database)
- ✅ M0 Free cluster (512MB storage)
- ✅ No credit card required
- ✅ Always free

---

## ⚠️ Important: Update .env Files Before GitHub Push

**Before pushing to GitHub:**

1. Never push real `.env` files to public GitHub!
2. Keep `.env.example` files only
3. Vercel and Railway will auto-populate from their dashboards

---

## 🆘 Troubleshooting

### "Connection Timeout"
✅ Check Railway backend is actually deployed (green status)
✅ Verify `REACT_APP_SERVER_URL` is correct in Vercel
✅ Redeploy Vercel after updating variables

### "Cannot connect to MongoDB"
✅ Check `MONGODB_URI` is correct in Railway
✅ Verify password doesn't have special characters (if it does, URL-encode them)
✅ Check MongoDB Atlas IP whitelist allows all IPs (0.0.0.0/0)

### "Demo users don't appear"
✅ Verify `REACT_APP_DEMO_MODE=false` on Vercel
✅ If you want demo users, set to `true`

### "Messages not saving after refresh"
This is normal with free MongoDB tier. Messages are in-memory. To persist:
- Implement database save in server.ts (add `saveMessage()` function)
- Load messages from MongoDB on connection

---

## 🚀 Next Steps

1. ✅ Create MongoDB Atlas account
2. ✅ Get free cluster + connection string
3. ✅ Fork repo to GitHub
4. ✅ Deploy backend on Railway.app
5. ✅ Deploy frontend on Vercel
6. ✅ Update environment variables
7. ✅ Test real-time messaging
8. ✅ Share your URL publicly!

**Your live URL will be:** `https://your-project.vercel.app`

---

## 📱 Custom Domain (Optional)

Both Vercel and Railway support custom domains:

**Vercel:**
1. Go to project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

**Railway:**
1. Go to project → Settings → Domain
2. Add custom domain
3. Update DNS CNAME record

---

## 💡 Alternative Free Options

### Option 2: Netlify + Render.com
- **Frontend:** Netlify (similar to Vercel)
- **Backend:** Render.com (similar to Railway)

### Option 3: GitHub Pages + Heroku
- Not recommended (GitHub Pages for static only, Heroku free tier removed)

### Stick with Vercel + Railway.app! ✅

---

**You should have a fully working live chat app in ~30 minutes!**

Need help with any step? Let me know!
