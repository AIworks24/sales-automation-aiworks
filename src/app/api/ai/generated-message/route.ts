import { NextRequest, NextResponse } from 'next/server';
import { generatePersonalizedMessage } from '@/lib/anthropic/client';
import { createServerClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { prospect, template, companyInfo, tone } = body;

    if (!prospect || !template) {
      return NextResponse.json(
        { error: 'Missing required fields: prospect and template' },
        { status: 400 }
      );
    }

    // Generate personalized message using Claude AI
    const message = await generatePersonalizedMessage({
      prospect,
      template,
      companyInfo,
      tone: tone || 'professional',
    });

    return NextResponse.json({
      success: true,
      data: {
        message,
        prospect_name: `${prospect.first_name} ${prospect.last_name}`,
      },
    });
  } catch (error) {
    console.error('Error in AI message generation:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}