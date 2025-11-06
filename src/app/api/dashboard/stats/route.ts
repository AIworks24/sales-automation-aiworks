import { NextRequest, NextResponse } from 'next/server';
import { createBrowserClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's company_id and role
    const profileResult = await (supabase
      .from('user_profiles') as any)
      .select('company_id, role')
      .eq('id', session.user.id)
      .single();

    if (profileResult.error || !profileResult.data) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const companyId = profileResult.data.company_id;

    // Get total prospects
    const prospectsResult = await (supabase
      .from('prospects') as any)
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);

    const totalProspects = prospectsResult.count || 0;

    // Get active campaigns
    const campaignsResult = await (supabase
      .from('campaigns') as any)
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'active');

    const activeCampaigns = campaignsResult.count || 0;

    // Get messages sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messagesResult = await (supabase
      .from('messages') as any)
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('created_at', today.toISOString());

    const messagesToday = messagesResult.count || 0;

    // Get response rate (responded prospects / contacted prospects)
    const contactedResult = await (supabase
      .from('prospects') as any)
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .in('status', ['contacted', 'responded', 'meeting_booked', 'converted']);

    const contactedCount = contactedResult.count || 0;

    const respondedResult = await (supabase
      .from('prospects') as any)
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .in('status', ['responded', 'meeting_booked', 'converted']);

    const respondedCount = respondedResult.count || 0;

    const responseRate = contactedCount > 0
      ? Math.round((respondedCount / contactedCount) * 100)
      : 0;

    // Get meetings booked this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const meetingsResult = await (supabase
      .from('prospects') as any)
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'meeting_booked')
      .gte('updated_at', weekAgo.toISOString());

    const meetingsBooked = meetingsResult.count || 0;

    // Get conversions
    const conversionsResult = await (supabase
      .from('prospects') as any)
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'converted');

    const conversions = conversionsResult.count || 0;

    // Get recent campaigns (last 5)
    const recentCampaignsResult = await (supabase
      .from('campaigns') as any)
      .select('id, name, status, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(5);

    const recentCampaigns = recentCampaignsResult.data || [];

    // Get prospect count for each campaign
    const campaignsWithCounts = await Promise.all(
      recentCampaigns.map(async (campaign: any) => {
        const result = await (supabase
          .from('prospects') as any)
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id);

        return {
          ...campaign,
          prospects_count: result.count || 0,
        };
      })
    );

    // Get recent prospects (last 5)
    const recentProspectsResult = await (supabase
      .from('prospects') as any)
      .select('id, first_name, last_name, full_name, title, company, status, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(5);

    const recentProspects = recentProspectsResult.data || [];

    return NextResponse.json({
      success: true,
      data: {
        total_prospects: totalProspects,
        active_campaigns: activeCampaigns,
        messages_sent_today: messagesToday,
        response_rate: responseRate,
        meetings_booked: meetingsBooked,
        conversions: conversions,
        recent_campaigns: campaignsWithCounts,
        recent_prospects: recentProspects,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}