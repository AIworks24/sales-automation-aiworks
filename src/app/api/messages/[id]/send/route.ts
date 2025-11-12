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

    // Get the message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('*, prospect:prospects(*)')
      .eq('id', params.id)
      .single();

    if (messageError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Mark message as sent
    const { error: updateError } = await supabase
      .from('messages')
      .update({
        sent_at: new Date().toISOString(),
        sent_by: user.id,
      })
      .eq('id', params.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Update prospect status
    await supabase
      .from('prospects')
      .update({
        status: 'contacted',
        last_contacted_at: new Date().toISOString(),
      })
      .eq('id', message.prospect_id);

    return NextResponse.json({
      success: true,
      message: 'Message marked as sent',
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message', details: error.message },
      { status: 500 }
    );
  }
}