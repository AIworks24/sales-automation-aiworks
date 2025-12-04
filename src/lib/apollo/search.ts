import { createApolloClient } from './client';

interface LinkedInSearchParams {
  keywords?: string[];
  titles?: string[];
  companies?: string[];
  industries?: string[];
  locations?: string[];
  limit?: number;
  enrichLimit?: number; // NEW: How many results to enrich (costs credits)
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

/**
 * NEW TWO-STEP DISCOVERY PROCESS
 * 
 * Step 1: Search with Apollo (FREE)
 * - Returns: Apollo IDs, basic info, LOCKED emails
 * - Cost: FREE - no credits consumed
 * 
 * Step 2: Bulk Enrich (PAID)
 * - Input: Apollo IDs from step 1
 * - Returns: REAL emails & phones
 * - Cost: 1 credit per person
 * 
 * This is exactly how Apollo's web UI works!
 */
export async function searchLinkedInProspects(
  params: LinkedInSearchParams
): Promise<SearchResult[]> {
  console.log('\n========================================');
  console.log('LinkedIn Prospect Discovery via Apollo.io');
  console.log('TWO-STEP PROCESS: Search → Enrich');
  console.log('========================================\n');

  try {
    const apollo = createApolloClient();
    
    // STEP 1: Search (FREE - get Apollo IDs and basic info)
    console.log('🔍 STEP 1: Searching Apollo database...\n');
    const searchResults = await apollo.searchPeople({
      titles: params.titles,
      keywords: params.keywords,
      locations: params.locations,
      industries: params.industries,
      limit: params.limit || 25,
    });

    if (searchResults.length === 0) {
      console.log('⚠️  No prospects found matching your criteria.');
      console.log('Try adjusting your search parameters.\n');
      return [];
    }

    console.log(`\n✅ STEP 1 COMPLETE: Found ${searchResults.length} prospects`);
    console.log('📋 Basic info captured (names, titles, companies, Apollo IDs)');
    console.log('🔒 Emails are LOCKED at this stage\n');

    // STEP 2: Bulk Enrich (PAID - reveal actual emails and phones)
    console.log('💰 STEP 2: Enriching contacts to reveal emails/phones...');
    
    // Extract Apollo IDs
    const apolloIds = searchResults
      .map((person: any) => person.id)
      .filter((id: string) => id);

    if (apolloIds.length === 0) {
      console.log('⚠️  No Apollo IDs found. Cannot enrich contacts.');
      return convertToSearchResults(searchResults);
    }

    // Determine how many to enrich
    const enrichLimit = params.enrichLimit || searchResults.length;
    const idsToEnrich = apolloIds.slice(0, enrichLimit);

    console.log(`📊 Will enrich ${idsToEnrich.length} of ${apolloIds.length} prospects`);
    console.log(`💵 This will cost ${idsToEnrich.length} credits\n`);

    // Call bulk enrichment API
    const enrichedContacts = await apollo.bulkEnrichContacts(idsToEnrich);

    console.log(`\n✅ STEP 2 COMPLETE: Enriched ${enrichedContacts.length} contacts\n`);

    // Merge enriched data back into search results
    const enrichedMap = new Map(enrichedContacts.map((c: any) => [c.id, c]));
    
    const mergedResults = searchResults.map((searchResult: any) => {
      const enriched = enrichedMap.get(searchResult.id);
      return enriched || searchResult; // Use enriched data if available
    });

    console.log('🔍 RAW APOLLO RESPONSE ANALYSIS');
    console.log('═══════════════════════════════════════\n');

    if (mergedResults.length > 0) {
      const firstResult = mergedResults[0] as any;
      console.log('📊 First Result ENRICHED DATA:');
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

      // Check if enrichment actually worked
      const hasRealEmail = firstResult.email && !firstResult.email.includes('email_not_unlocked');
      const hasPhone = firstResult.phone || (firstResult.phone_numbers && firstResult.phone_numbers.length > 0);
      
      if (hasRealEmail) {
        console.log('✅ Email successfully revealed!');
      } else {
        console.log('⚠️  Email still locked - check:');
        console.log('   1. Apollo plan includes email credits');
        console.log('   2. Credits remaining in account');
        console.log('   3. API key has correct permissions');
      }
      
      if (hasPhone) {
        console.log('✅ Phone number successfully revealed!');
      } else {
        console.log('⚠️  Phone not available for this contact');
      }
      console.log();
    }

    // Convert to SearchResult format
    const prospects: SearchResult[] = mergedResults.map((person: any) => {
      // Extract phone from phone_numbers array if direct phone not available
      let phone = person.phone;
      if (!phone && person.phone_numbers && person.phone_numbers.length > 0) {
        phone = person.phone_numbers[0].raw_number || person.phone_numbers[0].sanitized_number;
      }

      // ✅ FIX: Extract email - check BOTH email field AND personal_emails array
      let email: string | undefined = undefined;
      if (person.email && !person.email.includes('email_not_unlocked')) {
        email = person.email;
      } else if (person.personal_emails && Array.isArray(person.personal_emails) && person.personal_emails.length > 0) {
        email = person.personal_emails[0];
      }

      // Build location string
      const locationParts = [person.city, person.state, person.country].filter(Boolean);
      const location = locationParts.join(', ');

      return {
        name: person.name || `${person.first_name} ${person.last_name}`.trim(),
        title: person.title || '',
        company: person.organization?.name || '',
        location: location || '',
        profileUrl: person.linkedin_url || '',
        headline: person.headline || person.title || '',
        photoUrl: person.photo_url,
        email: email,  // ✅ Now extracts from personal_emails too
        phone: phone,
        industry: person.organization?.industry,
        apolloId: person.id,
      };
    });
   
    // Log detailed sample
    if (prospects.length > 0) {
      console.log('📋 FINAL PROSPECT DATA:');
      console.log('──────────────────────────────────────');
      console.log('Name:', prospects[0].name);
      console.log('Email:', prospects[0].email || '❌ NOT AVAILABLE');
      console.log('Phone:', prospects[0].phone || '❌ NOT AVAILABLE');
      console.log('Industry:', prospects[0].industry || '❌ NOT AVAILABLE');
      console.log('Apollo ID:', prospects[0].apolloId || 'MISSING');
      console.log('──────────────────────────────────────\n');
    }

    // Count how many have email/phone/industry
    const withEmail = prospects.filter(p => p.email).length;
    const withPhone = prospects.filter(p => p.phone).length;
    const withIndustry = prospects.filter(p => p.industry).length;

    console.log('📊 FINAL DATA QUALITY STATISTICS:');
    console.log('──────────────────────────────────────');
    console.log(`Total Prospects: ${prospects.length}`);
    console.log(`With Email: ${withEmail} (${Math.round(withEmail/prospects.length*100)}%)`);
    console.log(`With Phone: ${withPhone} (${Math.round(withPhone/prospects.length*100)}%)`);
    console.log(`With Industry: ${withIndustry} (${Math.round(withIndustry/prospects.length*100)}%)`);
    console.log('──────────────────────────────────────');
    console.log(`\n💰 Total Credits Used: ${enrichedContacts.length}`);
    console.log('========================================\n');
    
    return prospects;

  } catch (error: any) {
    console.error('\n========================================');
    console.error('❌ Error in prospect discovery');
    console.error('Error:', error.message);
    console.error('========================================\n');
    
    throw error;
  }
}

/**
 * Helper function to convert Apollo contacts to SearchResult format
 * Used when enrichment is not needed or fails
 */
function convertToSearchResults(apolloContacts: any[]): SearchResult[] {
  return apolloContacts.map((person: any) => {
    // Extract phone from phone_numbers array if direct phone not available
    let phone = person.phone;
    if (!phone && person.phone_numbers && person.phone_numbers.length > 0) {
      phone = person.phone_numbers[0].raw_number || person.phone_numbers[0].sanitized_number;
    }

    let email: string | undefined = undefined;
    if (person.email && !person.email.includes('email_not_unlocked')) {
      email = person.email;
    } else if (person.personal_emails && Array.isArray(person.personal_emails) && person.personal_emails.length > 0) {
      email = person.personal_emails[0];
    }
    
    // Build location string
    const locationParts = [person.city, person.state, person.country].filter(Boolean);
    const location = locationParts.join(', ');

    return {
      name: person.name || `${person.first_name} ${person.last_name}`.trim(),
      title: person.title || '',
      company: person.organization?.name || '',
      location: location || '',
      profileUrl: person.linkedin_url || '',
      headline: person.headline || person.title || '',
      photoUrl: person.photo_url,
      email: person.email && !person.email.includes('email_not_unlocked') ? person.email : undefined,
      phone: phone,
      industry: person.organization?.industry,
      apolloId: person.id,
    };
  });
}