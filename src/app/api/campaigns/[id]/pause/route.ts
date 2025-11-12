import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error, supabase } = await getAuthenticatedUser(request);
    
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const updateResult = await supabase
      .from('campaigns')
      .update({ status: 'paused' })
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