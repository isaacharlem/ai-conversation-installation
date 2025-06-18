import { NextResponse } from 'next/server';
import { conversationManager } from '../../../lib/conversation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Process next message
    const message = await conversationManager.processNextMessage();
    
    if (message) {
      return NextResponse.json({ message });
    } else {
      return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in generate API:', error);
    return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 });
  }
} 