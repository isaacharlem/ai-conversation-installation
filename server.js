const express = require('express');
const next = require('next');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Persistent server-side storage for the conversation
class ConversationStorage {
  constructor() {
    this.messages = [];
    this.MAX_MESSAGES = 100; // Show last 100 messages
    this.currentSpeaker = 'AI_B';
    this.lastActivity = new Date();
    this.continuousMode = true;
    this.totalMessageCount = 0;
    this.isProcessing = false;
    
    // Initialize AI
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
    });
    
    // Start continuous conversation
    this.startContinuousConversation();
  }

  addMessage(speaker, content, type = 'ai') {
    const message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      speaker,
      content,
      timestamp: new Date().toISOString(),
      type
    };

    this.messages.push(message);
    this.totalMessageCount++;
    this.lastActivity = new Date();

    // Keep only the last MAX_MESSAGES messages (rolling window)
    if (this.messages.length > this.MAX_MESSAGES) {
      this.messages = this.messages.slice(-this.MAX_MESSAGES);
    }

    // Broadcast to all connected clients
    this.broadcastUpdate({
      type: 'message',
      message,
      messages: this.messages,
      totalCount: this.totalMessageCount,
      timestamp: new Date().toISOString()
    });

    return message;
  }

  getMessages() {
    return [...this.messages];
  }

  getCurrentSpeaker() {
    return this.currentSpeaker;
  }

  setCurrentSpeaker(speaker) {
    this.currentSpeaker = speaker;
  }

  getContextMessages(excludeSpeaker, limit = 15) {
    let contextMessages = this.messages;
    
    if (excludeSpeaker) {
      contextMessages = this.messages.filter(msg => msg.speaker !== excludeSpeaker);
    }
    
    return contextMessages.slice(-limit);
  }

  async getAIResponse(aiName) {
    const contextMessages = this.getContextMessages(aiName, 10);
    const contextText = contextMessages
      .map(msg => `${msg.speaker}: ${msg.content}`)
      .join('\n');

    const prompt = contextText + "Here is the conversation history. Please respond naturally to continue the conversation. Keep it brief (1-2 sentences)." + ``;
    
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemma-3n-e4b-it',
        contents: prompt
      });
      return response.text;
    } catch (error) {
      console.error(`Error getting AI response for ${aiName}:`, error);
      return "I'm having trouble responding right now.";
    }
  }

  async processNextMessage() {
    if (this.isProcessing) return null;
    
    this.isProcessing = true;
    
    try {
      const currentSpeaker = this.getCurrentSpeaker();
      
      // Add typing indicator
      const typingMessage = this.addMessage(currentSpeaker, "...", 'ai');
      
      // Get AI response
      const response = await this.getAIResponse(currentSpeaker);
      
      // Remove typing indicator
      this.messages = this.messages.filter(msg => msg.id !== typingMessage.id);
      
      // Add actual response
      const message = this.addMessage(currentSpeaker, response, 'ai');
      
      // Switch speaker
      this.setCurrentSpeaker(currentSpeaker === 'AI_A' ? 'AI_B' : 'AI_A');
      
      return message;
    } finally {
      this.isProcessing = false;
    }
  }

  async injectUserMessage(content) {
    const message = this.addMessage('USER', content, 'user');
    
    // Continue conversation after user injection
    setTimeout(() => {
      this.processNextMessage();
    }, 2000);
    
    return message;
  }

  startContinuousConversation() {
    // Initialize with first message if no messages exist
    if (this.messages.length === 0) {
      this.addMessage('AI_A', 'Hello!', 'ai');
    }
    
    // Schedule continuous conversation
    this.scheduleContinuousMessage();
  }

  scheduleContinuousMessage() {
    if (!this.continuousMode) return;
    
    const delay = 5000 + Math.random() * 5000; // 5-10 seconds
    
    setTimeout(async () => {
      try {
        await this.processNextMessage();
      } catch (error) {
        console.error('Error in continuous conversation:', error);
      }
      
      // Schedule next message
      this.scheduleContinuousMessage();
    }, delay);
  }

  // Server-Sent Events connections
  connections = new Set();

  addConnection(res) {
    this.connections.add(res);
    
    // Send current state to new connection
    this.sendToConnection(res, {
      type: 'state',
      messages: this.messages,
      totalCount: this.totalMessageCount,
      timestamp: new Date().toISOString()
    });
  }

  removeConnection(res) {
    this.connections.delete(res);
  }

  sendToConnection(res, data) {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      this.removeConnection(res);
    }
  }

  broadcastUpdate(data) {
    this.connections.forEach(res => {
      this.sendToConnection(res, data);
    });
  }
}

// Global conversation storage
const conversationStorage = new ConversationStorage();

app.prepare().then(() => {
  const server = express();
  
  server.use(cors());
  server.use(express.json());

  // API Routes
  server.get('/api/messages', (req, res) => {
    res.json({
      messages: conversationStorage.getMessages(),
      totalCount: conversationStorage.totalMessageCount
    });
  });

  server.post('/api/messages', async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Content is required' });
      }
      
      const message = await conversationStorage.injectUserMessage(content.trim());
      res.json({ message });
    } catch (error) {
      console.error('Error in messages POST:', error);
      res.status(500).json({ error: 'Failed to add message' });
    }
  });

  // Server-Sent Events endpoint
  server.get('/api/stream', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Add connection
    conversationStorage.addConnection(res);

    // Send welcome message
    conversationStorage.sendToConnection(res, {
      type: 'connected',
      timestamp: new Date().toISOString()
    });

    // Handle client disconnect
    req.on('close', () => {
      conversationStorage.removeConnection(res);
    });

    req.on('aborted', () => {
      conversationStorage.removeConnection(res);
    });
  });

  // Initialize conversation endpoint
  server.post('/api/init', (req, res) => {
    res.json({
      success: true,
      messages: conversationStorage.getMessages(),
      continuousMode: conversationStorage.continuousMode,
      messageCount: conversationStorage.messages.length
    });
  });

  // Test endpoint
  server.get('/api/test', (req, res) => {
    res.json({
      status: 'API is working',
      timestamp: new Date().toISOString(),
      env: {
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    });
  });

  // Handle all other requests with Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
    console.log('> Continuous AI conversation is running!');
  });
}); 