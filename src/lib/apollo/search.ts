import { createApolloClient } from './client';

interface LinkedInSearchParams {
  keywords?: string[];
  titles?: string[];
  companies?: string[];
  industries?: string[];
  locations?: string[];
  limit?: number;
}

interface SearchResult {
  name: string;
  title: string;
  company: string;
  location: string;
  profileUrl: string;
  headline: string;
  photoUrl?: string;
  email?: string;
  phone?: string;
  industry?: string;
  apolloId?: string; // Store Apollo's internal ID
}

export async function searchLinkedInProspects(
  params: LinkedInSearchParams
): Promise<SearchResult[]> {
  console.log('\n========================================');
  console.log('LinkedIn Prospect Discovery via Apollo.io');
  console.log('========================================\n');

  try {
    const apollo = createApolloClient();
    
    // Call Apollo.io API
    const apolloResults = await apollo.searchPeople({
      titles: params.titles,
      keywords: params.keywords,
      locations: params.locations,
      industries: params.industries,
      limit: params.limit || 25,
    });

    console.log('\n🔍 RAW APOLLO RESPONSE ANALYSIS');
    console.log('═══════════════════════════════════════\n');

    if (apolloResults.length > 0) {
      const firstResult = apolloResults[0] as any;
      console.log('📊 First Result RAW DATA:');
      console.log('──────────────────────────────────────');
      console.log('Apollo ID:', firstResult.id || 'MISSING');
      console.log('Name:', firstResult.name || 'MISSING');
      console.log('Email:', firstResult.email || 'NOT AVAILABLE');
      console.log('Email Status:', firstResult.email_status || 'N/A');
      console.log('Phone (direct):', firstResult.phone || 'NOT AVAILABLE');
      console.log('Phone Numbers Array:', JSON.stringify(firstResult.phone_numbers || [], null, 2));
      console.log('Organization:', JSON.stringify(firstResult.organization || {}, null, 2));
      console.log('LinkedIn URL:', firstResult.linkedin_url || 'MISSING');
      console.log('──────────────────────────────────────\n');
    }

    // Convert Apollo format to our SearchResult format
    const prospects: SearchResult[] = apolloResults.map((contact: any) => {
      const location = [contact.city, contact.state, contact.country]
        .filter(Boolean)
        .join(', ');

      // Extract phone from phone_numbers array if available
      let phone = contact.phone || undefined;
      if (!phone && contact.phone_numbers && Array.isArray(contact.phone_numbers)) {
        if (contact.phone_numbers.length > 0) {
          phone = contact.phone_numbers[0].sanitized_number || 
                  contact.phone_numbers[0].raw_number || 
                  undefined;
        }
      }

      // Extract industry from organization if available
      const industry = contact.organization?.industry || 
                       contact.industry || 
                       undefined;

      const result = {
        name: contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
        title: contact.title || 'Title not available',
        company: contact.organization?.name || 'Company not available',
        location: location || 'Location not available',
        profileUrl: contact.linkedin_url || '',
        headline: contact.headline || `${contact.title || 'Professional'} at ${contact.organization?.name || 'Unknown Company'}`,
        photoUrl: contact.photo_url || '',
        email: contact.email || undefined,
        phone: phone,
        industry: industry,
        apolloId: contact.id || undefined, // Store Apollo's ID
      };

      return result;
    });

    console.log('✅ Converted', prospects.length, 'prospects\n');
    
    // Log detailed sample
    if (prospects.length > 0) {
      console.log('📋 CONVERTED PROSPECT SAMPLE:');
      console.log('──────────────────────────────────────');
      console.log('Name:', prospects[0].name);
      console.log('Email:', prospects[0].email || '❌ NOT CAPTURED');
      console.log('Phone:', prospects[0].phone || '❌ NOT CAPTURED');
      console.log('Industry:', prospects[0].industry || '❌ NOT CAPTURED');
      console.log('Apollo ID:', prospects[0].apolloId || 'MISSING');
      console.log('──────────────────────────────────────\n');
    }

    // Count how many have email/phone/industry
    const withEmail = prospects.filter(p => p.email).length;
    const withPhone = prospects.filter(p => p.phone).length;
    const withIndustry = prospects.filter(p => p.industry).length;

    console.log('📊 DATA CAPTURE STATISTICS:');
    console.log('──────────────────────────────────────');
    console.log(`Total Prospects: ${prospects.length}`);
    console.log(`With Email: ${withEmail} (${Math.round(withEmail/prospects.length*100)}%)`);
    console.log(`With Phone: ${withPhone} (${Math.round(withPhone/prospects.length*100)}%)`);
    console.log(`With Industry: ${withIndustry} (${Math.round(withIndustry/prospects.length*100)}%)`);
    console.log('──────────────────────────────────────\n');
    
    return prospects;

  } catch (error: any) {
    console.error('\n========================================');
    console.error('❌ Error in prospect discovery');
    console.error('Error:', error.message);
    console.error('========================================\n');
    
    throw error;
  }
}