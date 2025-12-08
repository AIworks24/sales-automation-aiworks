import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error, supabase } = await getAuthenticatedUser(request);
    
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    // Get all messages for this prospect, ordered by most recent first
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, content, created_at, sent_at, variations')
      .eq('prospect_id', params.id)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      throw messagesError;
    }

    // Get the prospect to extract subject from the first message or generate one
    const { data: prospect } = await supabase
      .from('prospects')
      .select('first_name, last_name, company')
      .eq('id', params.id)
      .single();

    // Format messages with subjects
    const formattedMessages = messages.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      subject: `Message to ${prospect?.first_name || 'Prospect'}`,
      created_at: msg.created_at,
      sent_at: msg.sent_at,
      variations: msg.variations || [],
    }));

    return NextResponse.json({
      success: true,
      data: formattedMessages,
    });

  } catch (error: any) {
    console.error('Error fetching message history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message history', details: error.message },
      { status: 500 }
    );
  }
}