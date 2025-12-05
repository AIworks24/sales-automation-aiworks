import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const prompt = `Improve this email message to make it more engaging, concise, and effective while maintaining its core intent:

"${message}"

Make it:
- More concise and punchy
- More engaging and personalized
- Professional but approachable
- Clear in its value proposition
- End with a compelling question or CTA

Return only the improved message, nothing else.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return NextResponse.json({
        success: true,
        data: {
          improved_message: content.text.trim(),
          original: message,
        },
      });
    }

    throw new Error('Unexpected response format');

  } catch (error: any) {
    console.error('Error improving message:', error);
    return NextResponse.json(
      { error: 'Failed to improve message', details: error.message },
      { status: 500 }
    );
  }
}