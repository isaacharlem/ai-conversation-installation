'use client';

import { useState, useEffect, useRef } from 'react';
import { Message } from '../lib/conversation';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(0);
  const [isAITyping, setIsAITyping] = useState(false);
  const [totalMessageCount, setTotalMessageCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const eventSourceRef = useRef<EventSource | null>(null);

  // Initialize Server-Sent Events connection
  useEffect(() => {
    console.log('Initializing SSE connection...');
    
    const eventSource = new EventSource('/api/stream');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE connection opened');
      setConnectionStatus('connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE event received:', data.type, data);

        switch (data.type) {
          case 'connected':
            console.log('Connected to stream');
            setConnectionStatus('connected');
            break;
            
          case 'state':
          case 'heartbeat':
            // Update with current state
            if (data.messages && Array.isArray(data.messages)) {
              setMessages(data.messages);
              setTotalMessageCount(data.totalCount || data.messages.length);
              setLastUpdate(Date.now());
              
              // Check if AI is typing
              const lastMessage = data.messages[data.messages.length - 1];
              const isTypingIndicator = lastMessage && lastMessage.content === "...";
              setIsAITyping(isTypingIndicator);
            }
            break;

          case 'message':
          case 'user_message':
            // New message received
            if (data.messages && Array.isArray(data.messages)) {
              setMessages(data.messages);
              setTotalMessageCount(data.totalCount || data.messages.length);
              setLastUpdate(Date.now());
              
              // Check if AI is typing
              const lastMessage = data.messages[data.messages.length - 1];
              const isTypingIndicator = lastMessage && lastMessage.content === "...";
              setIsAITyping(isTypingIndicator);
            }
            break;

          default:
            console.log('Unknown SSE event type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      setConnectionStatus('disconnected');
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          console.log('Attempting to reconnect SSE...');
          setConnectionStatus('connecting');
          // The component will remount and create a new connection
        }
      }, 3000);
    };

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up SSE connection');
      eventSource.close();
    };
  }, []);

  // Send user message
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inputValue.trim() }),
      });
      
      if (response.ok) {
        setInputValue('');
        // Message will be updated via SSE, no need to manually refresh
      } else {
        console.error('Failed to send message:', response.status);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      const conversation = document.getElementById('conversation');
      if (conversation) {
        conversation.scrollTop = conversation.scrollHeight;
      }
    }
  }, [messages]);

  const getMessageClass = (speaker: string) => {
    switch (speaker) {
      case 'USER': return 'message user';
      case 'AI_A': return 'message ai-a';
      case 'AI_B': return 'message ai-b';
      default: return 'message';
    }
  };

  const getConnectionStatusClass = () => {
    switch (connectionStatus) {
      case 'connected': return 'status-connected';
      case 'connecting': return 'status-connecting';
      case 'disconnected': return 'status-disconnected';
      default: return '';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Live & Synchronized';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected - Reconnecting...';
      default: return '';
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="title">AI Conversation Installation</div>
        <div className="subtitle">Two AI entities in continuous dialogue - Everyone sees the same stream</div>
        <div className="status">
          <div className={`continuous-indicator ${getConnectionStatusClass()}`}>
            <span className="status-dot"></span>
            {getConnectionStatusText()}
          </div>
          <div>Last updated: {new Date(lastUpdate).toLocaleTimeString()}</div>
          <div>Total Messages: {totalMessageCount} (showing last {messages.length})</div>
        </div>
      </div>

      <div className="conversation" id="conversation">
        {messages.length === 0 ? (
          <div className="message">
            <div className="speaker">System</div>
            <div className="content">
              {connectionStatus === 'connecting' 
                ? 'Connecting to live conversation stream...' 
                : 'Initializing continuous conversation...'}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={getMessageClass(message.speaker)}>
              <div className="speaker">{message.speaker}</div>
              <div className="content">
                {message.content === "..." ? (
                  <div className="typing-indicator">
                    <span>writing response</span>
                    <div className="dots">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </div>
                  </div>
                ) : (
                  message.content
                )}
              </div>
              <div className="timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="controls">
        <div className="input-group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your interjection..."
            maxLength={500}
            disabled={isLoading || connectionStatus !== 'connected'}
          />
          <button 
            onClick={sendMessage} 
            disabled={isLoading || !inputValue.trim() || connectionStatus !== 'connected'}
          >
            {isLoading ? 'Sending...' : 'Inject'}
          </button>
        </div>
        <div className="connection-info">
          <small>
            {connectionStatus === 'connected' 
              ? '✓ Real-time sync active - All visitors see the same conversation'
              : connectionStatus === 'connecting'
              ? '⏳ Establishing real-time connection...'
              : '⚠️ Connection lost - Attempting to reconnect...'}
          </small>
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: 'Courier New', monospace;
          background: #000;
          color: #00ff00;
        }

        .header {
          padding: 20px;
          text-align: center;
          border-bottom: 1px solid #00ff00;
          background: #001100;
        }

        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .subtitle {
          font-size: 14px;
          opacity: 0.7;
          margin-bottom: 10px;
        }

        .status {
          font-size: 12px;
          opacity: 0.8;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .continuous-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: bold;
        }

        .status-connected {
          color: #00ffff;
        }

        .status-connecting {
          color: #ffff00;
        }

        .status-disconnected {
          color: #ff6666;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse-dot 2s infinite;
        }

        .status-connected .status-dot {
          background: #00ffff;
        }

        .status-connecting .status-dot {
          background: #ffff00;
        }

        .status-disconnected .status-dot {
          background: #ff6666;
        }

        @keyframes pulse-dot {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }

        .conversation {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #000;
        }

        .message {
          margin-bottom: 15px;
          padding: 10px;
          border-left: 3px solid #00ff00;
          background: rgba(0, 255, 0, 0.05);
          animation: fadeIn 0.5s ease-in;
        }

        .message.user {
          border-left-color: #ff00ff;
          background: rgba(255, 0, 255, 0.05);
          color: #ff00ff;
        }

        .message.ai-a {
          border-left-color: #00ffff;
          background: rgba(0, 255, 255, 0.05);
          color: #00ffff;
        }

        .message.ai-b {
          border-left-color: #ffff00;
          background: rgba(255, 255, 0, 0.05);
          color: #ffff00;
        }

        .speaker {
          font-weight: bold;
          margin-bottom: 5px;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 1px;
        }

        .content {
          line-height: 1.6;
          word-wrap: break-word;
          margin-bottom: 5px;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-style: italic;
          opacity: 0.8;
        }

        .dots {
          display: flex;
          gap: 2px;
        }

        .dots span {
          animation: pulse 1.5s infinite;
          opacity: 0.4;
        }

        .dots span:nth-child(1) {
          animation-delay: 0s;
        }

        .dots span:nth-child(2) {
          animation-delay: 0.3s;
        }

        .dots span:nth-child(3) {
          animation-delay: 0.6s;
        }

        @keyframes pulse {
          0%, 60%, 100% {
            opacity: 0.4;
          }
          30% {
            opacity: 1;
          }
        }

        .timestamp {
          font-size: 10px;
          opacity: 0.5;
        }

        .controls {
          padding: 20px;
          border-top: 1px solid #00ff00;
          background: #001100;
        }

        .input-group {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .connection-info {
          text-align: center;
          font-size: 11px;
          opacity: 0.7;
        }

        input {
          flex: 1;
          padding: 10px;
          background: #000;
          border: 1px solid #00ff00;
          color: #00ff00;
          font-family: 'Courier New', monospace;
          font-size: 14px;
        }

        input:focus {
          outline: none;
          border-color: #00ffff;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
        }

        input:disabled {
          opacity: 0.5;
        }

        button {
          padding: 10px 20px;
          background: #00ff00;
          color: #000;
          border: none;
          cursor: pointer;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s ease;
        }

        button:hover:not(:disabled) {
          background: #00ffff;
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #000;
        }

        ::-webkit-scrollbar-thumb {
          background: #00ff00;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #00ffff;
        }
      `}</style>
    </div>
  );
}

// Force dynamic rendering to prevent static generation at build time
export const dynamic = 'force-dynamic'; 