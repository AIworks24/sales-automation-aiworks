import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user, error, supabase } = await getAuthenticatedUser(request);
    
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    // Get user role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // REP ANALYTICS: Only their own messages and prospects
    if (profile.role === 'rep') {
      // Get rep's messages
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('sent_by', user.id)
        .not('sent_at', 'is', null);

      const messagesArray = (messages as any[]) || [];
      const totalSent = messagesArray.length;
      const opened = messagesArray.filter((m: any) => m.opened_at).length;
      const replied = messagesArray.filter((m: any) => m.replied_at).length;

      // Get rep's assigned prospects
      const { data: prospects } = await supabase
        .from('prospects')
        .select('*')
        .eq('assigned_to', user.id);

      const prospectsArray = (prospects as any[]) || [];
      const totalProspects = prospectsArray.length;
      const contacted = prospectsArray.filter((p: any) => 
        ['contacted', 'responded', 'meeting_booked', 'converted'].includes(p.status)
      ).length;
      const responses = prospectsArray.filter((p: any) => 
        ['responded', 'meeting_booked', 'converted'].includes(p.status)
      ).length;
      const meetings = prospectsArray.filter((p: any) => 
        ['meeting_booked', 'converted'].includes(p.status)
      ).length;

      // Recent activity
      const { data: recentMessages } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sent_at,
          opened_at,
          replied_at,
          prospect:prospects(full_name, company, status)
        `)
        .eq('sent_by', user.id)
        .not('sent_at', 'is', null)
        .order('sent_at', { ascending: false })
        .limit(10);

      return NextResponse.json({
        success: true,
        role: 'rep',
        data: {
          overview: {
            total_prospects: totalProspects,
            messages_sent: totalSent,
            prospects_contacted: contacted,
            responses_received: responses,
            meetings_booked: meetings,
            open_rate: totalSent > 0 ? Math.round((opened / totalSent) * 100) : 0,
            response_rate: contacted > 0 ? Math.round((responses / contacted) * 100) : 0,
          },
          recent_activity: recentMessages || [],
          message_performance: {
            sent: totalSent,
            opened: opened,
            replied: replied,
            open_rate: totalSent > 0 ? ((opened / totalSent) * 100).toFixed(1) : '0',
            reply_rate: totalSent > 0 ? ((replied / totalSent) * 100).toFixed(1) : '0',
          },
        },
      });
    }

    // MANAGER/ADMIN ANALYTICS: Company-wide insights
    // Get all campaigns
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('*')
      .eq('company_id', profile.company_id);

    const campaignsArray = (campaigns as any[]) || [];

    // Get all prospects
    const { data: prospects } = await supabase
      .from('prospects')
      .select('*')
      .eq('company_id', profile.company_id);

    const prospectsArray = (prospects as any[]) || [];

    // Get all messages
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('company_id', profile.company_id)
      .not('sent_at', 'is', null);

    const messagesArray = (messages as any[]) || [];

    // Calculate metrics
    const totalProspects = prospectsArray.length;
    const contacted = prospectsArray.filter((p: any) => 
      ['contacted', 'responded', 'meeting_booked', 'converted'].includes(p.status)
    ).length;
    const responses = prospectsArray.filter((p: any) => 
      ['responded', 'meeting_booked', 'converted'].includes(p.status)
    ).length;
    const meetings = prospectsArray.filter((p: any) => 
      ['meeting_booked', 'converted'].includes(p.status)
    ).length;
    const conversions = prospectsArray.filter((p: any) => p.status === 'converted').length;

    const totalSent = messagesArray.length;
    const opened = messagesArray.filter((m: any) => m.opened_at).length;
    const replied = messagesArray.filter((m: any) => m.replied_at).length;

    // Campaign performance
    const campaignStats = campaignsArray.map((campaign: any) => {
      const campaignProspects = prospectsArray.filter((p: any) => p.campaign_id === campaign.id);
      const campaignMessages = messagesArray.filter((m: any) => m.campaign_id === campaign.id);
      
      const total = campaignProspects.length;
      const contacted = campaignProspects.filter((p: any) => 
        ['contacted', 'responded', 'meeting_booked', 'converted'].includes(p.status)
      ).length;
      const responded = campaignProspects.filter((p: any) => 
        ['responded', 'meeting_booked', 'converted'].includes(p.status)
      ).length;
      
      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        total_prospects: total,
        contacted: contacted,
        responses: responded,
        response_rate: contacted > 0 ? Math.round((responded / contacted) * 100) : 0,
        messages_sent: campaignMessages.length,
      };
    });

    // Top performing campaigns
    const topCampaigns = [...campaignStats]
      .sort((a, b) => b.response_rate - a.response_rate)
      .slice(0, 5);

    // Company/industry breakdown
    const companiesContacted = [...new Set(
      prospectsArray.filter((p: any) => p.company).map((p: any) => p.company)
    )].length;
    const industriesTargeted = [...new Set(
      prospectsArray.filter((p: any) => p.industry).map((p: any) => p.industry)
    )].length;

    // Team performance
    const { data: teamMembers } = await supabase
      .from('user_profiles')
      .select('id, full_name, role')
      .eq('company_id', profile.company_id)
      .in('role', ['rep', 'manager']);

    const teamMembersArray = (teamMembers as any[]) || [];

    const teamStats = teamMembersArray.map((member: any) => {
      const memberProspects = prospectsArray.filter((p: any) => p.assigned_to === member.id);
      const memberMessages = messagesArray.filter((m: any) => m.sent_by === member.id);
      
      const contacted = memberProspects.filter((p: any) => 
        ['contacted', 'responded', 'meeting_booked', 'converted'].includes(p.status)
      ).length;
      const responded = memberProspects.filter((p: any) => 
        ['responded', 'meeting_booked', 'converted'].includes(p.status)
      ).length;
      
      return {
        id: member.id,
        name: member.full_name,
        role: member.role,
        prospects_assigned: memberProspects.length,
        messages_sent: memberMessages.length,
        contacted: contacted,
        responses: responded,
        response_rate: contacted > 0 ? Math.round((responded / contacted) * 100) : 0,
      };
    });

    return NextResponse.json({
      success: true,
      role: profile.role,
      data: {
        overview: {
          total_prospects: totalProspects,
          total_campaigns: campaignsArray.length,
          active_campaigns: campaignsArray.filter((c: any) => c.status === 'active').length,
          messages_sent: totalSent,
          prospects_contacted: contacted,
          responses_received: responses,
          meetings_booked: meetings,
          conversions: conversions,
          companies_contacted: companiesContacted,
          industries_targeted: industriesTargeted,
          open_rate: totalSent > 0 ? Math.round((opened / totalSent) * 100) : 0,
          response_rate: contacted > 0 ? Math.round((responses / contacted) * 100) : 0,
          conversion_rate: totalProspects > 0 ? Math.round((conversions / totalProspects) * 100) : 0,
        },
        campaign_performance: campaignStats,
        top_campaigns: topCampaigns,
        team_performance: teamStats,
        message_performance: {
          sent: totalSent,
          opened: opened,
          replied: replied,
          open_rate: totalSent > 0 ? ((opened / totalSent) * 100).toFixed(1) : '0',
          reply_rate: totalSent > 0 ? ((replied / totalSent) * 100).toFixed(1) : '0',
        },
      },
    });

  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}