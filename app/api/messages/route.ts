import { NextRequest, NextResponse } from 'next/server';
import { conversationManager } from '../../../lib/conversation';
import { broadcastUpdate } from '../stream/route';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Initialize conversation if needed
    await conversationManager.initializeConversation();
    
    // Get recent messages and total count (no longer try to generate here, SSE handles that)
    const messages = await conversationManager.getRecentMessages();
    const totalCount = conversationManager.getTotalMessageCount();
    
    return NextResponse.json({ messages, totalCount });
  } catch (error) {
    console.error('Error in messages API:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    
    // Add user message
    const message = await conversationManager.injectUserMessage(content.trim());
    
    // Broadcast the new message to all connected clients
    const updateData = {
      type: 'user_message',
      message,
      messages: await conversationManager.getRecentMessages(),
      totalCount: conversationManager.getTotalMessageCount(),
      timestamp: new Date().toISOString()
    };
    broadcastUpdate(updateData);
    
    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error in messages POST API:', error);
    return NextResponse.json({ error: 'Failed to add message' }, { status: 500 });
  }
} 