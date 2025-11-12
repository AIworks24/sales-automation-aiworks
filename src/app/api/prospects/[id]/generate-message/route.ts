import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { generatePersonalizedMessage } from '@/lib/anthropic/client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error, supabase } = await getAuthenticatedUser(request);
    
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    // Get prospect with campaign info
    const { data: prospect, error: prospectError } = await supabase
      .from('prospects')
      .select(`
        *,
        campaign:campaigns(*)
      `)
      .eq('id', params.id)
      .single();

    if (prospectError || !prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    // Get company info
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('company:companies(*)')
      .eq('id', user.id)
      .single();

    const companyInfo = profile?.company ? {
      name: profile.company.name,
      industry: profile.company.industry,
      value_proposition: profile.company.website || '',
    } : undefined;

    // Generate personalized message using Claude AI
    const message = await generatePersonalizedMessage({
      prospect: prospect,
      template: prospect.campaign.message_template,
      campaign: prospect.campaign,
      companyInfo: companyInfo,
      tone: 'professional',
    });

    // Save the generated message
    const { data: savedMessage, error: saveError } = await supabase
      .from('messages')
      .insert({
        prospect_id: prospect.id,
        campaign_id: prospect.campaign_id,
        company_id: prospect.company_id,
        content: message,
        message_type: 'connection_request',
        sent_by: user.id,
      })
      .select()
      .single();

    if (saveError) {
      throw new Error(saveError.message);
    }

    return NextResponse.json({
      success: true,
      data: {
        message: message,
        message_id: savedMessage.id,
      },
    });
  } catch (error: any) {
    console.error('Error generating message:', error);
    return NextResponse.json(
      { error: 'Failed to generate message', details: error.message },
      { status: 500 }
    );
  }
}