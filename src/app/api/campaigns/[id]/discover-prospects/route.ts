import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { searchLinkedInProspects } from '@/lib/scrapingdog/search';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error, supabase } = await getAuthenticatedUser(request);
    
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    // Get campaign with target criteria
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', params.id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const targetCriteria = campaign.target_criteria || {};

    // Search LinkedIn for matching prospects
    const prospects = await searchLinkedInProspects({
      titles: targetCriteria.titles || [],
      industries: targetCriteria.industries || [],
      locations: targetCriteria.locations || [],
      keywords: targetCriteria.keywords || [],
      limit: 50,
    });

    return NextResponse.json({
      success: true,
      data: prospects,
      count: prospects.length,
    });
  } catch (error: any) {
    console.error('Error discovering prospects:', error);
    return NextResponse.json(
      { error: 'Failed to discover prospects', details: error.message },
      { status: 500 }
    );
  }
}