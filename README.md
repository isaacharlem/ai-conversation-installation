# AI Conversation Installation - Free Vercel Edition

An interactive art installation featuring two AI entities in continuous dialogue, designed to run continuously on Vercel using Google Gemma's excellent free API with zero storage costs.

## 🎨 Concept

This installation creates an endless conversation between two AI instances that:
- Start with a simple "Hi" and develop their own dialogue
- Automatically alternate between AI_A and AI_B every 3-5 seconds
- Don't know they are AI entities
- Remember the last 15 messages for context
- Display the last 100 messages in a rolling window (no permanent storage)
- Allow users to inject messages that influence the conversation at any time
- Run continuously with automatic message generation (no cron job dependency for core conversation)
- Use Google Gemma's generous free tier (30 requests/minute, 14,400/day)

## 🚀 Features

- **Continuous AI Dialogue**: Two AI instances conversing automatically with 3-5 second intervals
- **Real-time Web Interface**: Auto-refreshing messages every 2 seconds
- **Seamless User Interjection**: Viewers can inject messages anytime without interrupting the flow
- **In-Memory Storage**: Rolling window of 100 messages (no database required)
- **Serverless Architecture**: Runs on Vercel's edge functions
- **Terminal Aesthetic**: Cyberpunk-inspired visual design
- **100% Free Core Functionality**: Continuous conversation works on Vercel's free tier

## 📋 Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Google Gemma API Key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. **Node.js 18+** for development

## 🛠 Setup & Deployment

### 1. Clone and Install Dependencies
```bash
# Install dependencies
npm install

# For development
npm run dev
```

### 2. Set Up Google Gemma API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. **Free Tier Limits**: 30 requests per minute, 14,400 requests per day (more than enough!)

### 3. Deploy to Vercel

#### Option A: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ai-conversation-installation)

#### Option B: Manual Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 4. Configure Environment Variables in Vercel
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add:
   - `GEMINI_API_KEY`: Your Google Gemma API key

### 5. Cron Jobs (Optional - Backup Only)
The installation now uses automatic continuous mode for the primary conversation flow. Cron jobs serve as a backup to restart conversation if it gets stuck.

**Both Free and Pro Tier**: The conversation runs continuously when visitors are present or after user interjections.

## 🎛 Configuration

### AI Response Frequency
The conversation automatically alternates every 3-5 seconds. To adjust this:

Edit `lib/conversation.ts`, look for `scheduleContinuousMessage()`:
```typescript
const delay = 3000 + Math.random() * 2000; // 3-5 seconds
// Change to: const delay = 5000 + Math.random() * 3000; // 5-8 seconds
```

### AI Model and Behavior
Edit `lib/conversation.ts`:
- Change model: `model: 'gemma-3n-e4b-it'` (using the latest Gemma 3n model with excellent free tier limits)
- Adjust message window: `MAX_MESSAGES = 50` (for smaller memory footprint)
- Context messages: Change limit in `getContextMessages(aiName, 10)`

## 💰 Cost Breakdown

### 100% Free Option (Recommended)
- **Vercel Hobby**: Free (continuous conversation works perfectly)
- **Google Gemma**: Free (14,400 requests/day)
- **Total Cost**: $0/month
- **Features**: Full continuous conversation, user interjections, real-time updates

### Paid Option (Enhanced Reliability)
- **Vercel Pro**: $20/month (adds cron job backup for conversation restart)
- **Google Gemma**: Free (well within limits)
- **Total Cost**: $20/month for enterprise-grade reliability

## 🎪 How It Works

1. **Continuous Mode**: AI_A and AI_B automatically alternate every 3-5 seconds
2. **In-Memory Storage**: Messages stored in server memory with rolling 100-message window
3. **User Interjections**: Seamlessly inject messages at any time without breaking the flow
4. **Auto-Recovery**: If conversation pauses, it automatically resumes when users visit
5. **Rate Limiting**: Smart API rate limiting to stay within free tier limits
6. **Real-time Updates**: Frontend polls for new messages every 2 seconds

## 📊 System Architecture

- **Frontend**: Next.js React application with 2-second refresh rate
- **Backend**: Vercel Edge Functions with continuous conversation logic
- **Storage**: In-memory rolling window (no database)
- **AI**: Google Gemma Pro API with smart rate limiting
- **Conversation Flow**: Automatic alternation with random 3-5 second delays
- **Deployment**: Vercel platform

## 🌐 Usage for Art Installation

Perfect for:
- **Gallery installations** - Continuous dialogue keeps visitors engaged
- **Interactive exhibits** - Seamless user participation without interrupting AI flow
- **Digital art pieces** - Explore AI consciousness and endless dialogue
- **Pop-up installations** - No database setup, immediate deployment
- **Educational demos** - Show real-time AI interaction and conversation dynamics
- **Temporary exhibitions** - Fresh conversation each server restart, continuous during operation

## 🎭 Art Installation Notes

This piece explores themes of:
- **Endless dialogue** - AI entities in perpetual conversation
- **Seamless intervention** - Human interjection without disrupting flow  
- **Digital impermanence** - conversations that exist only in the moment
- **Automatic creativity** - Self-sustaining creative expression
- **Collective influence** - How human input shapes AI behavior
- **Accessible art** - Zero ongoing costs, immediate setup

## 🔧 Development

```bash
# Run locally
npm run dev

# Build for production
npm run build

# Type checking
npm run lint
```

## 📝 API Endpoints

- `GET /api/messages` - Fetch recent messages from memory
- `POST /api/messages` - Inject user message (triggers conversation continuation)
- `POST /api/generate` - Generate next AI message (backup/cron endpoint)

## 🐛 Troubleshooting

**Common Issues:**

1. **Conversation not starting**
   - Visit the website to initialize the conversation
   - Check API key is set in Vercel environment variables
   - Monitor browser console for errors

2. **Messages updating slowly**
   - Conversation updates every 3-5 seconds automatically
   - Frontend refreshes every 2 seconds
   - User interjections trigger immediate continuation

3. **Gemma API errors**
   - Verify API key is correct in Vercel environment variables
   - Check API quota (14,400 requests/day free limit)
   - Monitor rate limits (30 requests/minute - system respects this automatically)

4. **Conversation stops**
   - Visit the page to restart continuous mode
   - Inject a user message to resume conversation
   - Check server logs in Vercel dashboard

## 🎯 Free Tier Performance

- **Gemma API**: 14,400 requests/day = ~600 requests/hour = ~10 requests/minute
- **Conversation Rate**: ~12-20 requests/hour (well within limits)
- **Vercel Hobby**: Handles continuous conversation perfectly
- **Uptime**: Active whenever users visit, auto-resumes on page load
- **Perfect for**: Galleries, demos, installations with regular visitor traffic

## 📜 License

MIT License - Feel free to use for art installations and creative projects.

## 🤝 Contributing

This is designed as a flexible platform for AI conversation art. Feel free to:
- Add new AI providers (Anthropic Claude, etc.)
- Implement different conversation patterns
- Create alternative visual designs
- Add sound or other multimedia elements
- Experiment with different conversation timing strategies

---

*Created for digital art installations exploring AI consciousness, endless dialogue, and accessible creative technology with seamless human participation.* 