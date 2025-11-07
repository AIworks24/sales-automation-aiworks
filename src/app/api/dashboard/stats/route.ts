import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseAnonKey);
}

function getTokenFromCookies(request: NextRequest): string | null {
  const cookies = request.cookies;
  
  for (const cookie of cookies.getAll()) {
    if (cookie.name.includes('auth-token') && !cookie.name.includes('code-verifier')) {
      let cookieValue = cookie.value;
      
      if (cookieValue.startsWith('base64-')) {
        try {
          const base64String = cookieValue.substring(7);
          cookieValue = Buffer.from(base64String, 'base64').toString('utf-8');
        } catch (e) {
          return null;
        }
      }
      
      try {
        const parsed = JSON.parse(cookieValue);
        if (parsed.access_token) return parsed.access_token;
        if (Array.isArray(parsed) && parsed[0]) return parsed[0];
      } catch (e) {
        return cookieValue;
      }
    }
  }
  
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromCookies(request);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    const userResult = await supabase.auth.getUser(token);
    const user = (userResult.data as any).user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profileResult = await supabase
      .from('user_profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    const profileData = profileResult.data as any;

    if (profileResult.error || !profileData) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const companyId = profileData.company_id;

    const prospectsResult = await supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);

    const campaignsResult = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'active');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messagesResult = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('created_at', today.toISOString());

    const contactedResult = await supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .in('status', ['contacted', 'responded', 'meeting_booked', 'converted']);

    const respondedResult = await supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .in('status', ['responded', 'meeting_booked', 'converted']);

    const contactedCount = contactedResult.count || 0;
    const respondedCount = respondedResult.count || 0;

    const responseRate = contactedCount > 0
      ? Math.round((respondedCount / contactedCount) * 100)
      : 0;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const meetingsResult = await supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'meeting_booked')
      .gte('updated_at', weekAgo.toISOString());

    const conversionsResult = await supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'converted');

    const recentCampaignsResult = await supabase
      .from('campaigns')
      .select('id, name, status, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(5);

    const recentCampaigns = (recentCampaignsResult.data as any) || [];

    const campaignsWithCounts = await Promise.all(
      recentCampaigns.map(async (campaign: any) => {
        const result = await supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id);

        return {
          ...campaign,
          prospects_count: result.count || 0,
        };
      })
    );

    const recentProspectsResult = await supabase
      .from('prospects')
      .select('id, first_name, last_name, full_name, title, company, status, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(5);

    const recentProspects = (recentProspectsResult.data as any) || [];

    return NextResponse.json({
      success: true,
      data: {
        total_prospects: prospectsResult.count || 0,
        active_campaigns: campaignsResult.count || 0,
        messages_sent_today: messagesResult.count || 0,
        response_rate: responseRate,
        meetings_booked: meetingsResult.count || 0,
        conversions: conversionsResult.count || 0,
        recent_campaigns: campaignsWithCounts,
        recent_prospects: recentProspects,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}