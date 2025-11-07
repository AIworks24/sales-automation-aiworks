import { NextRequest, NextResponse } from 'next/server';
import { createBrowserClient } from '@/lib/supabase/client';

// POST /api/campaigns/[id]/pause - Pause campaign
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

    // Update campaign status to paused
    const updateResult = await (supabase
      .from('campaigns') as any)
      .update({
        status: 'paused',
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
      message: 'Campaign paused successfully',
    });
  } catch (error: any) {
    console.error('Error pausing campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to pause campaign' },
      { status: 500 }
    );
  }
}