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

    const prompt = `Generate 3 variations of this email message. Each variation should:
- Have a different opening hook
- Maintain the same core value proposition
- Be equally concise and engaging
- Feel distinct from the others

Original message:
"${message}"

Return ONLY the 3 variations, separated by "---" on new lines. No numbering or extra text.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const variations = content.text
        .split('---')
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
        .slice(0, 3);

      return NextResponse.json({
        success: true,
        data: { variations },
      });
    }

    throw new Error('Unexpected response format');

  } catch (error: any) {
    console.error('Error generating variations:', error);
    return NextResponse.json(
      { error: 'Failed to generate variations', details: error.message },
      { status: 500 }
    );
  }
}