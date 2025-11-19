import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, name')
      .eq('id', params.id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const body = await request.json();
    const { prospects } = body;

    if (!prospects || !Array.isArray(prospects) || prospects.length === 0) {
      return NextResponse.json(
        { error: 'No prospects provided' },
        { status: 400 }
      );
    }

    console.log(`\n📥 Adding ${prospects.length} prospects to campaign: ${campaign.name}`);

    // Prepare prospects for bulk insert - SAVE ALL DATA FROM SEARCH RESULTS
    const prospectsToInsert = prospects.map((p: any) => {
      const nameParts = p.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Log what we're receiving
      console.log(`\n👤 Processing: ${p.name}`);
      console.log(`   Email: ${p.email || 'NOT PROVIDED'}`);
      console.log(`   Phone: ${p.phone || 'NOT PROVIDED'}`);
      console.log(`   Industry: ${p.industry || 'NOT PROVIDED'}`);

      return {
        company_id: profile.company_id,
        campaign_id: params.id,
        linkedin_url: p.profileUrl || '',
        first_name: firstName,
        last_name: lastName,
        full_name: p.name,
        title: p.title || '',
        company: p.company || '',
        industry: p.industry || null,  // Save from search results
        location: p.location || '',
        email: p.email || null,        // Save from search results
        phone: p.phone || null,
        apollo_id: p.apolloId || null,        // Save from search results
        status: 'new',
        notes: p.headline || `${p.title} at ${p.company}`,
      };
    });

    console.log('\n📊 Sample prospect to insert:', JSON.stringify(prospectsToInsert[0], null, 2));

    // Bulk insert prospects
    const { data: insertedProspects, error: insertError } = await supabase
      .from('prospects')
      .insert(prospectsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Error inserting prospects:', insertError);
      
      if (insertError.code === '23505') {
        return NextResponse.json({
          success: false,
          error: 'Some prospects already exist in this campaign',
          details: insertError.message,
        }, { status: 409 });
      }
      
      throw insertError;
    }

    console.log(`✅ Successfully added ${insertedProspects.length} prospects`);

    // Log what was actually saved
    if (insertedProspects.length > 0) {
      console.log('\n📊 VERIFICATION - What was saved to Supabase:');
      console.log('──────────────────────────────────────');
      const sample = insertedProspects[0];
      console.log('Name:', sample.full_name);
      console.log('Email:', sample.email || '❌ NULL');
      console.log('Phone:', sample.phone || '❌ NULL');
      console.log('Industry:', sample.industry || '❌ NULL');
      console.log('──────────────────────────────────────\n');
    }

    // ❌ REMOVED BROKEN ENRICHMENT
    // The enrichment was failing because we were using LinkedIn usernames
    // instead of Apollo IDs. The search results already contain the data!

    return NextResponse.json({
      success: true,
      data: insertedProspects,
      count: insertedProspects.length,
      message: `Successfully added ${insertedProspects.length} prospects to campaign`,
    });

  } catch (error: any) {
    console.error('❌ Error adding prospects:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add prospects',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}