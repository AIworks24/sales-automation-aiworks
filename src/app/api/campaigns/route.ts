import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user, error, supabase } = await getAuthenticatedUser(request);
    
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.id);

    const profileResult = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    const profileData = profileResult.data as any;

    if (profileResult.error || !profileData) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const companyId = profileData.company_id;

    const campaignsResult = await supabase
      .from('campaigns')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    const campaigns = (campaignsResult.data as any) || [];

    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign: any) => {
        const prospectsResult = await supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id);

        const contactedResult = await supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)
          .eq('status', 'contacted');

        const responsesResult = await supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)
          .eq('status', 'responded');

        const meetingsResult = await supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)
          .eq('status', 'meeting_booked');

        return {
          ...campaign,
          stats: {
            total_prospects: prospectsResult.count || 0,
            contacted: contactedResult.count || 0,
            responses: responsesResult.count || 0,
            meetings: meetingsResult.count || 0,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: campaignsWithStats,
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error, supabase } = await getAuthenticatedUser(request);
    
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.id);

    const profileResult = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    const profileData = profileResult.data as any;

    if (profileResult.error || !profileData) {
      console.error('Profile error:', profileResult.error);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const companyId = profileData.company_id;
    console.log('✅ Profile found, company_id:', companyId);

    const body = await request.json();
    const {
      name,
      description,
      target_criteria,
      message_template,
      ai_personalization_enabled,
      daily_contact_limit,
      status,
    } = body;

    console.log('📝 Creating campaign:', { name, status });

    if (!name || !message_template) {
      return NextResponse.json(
        { error: 'Missing required fields: name and message_template' },
        { status: 400 }
      );
    }

    const campaignResult = await supabase
      .from('campaigns')
      .insert({
        company_id: companyId,
        name,
        description: description || null,
        target_criteria: target_criteria || {},
        message_template,
        ai_personalization_enabled: ai_personalization_enabled ?? true,
        daily_contact_limit: daily_contact_limit || 20,
        created_by: user.id,
        status: status || 'draft',
        started_at: status === 'active' ? new Date().toISOString() : null,
      } as any)
      .select()
      .single();

    const campaignData = campaignResult.data as any;

    if (campaignResult.error) {
      console.error('❌ Campaign creation error:', campaignResult.error);
      throw new Error(campaignResult.error.message);
    }

    console.log('✅ Campaign created:', campaignData.id);

    return NextResponse.json({
      success: true,
      data: campaignData,
      message: 'Campaign created successfully',
    });
  } catch (error: any) {
    console.error('❌ Error creating campaign:', error);
    return NextResponse.json(
      {
        error: 'Failed to create campaign',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}