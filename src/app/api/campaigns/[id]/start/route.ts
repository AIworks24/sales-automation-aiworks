import { NextRequest, NextResponse } from 'next/server';
import { createBrowserClient } from '@/lib/supabase/client';

// POST /api/campaigns/[id]/start - Start campaign
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update campaign status to active
    const updateResult = await (supabase
      .from('campaigns') as any)
      .update({
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateResult.error) {
      throw new Error(updateResult.error.message);
    }

    return NextResponse.json({
      success: true,
      data: updateResult.data,
      message: 'Campaign started successfully',
    });
  } catch (error: any) {
    console.error('Error starting campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start campaign' },
      { status: 500 }
    );
  }
}