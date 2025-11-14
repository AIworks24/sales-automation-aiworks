import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { createApolloClient } from '@/lib/apollo/client';

// GET /api/prospects/[id] - Get single prospect with enriched data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error, supabase } = await getAuthenticatedUser(request);
    
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    // Get user's company_id
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Fetch the prospect
    const { data: prospect, error: fetchError } = await supabase
      .from('prospects')
      .select('*')
      .eq('id', params.id)
      .eq('company_id', profile.company_id)
      .single();

    if (fetchError || !prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    // Initialize enriched data object
    let enrichedData: Record<string, any> = {};
    
    // Try to enrich with Apollo data if we have a LinkedIn URL
    if (prospect.linkedin_url) {
      try {
        const linkedinId = extractLinkedInId(prospect.linkedin_url);
        
        if (linkedinId) {
          console.log(`🔍 Fetching enriched data for: ${prospect.full_name}`);
          const apollo = createApolloClient();
          
          // Get full contact details from Apollo - returns type 'any'
          const apolloContact: any = await apollo.getContactById(linkedinId);
          
          // Safely extract data with type checks
          enrichedData = {
            email: (apolloContact.email && typeof apolloContact.email === 'string') 
              ? apolloContact.email 
              : prospect.email,
            
            phone: (apolloContact.phone && typeof apolloContact.phone === 'string') 
              ? apolloContact.phone 
              : prospect.phone,
            
            // Safe nested property access for organization.name
            company_name: (
              apolloContact.organization && 
              typeof apolloContact.organization === 'object' &&
              apolloContact.organization.name && 
              typeof apolloContact.organization.name === 'string'
            ) ? apolloContact.organization.name : prospect.company,
            
            // Safe nested property access for organization.industry
            company_industry: (
              apolloContact.organization && 
              typeof apolloContact.organization === 'object' &&
              apolloContact.organization.industry && 
              typeof apolloContact.organization.industry === 'string'
            ) ? apolloContact.organization.industry : prospect.industry,
            
            // Safe nested property access for organization.estimated_num_employees
            company_size: (
              apolloContact.organization && 
              typeof apolloContact.organization === 'object' &&
              apolloContact.organization.estimated_num_employees
            ) ? apolloContact.organization.estimated_num_employees : undefined,
            
            // Safe nested property access for organization.website_url
            company_website: (
              apolloContact.organization && 
              typeof apolloContact.organization === 'object' &&
              apolloContact.organization.website_url && 
              typeof apolloContact.organization.website_url === 'string'
            ) ? apolloContact.organization.website_url : undefined,
            
            headline: (apolloContact.headline && typeof apolloContact.headline === 'string') 
              ? apolloContact.headline 
              : prospect.notes,
            
            linkedin_url: (apolloContact.linkedin_url && typeof apolloContact.linkedin_url === 'string') 
              ? apolloContact.linkedin_url 
              : prospect.linkedin_url,
            
            twitter_url: (apolloContact.twitter_url && typeof apolloContact.twitter_url === 'string') 
              ? apolloContact.twitter_url 
              : undefined,
            
            facebook_url: (apolloContact.facebook_url && typeof apolloContact.facebook_url === 'string') 
              ? apolloContact.facebook_url 
              : undefined,
            
            city: (apolloContact.city && typeof apolloContact.city === 'string') 
              ? apolloContact.city 
              : undefined,
            
            state: (apolloContact.state && typeof apolloContact.state === 'string') 
              ? apolloContact.state 
              : undefined,
            
            country: (apolloContact.country && typeof apolloContact.country === 'string') 
              ? apolloContact.country 
              : undefined,
          };
          
          console.log('✅ Enriched data retrieved');
          
          // Update the database with enriched info if we got new data
          const dbUpdates: Record<string, any> = {};
          
          if (apolloContact.email && typeof apolloContact.email === 'string') {
            dbUpdates.email = apolloContact.email;
          }
          
          if (apolloContact.phone && typeof apolloContact.phone === 'string') {
            dbUpdates.phone = apolloContact.phone;
          }
          
          if (
            apolloContact.organization && 
            typeof apolloContact.organization === 'object' &&
            apolloContact.organization.industry && 
            typeof apolloContact.organization.industry === 'string'
          ) {
            dbUpdates.industry = apolloContact.organization.industry;
          }
          
          // Only update if we have new data
          if (Object.keys(dbUpdates).length > 0) {
            await supabase
              .from('prospects')
              .update(dbUpdates)
              .eq('id', params.id);
          }
        }
      } catch (enrichError: any) {
        console.error('⚠️  Enrichment failed:', enrichError.message);
        // Continue with basic prospect data if enrichment fails
      }
    }

    // Merge prospect data with enriched data
    const fullProspectData = {
      ...prospect,
      ...enrichedData,
      // Ensure we always have fallbacks
      email: enrichedData.email || prospect.email,
      phone: enrichedData.phone || prospect.phone,
      industry: enrichedData.company_industry || prospect.industry,
    };

    return NextResponse.json({
      success: true,
      data: fullProspectData,
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
    
    // Update the prospect
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

    // Delete the prospect
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

// Helper function to extract LinkedIn ID from URL
function extractLinkedInId(linkedinUrl: string): string | null {
  if (!linkedinUrl) return null;
  const match = linkedinUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
  return match ? match[1] : null;
}