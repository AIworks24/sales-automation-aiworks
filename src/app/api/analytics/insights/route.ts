import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { user, error, supabase } = await getAuthenticatedUser(request);
    
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    // Check if user is manager or admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role === 'rep') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { analyticsData } = body;

    if (!analyticsData) {
      return NextResponse.json({ error: 'Analytics data required' }, { status: 400 });
    }

    // Generate AI insights
    const prompt = `You are an expert sales analytics consultant. Analyze this sales automation data and provide actionable insights.

DATA:
${JSON.stringify(analyticsData, null, 2)}

Provide a concise analysis with:
1. **Key Wins** - What's working well (2-3 bullet points)
2. **Areas for Improvement** - What needs attention (2-3 bullet points)
3. **Recommended Actions** - Specific next steps to improve performance (3-4 bullet points)
4. **Campaign Insights** - Which campaigns are performing best/worst and why

Keep it practical, specific, and actionable. Focus on metrics like response rates, conversion rates, and campaign effectiveness.

Format your response in clear sections with bullet points. Be direct and data-driven.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    const insights = content.type === 'text' ? content.text.trim() : '';

    return NextResponse.json({
      success: true,
      data: {
        insights,
        generated_at: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('Error generating AI insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights', details: error.message },
      { status: 500 }
    );
  }
}