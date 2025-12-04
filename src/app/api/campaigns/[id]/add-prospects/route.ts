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
    
    // ✅ DEBUG: Log what we received from frontend
    console.log(`\n📋 Sample prospect received from frontend:`);
    console.log(JSON.stringify(prospects[0], null, 2));

    // Prepare prospects for bulk insert
    const prospectsToInsert = prospects.map((p: any) => {
      const nameParts = p.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // ✅ FIXED: SearchResult already has email extracted properly
      // Just use p.email directly - it's already been processed by search.ts
      const email = p.email || null;
      const phone = p.phone || null;
      const industry = p.industry || null;

      console.log(`\n👤 ${p.name}`);
      console.log(`   email from frontend: ${email || '❌ NONE'}`);
      console.log(`   phone from frontend: ${phone || '❌ NONE'}`);
      console.log(`   industry from frontend: ${industry || '❌ NONE'}`);

      return {
        company_id: profile.company_id,
        campaign_id: params.id,
        linkedin_url: p.profileUrl || '',
        first_name: firstName,
        last_name: lastName,
        full_name: p.name,
        title: p.title || '',
        company: p.company || '',
        industry: industry,
        location: p.location || '',
        email: email,  // ✅ Direct from SearchResult
        phone: phone,  // ✅ Direct from SearchResult
        apollo_id: p.apolloId || null,
        status: 'new',
        notes: p.headline || `${p.title} at ${p.company}`,
      };
    });

    console.log('\n📊 Sample to insert into database:');
    console.log(JSON.stringify(prospectsToInsert[0], null, 2));

    // Bulk insert prospects
    const { data: insertedProspects, error: insertError } = await supabase
      .from('prospects')
      .insert(prospectsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Insert error:', insertError);
      
      if (insertError.code === '23505') {
        return NextResponse.json({
          success: false,
          error: 'Some prospects already exist in this campaign',
          details: insertError.message,
        }, { status: 409 });
      }
      
      throw insertError;
    }

    console.log(`\n✅ Saved ${insertedProspects.length} prospects`);

    // Verify
    if (insertedProspects.length > 0) {
      console.log('\n📊 VERIFICATION - What Supabase saved:');
      const sample = insertedProspects[0];
      console.log(`   Name: ${sample.full_name}`);
      console.log(`   Email: ${sample.email ?? '❌ NULL'}`);
      console.log(`   Phone: ${sample.phone ?? '❌ NULL'}`);
      console.log(`   Industry: ${sample.industry ?? '❌ NULL'}`);
      
      const withEmail = insertedProspects.filter((p: any) => p.email).length;
      const withPhone = insertedProspects.filter((p: any) => p.phone).length;
      console.log(`\n   📊 ${withEmail}/${insertedProspects.length} have emails`);
      console.log(`   📊 ${withPhone}/${insertedProspects.length} have phones\n`);
    }

    return NextResponse.json({
      success: true,
      data: insertedProspects,
      count: insertedProspects.length,
      message: `Successfully added ${insertedProspects.length} prospects`,
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add prospects',
        details: error.message,
      },
      { status: 500 }
    );
  }
}