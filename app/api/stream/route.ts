import { NextRequest } from 'next/server';
import { conversationManager } from '../../../lib/conversation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Store active connections
const connections = new Set<ReadableStreamDefaultController>();

// Helper to broadcast updates to all connected clients
export function broadcastUpdate(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  connections.forEach(controller => {
    try {
      controller.enqueue(new TextEncoder().encode(message));
    } catch (error) {
      // Remove failed connections
      connections.delete(controller);
    }
  });
}

export async function GET(request: NextRequest) {
  // Create a new readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to our set
      connections.add(controller);
      
      // Send initial connection message
      const welcomeMessage = `data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`;
      controller.enqueue(new TextEncoder().encode(welcomeMessage));
      
      // Send current state immediately
      sendCurrentState(controller);
      
      // Set up periodic state checks and message generation
      const intervalId = setInterval(async () => {
        try {
          // Try to generate next message if needed
          const newMessage = await conversationManager.tryGenerateNext();
          if (newMessage) {
            // Broadcast to all clients
            const updateData = {
              type: 'message',
              message: newMessage,
              messages: await conversationManager.getRecentMessages(),
              totalCount: conversationManager.getTotalMessageCount(),
              timestamp: new Date().toISOString()
            };
            broadcastUpdate(updateData);
          } else {
            // Just send periodic heartbeat with current state
            const heartbeatData = {
              type: 'heartbeat',
              messages: await conversationManager.getRecentMessages(),
              totalCount: conversationManager.getTotalMessageCount(),
              timestamp: new Date().toISOString()
            };
            const message = `data: ${JSON.stringify(heartbeatData)}\n\n`;
            controller.enqueue(new TextEncoder().encode(message));
          }
        } catch (error) {
          console.error('Error in SSE interval:', error);
        }
      }, 2000); // Check every 2 seconds instead of 3

      // Clean up on connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        connections.delete(controller);
        try {
          controller.close();
        } catch (error) {
          // Connection already closed
        }
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

async function sendCurrentState(controller: ReadableStreamDefaultController) {
  try {
    await conversationManager.initializeConversation();
    const messages = await conversationManager.getRecentMessages();
    const totalCount = conversationManager.getTotalMessageCount();
    
    const stateData = {
      type: 'state',
      messages,
      totalCount,
      timestamp: new Date().toISOString()
    };
    
    const message = `data: ${JSON.stringify(stateData)}\n\n`;
    controller.enqueue(new TextEncoder().encode(message));
  } catch (error) {
    console.error('Error sending current state:', error);
  }
} 