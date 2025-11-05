import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/campaigns - List all campaigns
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's company_id
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Fetch campaigns with creator info
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        creator:user_profiles!campaigns_created_by_fkey(full_name, email)
      `)
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get prospect counts for each campaign
    const campaignsWithStats = await Promise.all(
      (campaigns || []).map(async (campaign) => {
        const { count: total_prospects } = await supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id);

        const { count: contacted } = await supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)
          .eq('status', 'contacted');

        const { count: responses } = await supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)
          .eq('status', 'responded');

        const { count: meetings } = await supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)
          .eq('status', 'meeting_booked');

        return {
          ...campaign,
          stats: {
            total_prospects: total_prospects || 0,
            contacted: contacted || 0,
            responses: responses || 0,
            meetings: meetings || 0,
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
      {
        error: 'Failed to fetch campaigns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's company_id
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      description,
      target_criteria,
      message_template,
      ai_personalization_enabled,
      daily_contact_limit,
    } = body;

    if (!name || !message_template) {
      return NextResponse.json(
        { error: 'Missing required fields: name and message_template' },
        { status: 400 }
      );
    }

    // Create campaign
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        company_id: profile.company_id,
        name,
        description,
        target_criteria: target_criteria || {},
        message_template,
        ai_personalization_enabled: ai_personalization_enabled ?? true,
        daily_contact_limit: daily_contact_limit || 20,
        created_by: session.user.id,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Campaign created successfully',
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      {
        error: 'Failed to create campaign',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}