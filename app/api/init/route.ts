import { NextResponse } from 'next/server';
import { conversationManager } from '@/lib/conversation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('Manual conversation initialization triggered');
    
    // Force initialization
    await conversationManager.initializeConversation();
    
    // Enable continuous mode
    conversationManager.enableContinuousMode();
    
    // Get current messages
    const messages = await conversationManager.getRecentMessages();
    
    return NextResponse.json({ 
      success: true, 
      messages,
      continuousMode: conversationManager.isContinuousModeEnabled(),
      messageCount: messages.length
    });
  } catch (error) {
    console.error('Error initializing conversation:', error);
    return NextResponse.json({ 
      error: 'Failed to initialize conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const messages = await conversationManager.getRecentMessages();
    return NextResponse.json({ 
      messages,
      continuousMode: conversationManager.isContinuousModeEnabled(),
      isProcessing: conversationManager.isCurrentlyProcessing(),
      messageCount: messages.length
    });
  } catch (error) {
    console.error('Error getting conversation status:', error);
    return NextResponse.json({ 
      error: 'Failed to get conversation status'
    }, { status: 500 });
  }
} 