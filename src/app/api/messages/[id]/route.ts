import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helpers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error, supabase } = await getAuthenticatedUser(request);
    
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, variations } = body;

    const updateData: any = {};
    
    if (content !== undefined) {
      updateData.content = content;
    }
    
    if (variations !== undefined) {
      updateData.variations = variations;
    }

    const { data: message, error: updateError } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating message:', updateError);
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      data: message,
    });

  } catch (error: any) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message', details: error.message },
      { status: 500 }
    );
  }
}