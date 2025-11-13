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

    // Convert Apollo format to our SearchResult format
    const prospects: SearchResult[] = apolloResults.map(contact => {
      const location = [contact.city, contact.state, contact.country]
        .filter(Boolean)
        .join(', ');

      return {
        name: contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
        title: contact.title || 'Title not available',
        company: contact.organization?.name || 'Company not available',
        location: location || 'Location not available',
        profileUrl: contact.linkedin_url || '',
        headline: `${contact.title || 'Professional'} at ${contact.organization?.name || 'Unknown Company'}`,
        photoUrl: '',
      };
    });

    console.log(`✅ Returning ${prospects.length} prospects to application\n`);
    
    return prospects;

  } catch (error: any) {
    console.error('\n========================================');
    console.error('❌ Error in prospect discovery');
    console.error('Error:', error.message);
    console.error('========================================\n');
    
    // Re-throw the error so the API route can handle it
    throw error;
  }
}