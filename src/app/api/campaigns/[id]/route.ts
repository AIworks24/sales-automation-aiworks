import { NextRequest, NextResponse } from 'next/server';
import { createBrowserClient } from '@/lib/supabase/client';

// GET /api/campaigns/[id] - Get single campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaignResult = await (supabase
      .from('campaigns') as any)
      .select('*')
      .eq('id', params.id)
      .single();

    if (campaignResult.error) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: campaignResult.data,
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

// PUT /api/campaigns/[id] - Update campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      message_template,
      target_criteria,
      ai_personalization_enabled,
      daily_contact_limit,
      status,
    } = body;

    const updateResult = await (supabase
      .from('campaigns') as any)
      .update({
        name,
        description,
        message_template,
        target_criteria,
        ai_personalization_enabled,
        daily_contact_limit,
        status,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateResult.error) {
      throw new Error(updateResult.error.message);
    }

    return NextResponse.json({
      success: true,
      data: updateResult.data,
      message: 'Campaign updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns/[id] - Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission (admin/manager)
    const profileResult = await (supabase
      .from('user_profiles') as any)
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileResult.data?.role === 'rep') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const deleteResult = await (supabase
      .from('campaigns') as any)
      .delete()
      .eq('id', params.id);

    if (deleteResult.error) {
      throw new Error(deleteResult.error.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}