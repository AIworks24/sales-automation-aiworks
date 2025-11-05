import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/prospects - List prospects
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaign_id');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query = supabase
      .from('prospects')
      .select(`
        *,
        campaign:campaigns(name, status),
        assigned_user:user_profiles!prospects_assigned_to_fkey(full_name, email)
      `, { count: 'exact' })
      .eq('company_id', profile.company_id);

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: prospects, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: prospects || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching prospects:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch prospects',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/prospects - Create new prospect
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
      campaign_id,
      linkedin_url,
      first_name,
      last_name,
      title,
      company,
      industry,
      location,
      email,
      phone,
    } = body;

    if (!campaign_id || !linkedin_url || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'Missing required fields: campaign_id, linkedin_url, first_name, last_name' },
        { status: 400 }
      );
    }

    // Check if prospect already exists in this campaign
    const { data: existing } = await supabase
      .from('prospects')
      .select('id')
      .eq('campaign_id', campaign_id)
      .eq('linkedin_url', linkedin_url)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Prospect already exists in this campaign' },
        { status: 409 }
      );
    }

    // Create prospect
    const { data: prospect, error } = await supabase
      .from('prospects')
      .insert({
        company_id: profile.company_id,
        campaign_id,
        linkedin_url,
        first_name,
        last_name,
        full_name: `${first_name} ${last_name}`,
        title,
        company,
        industry,
        location,
        email,
        phone,
        status: 'new',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: prospect,
      message: 'Prospect created successfully',
    });
  } catch (error) {
    console.error('Error creating prospect:', error);
    return NextResponse.json(
      {
        error: 'Failed to create prospect',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}