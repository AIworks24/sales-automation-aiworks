import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helpers';

// GET /api/prospects/[id] - Get single prospect
export async function GET(
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

    // Fetch the prospect - JUST RETURN IT, DON'T ENRICH
    const { data: prospect, error: fetchError } = await supabase
      .from('prospects')
      .select('*')
      .eq('id', params.id)
      .eq('company_id', profile.company_id)
      .single();

    if (fetchError || !prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    console.log(`\n📋 Returning prospect: ${prospect.full_name}`);
    console.log(`   Email: ${prospect.email || 'NONE'}`);
    console.log(`   Phone: ${prospect.phone || 'NONE'}\n`);

    return NextResponse.json({
      success: true,
      data: prospect,
    });

  } catch (error: any) {
    console.error('Error fetching prospect:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch prospect',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// PATCH /api/prospects/[id] - Update prospect
export async function PATCH(
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

    const body = await request.json();
    
    const { data: prospect, error: updateError } = await supabase
      .from('prospects')
      .update(body)
      .eq('id', params.id)
      .eq('company_id', profile.company_id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      data: prospect,
    });

  } catch (error: any) {
    console.error('Error updating prospect:', error);
    return NextResponse.json(
      {
        error: 'Failed to update prospect',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/prospects/[id] - Delete prospect
export async function DELETE(
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

    const { error: deleteError } = await supabase
      .from('prospects')
      .delete()
      .eq('id', params.id)
      .eq('company_id', profile.company_id);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: 'Prospect deleted successfully',
    });

  } catch (error: any) {
    console.error('Error deleting prospect:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete prospect',
        details: error.message,
      },
      { status: 500 }
    );
  }
}