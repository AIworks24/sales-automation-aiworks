import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user, error, supabase } = await getAuthenticatedUser(request);
    
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaign_id');

    let query = supabase
      .from('prospects')
      .select('*')
      .eq('company_id', profile.company_id);

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    const { data: prospects, error: fetchError } = await query.order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    return NextResponse.json({
      success: true,
      data: prospects || [],
    });
  } catch (error) {
    console.error('Error fetching prospects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prospects' },
      { status: 500 }
    );
  }
}