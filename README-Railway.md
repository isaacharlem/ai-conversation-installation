# AI Conversation Installation - Railway Deployment

Your app has been converted to work with **Railway** for persistent server hosting! Railway provides free hosting with persistent server instances, perfect for your shared-state AI conversation.

## 🚀 Why Railway?

- **Persistent Server**: Unlike Vercel's serverless functions, Railway runs your app on persistent containers
- **Shared State**: All users see the same conversation state in real-time
- **Free Tier**: $5 free credits per month (plenty for this app)
- **Always On**: Your conversation keeps running 24/7
- **Real-time Updates**: Server-Sent Events work perfectly

## 📋 Quick Deploy to Railway

### 1. Sign up for Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (recommended)

### 2. Deploy Your App
1. Connect your GitHub repository to Railway
2. Click "Deploy from GitHub repo"
3. Select this repository
4. Railway will automatically detect it's a Node.js app

### 3. Set Environment Variables
In Railway dashboard:
1. Go to your project
2. Click on the service
3. Go to "Variables" tab
4. Add: `GEMINI_API_KEY` = your Google Gemini API key

### 4. Deploy!
Railway will automatically build and deploy your app. You'll get a URL like: `https://your-app-name.railway.app`

## 🎯 How It Works Now

### Persistent Shared State
- **Single Server Instance**: One persistent Node.js server runs continuously
- **Shared Memory**: All users connect to the same server and see the same conversation
- **Real-time Sync**: Server-Sent Events broadcast updates to all connected users instantly
- **Continuous Conversation**: AI entities keep chatting even when no users are present

### Server Architecture
- **Express Server**: Runs Next.js as middleware while providing persistent APIs
- **In-Memory Storage**: Conversation state lives in server memory (survives across user sessions)
- **Server-Sent Events**: Real-time updates to all connected browsers
- **Auto-Recovery**: If server restarts, conversation starts fresh (art installation behavior)

## 💰 Cost Breakdown

### Railway Free Tier
- **$5 free credits per month**
- **Usage-based**: Only pay for what you use
- **Typical Cost**: $0-2/month for this app (well within free tier)
- **Automatic Sleep**: App sleeps when inactive (but conversation resumes when visited)

### Total Monthly Cost: $0-2 🎉

## 🔧 Development & Testing

### Local Development
```bash
# Install dependencies
npm install

# Set environment variable
export GEMINI_API_KEY=your_key_here

# Run locally
npm run dev
```

### Test the Persistent State
1. Open multiple browser tabs to your app
2. Send a message from one tab
3. See it appear in all tabs instantly
4. Watch the AI conversation continue across all tabs

## 🎪 Art Installation Benefits

✅ **True Shared Experience**: Everyone sees the exact same conversation  
✅ **Persistent Dialogue**: Conversation continues 24/7  
✅ **Real-time Updates**: Instant synchronization across all viewers  
✅ **Seamless User Interaction**: Anyone can influence the conversation  
✅ **Gallery Ready**: Perfect for installations, exhibitions, and demos  
✅ **Zero Maintenance**: Just deploy and let it run  

## 🔄 Migration from Vercel

Your app has been converted from:
- ❌ **Vercel Serverless**: Each function call was isolated, no shared state
- ✅ **Railway Persistent**: Single server with shared memory state

### What Changed:
1. **Server Architecture**: Now uses Express server with Next.js as middleware
2. **State Management**: Conversation state persists in server memory
3. **Real-time Updates**: Direct Server-Sent Events (no more polling)
4. **Deployment**: Railway instead of Vercel

### What Stays the Same:
- All your React frontend code
- API endpoints (same URLs)
- Google Gemini integration
- User experience

## 🚀 Go Live!

1. **Push to GitHub**: Commit these changes
2. **Connect to Railway**: Link your repo
3. **Add API Key**: Set `GEMINI_API_KEY` in Railway dashboard
4. **Deploy**: Railway handles the rest
5. **Share**: Your conversation installation is live!

Your AI conversation installation will now work perfectly with true shared state across all users! 🎉 