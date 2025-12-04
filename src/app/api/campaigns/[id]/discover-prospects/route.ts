import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { searchLinkedInProspects } from '@/lib/apollo/search';

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

    // ✅ FIX: Read enrichLimit from request body
    const body = await request.json();
    const enrichLimit = body.enrichLimit !== undefined ? body.enrichLimit : 10;

    console.log(`\n🎯 Discovery Request:`);
    console.log(`   Enrich Limit: ${enrichLimit}`);
    console.log(`   Search Limit: 50\n`);

    // Search LinkedIn for matching prospects
    const prospects = await searchLinkedInProspects({
      titles: targetCriteria.titles || [],
      industries: targetCriteria.industries || [],
      locations: targetCriteria.locations || [],
      keywords: targetCriteria.keywords || [],
      limit: 50,
      enrichLimit: enrichLimit,  // ✅ Now uses the value from frontend!
    });

    // ✅ DEBUG: Log what we're returning
    console.log(`\n📤 Returning to frontend: ${prospects.length} prospects`);
    if (prospects.length > 0) {
      const enrichedCount = prospects.filter(p => p.email).length;
      console.log(`   ${enrichedCount} have emails`);
      console.log(`\n   Sample (${prospects[0].name}):`);
      console.log(`      email: ${prospects[0].email || 'NONE'}`);
      console.log(`      apolloId: ${prospects[0].apolloId}`);
    }

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