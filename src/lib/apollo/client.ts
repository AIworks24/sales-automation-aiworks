import axios from 'axios';

interface ApolloSearchParams {
  titles?: string[];
  industries?: string[];
  locations?: string[];
  keywords?: string[];
  limit?: number;
}

interface ApolloContact {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  title: string;
  organization?: {
    name: string;
    industry?: string;
    website_url?: string;
    phone?: string;
    primary_phone?: {
      number: string;
      sanitized_number: string;
    };
  };
  city: string;
  state: string;
  country: string;
  linkedin_url: string;
  email?: string;
  email_status?: string;
  phone?: string;
  phone_numbers?: Array<{
    raw_number: string;
    sanitized_number: string;
    type: string;
  }>;
  photo_url?: string;
  headline?: string;
  twitter_url?: string;
  facebook_url?: string;
}

export class ApolloClient {
  private apiKey: string;
  private baseUrl = 'https://api.apollo.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * STEP 1: Search for people using filters
   * This returns basic info + Apollo IDs (emails will be locked)
   * Credits: FREE
   */
  async searchPeople(params: ApolloSearchParams): Promise<ApolloContact[]> {
    try {
      console.log('========================================');
      console.log('Apollo.io People Search (Step 1)');
      console.log('Input params:', JSON.stringify(params, null, 2));
      console.log('========================================');
      
      // Build request body (reveal parameters DON'T work on this endpoint!)
      const requestBody: any = {
        per_page: Math.min(params.limit || 25, 100),
        page: 1,
      };

      if (params.titles && params.titles.length > 0) {
        requestBody.person_titles = params.titles;
        console.log('✓ Job Titles:', params.titles);
      }

      if (params.locations && params.locations.length > 0) {
        const formattedLocations = params.locations.map(loc => {
          if (loc.includes('VA') && !loc.includes('Virginia')) {
            return loc.replace(/,?\s*VA\s*/, ', Virginia, US');
          }
          if (!loc.includes('US') && !loc.includes('USA') && !loc.includes('United States')) {
            return `${loc}, US`;
          }
          return loc.replace(/\bUSA\b/g, 'US');
        });
        
        requestBody.person_locations = formattedLocations;
        console.log('✓ Locations (formatted):', formattedLocations);
      }

      if (params.industries && params.industries.length > 0) {
        requestBody.q_organization_keyword_tags = params.industries;
        console.log('✓ Industry Keywords:', params.industries);
      }

      if (params.keywords && params.keywords.length > 0) {
        requestBody.q_keywords = params.keywords.join(' ');
        console.log('✓ General Keywords:', params.keywords.join(' '));
      }

      console.log('\n📤 Final API Request Body:');
      console.log(JSON.stringify(requestBody, null, 2));
      console.log('\n⏳ Calling Apollo.io search endpoint (FREE - no credits)...\n');

      const response = await axios.post(
        `${this.baseUrl}/mixed_people/search`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': this.apiKey,
            'Cache-Control': 'no-cache',
          },
          timeout: 30000,
        }
      );

      const people = response.data.people || [];
      const pagination = response.data.pagination || {};

      console.log('========================================');
      console.log('📥 Apollo.io Search Response (Step 1)');
      console.log('========================================');
      console.log('✅ Status:', response.status, 'OK');
      console.log('📊 Results Returned:', people.length);
      console.log('📈 Total Available:', pagination.total_entries || 'Unknown');
      console.log('📄 Total Pages:', pagination.total_pages || 'Unknown');
      console.log('📍 Current Page:', pagination.page || 1);
      
      if (people.length > 0) {
        console.log('\n🎯 Sample Result (Basic Info):');
        console.log('  Name:', people[0].name || 'N/A');
        console.log('  Title:', people[0].title || 'N/A');
        console.log('  Company:', people[0].organization?.name || 'N/A');
        console.log('  Apollo ID:', people[0].id || 'MISSING');
        console.log('  Email Status:', people[0].email?.includes('email_not_unlocked') ? '🔒 LOCKED' : '✅ Available');
        console.log('  Location:', [people[0].city, people[0].state].filter(Boolean).join(', ') || 'N/A');
        console.log('  LinkedIn:', people[0].linkedin_url || 'N/A');
        console.log('\n📌 Note: Emails are LOCKED at this stage.');
        console.log('📌 Use bulkEnrichContacts() to reveal actual data.');
      } else {
        console.log('\n⚠️  NO RESULTS FOUND');
      }
      console.log('========================================\n');

      return people;
    } catch (error: any) {
      console.error('========================================');
      console.error('❌ Apollo.io API Error');
      console.error('========================================');
      console.error('Error Type:', error.constructor.name);
      console.error('Error Message:', error.message);
      
      if (error.response) {
        console.error('\n📛 API Response Details:');
        console.error('Status Code:', error.response.status);
        console.error('Status Text:', error.response.statusText);
        console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
      }
      
      console.error('========================================\n');
      
      throw new Error(`Apollo.io search failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * STEP 2: Bulk enrich contacts using Apollo IDs
   * This is the CORRECT way to reveal emails and phones after searching
   * Credits: 1 credit per person
   * 
   * @param apolloIds - Array of Apollo IDs from search results
   * @returns Array of enriched contacts with revealed data
   */
  async bulkEnrichContacts(apolloIds: string[]): Promise<ApolloContact[]> {
    try {
      console.log('\n========================================');
      console.log('Apollo.io Bulk Enrichment (Step 2)');
      console.log('========================================');
      console.log(`📦 Enriching ${apolloIds.length} contacts`);
      console.log('🔑 This WILL consume credits to reveal emails/phones');
      console.log(`💰 Cost: ${apolloIds.length} credits (1 per person)`);
      
      // Apollo's bulk_match endpoint accepts up to 10 IDs at a time
      const BATCH_SIZE = 10;
      const batches: string[][] = [];
      
      for (let i = 0; i < apolloIds.length; i += BATCH_SIZE) {
        batches.push(apolloIds.slice(i, i + BATCH_SIZE));
      }
      
      console.log(`📊 Processing in ${batches.length} batches of up to ${BATCH_SIZE}`);
      
      const enrichedContacts: ApolloContact[] = [];
      let successCount = 0;
      let failedCount = 0;

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`\n⏳ Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} contacts)...`);

        try {
          const requestBody = {
            reveal_personal_emails: true,
            reveal_phone_number: true,
            details: batch.map(apolloId => ({ id: apolloId }))
          };

          console.log(`📤 Request: ${batch.length} Apollo IDs`);

          const response = await axios.post(
            `${this.baseUrl}/people/bulk_match`,
            requestBody,
            {
              headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': this.apiKey,
              },
              timeout: 30000,
            }
          );

          const matches = response.data.matches || [];
          
          console.log(`📥 Response: ${matches.length} matches returned`);
          
          for (const match of matches) {
            if (match.person) {
              enrichedContacts.push(match.person);
              successCount++;
              
              // Log first enriched contact as sample
              if (successCount === 1) {
                const person = match.person;
                console.log('\n🎯 First Enriched Contact Sample:');
                console.log('  Name:', person.name);
                console.log('  Email:', person.email || 'NOT AVAILABLE');
                console.log('  Phone:', person.phone || person.phone_numbers?.[0]?.raw_number || 'NOT AVAILABLE');
                console.log('  Company:', person.organization?.name || 'N/A');
                console.log('  Industry:', person.organization?.industry || 'N/A');
              }
            } else {
              failedCount++;
            }
          }
          
          console.log(`✅ Batch ${batchIndex + 1} complete: ${matches.length} contacts enriched`);
          
          // Small delay between batches to avoid rate limits
          if (batchIndex < batches.length - 1) {
            console.log('⏸️  Pausing 500ms before next batch...');
            await new Promise(resolve => setTimeout(resolve, 500));
          }

        } catch (batchError: any) {
          console.error(`❌ Batch ${batchIndex + 1} failed:`, batchError.message);
          if (batchError.response) {
            console.error('   Status:', batchError.response.status);
            console.error('   Error:', JSON.stringify(batchError.response.data, null, 2));
          }
          failedCount += batch.length;
        }
      }

      console.log('\n========================================');
      console.log('📥 Bulk Enrichment Complete');
      console.log('========================================');
      console.log(`✅ Successfully enriched: ${successCount}`);
      console.log(`❌ Failed: ${failedCount}`);
      console.log(`📊 Total processed: ${successCount + failedCount}`);
      
      if (enrichedContacts.length > 0) {
        const withEmail = enrichedContacts.filter(c => 
          c.email && !c.email.includes('email_not_unlocked')
        ).length;
        const withPhone = enrichedContacts.filter(c => 
          c.phone || (c.phone_numbers && c.phone_numbers.length > 0)
        ).length;
        const withIndustry = enrichedContacts.filter(c => 
          c.organization?.industry
        ).length;
        
        console.log('\n📊 Data Quality Statistics:');
        console.log(`📧 Real emails: ${withEmail} (${Math.round(withEmail/enrichedContacts.length*100)}%)`);
        console.log(`📱 Phone numbers: ${withPhone} (${Math.round(withPhone/enrichedContacts.length*100)}%)`);
        console.log(`🏢 Industries: ${withIndustry} (${Math.round(withIndustry/enrichedContacts.length*100)}%)`);
      }
      console.log('========================================\n');

      return enrichedContacts;

    } catch (error: any) {
      console.error('========================================');
      console.error('❌ Apollo.io Bulk Enrichment Error');
      console.error('========================================');
      console.error('Error:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
      }
      console.error('========================================\n');
      
      throw new Error(`Apollo.io bulk enrichment failed: ${error.message}`);
    }
  }

  /**
   * Get a single contact by ID (alternative to bulk enrichment for single contacts)
   */
  async getContactById(id: string): Promise<ApolloContact> {
    try {
      console.log(`📞 Fetching contact details for ID: ${id}`);
      
      const response = await axios.get(
        `${this.baseUrl}/people/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': this.apiKey,
          },
          timeout: 30000,
        }
      );

      console.log('✅ Contact details retrieved successfully');
      return response.data.person;
    } catch (error: any) {
      console.error('❌ Error fetching contact:', error.response?.data || error.message);
      throw new Error(`Failed to get contact: ${error.message}`);
    }
  }

  /**
   * COMPLETE TWO-STEP WORKFLOW: Search + Enrich
   * This is the recommended way to discover prospects with real data
   * 
   * @param params - Search parameters
   * @param enrichLimit - How many to enrich (default: all results)
   * @returns Enriched contacts with real emails and phones
   */
  async searchAndEnrich(params: ApolloSearchParams, enrichLimit?: number): Promise<ApolloContact[]> {
    console.log('\n🚀 Starting Two-Step Discovery: Search → Enrich');
    console.log('══════════════════════════════════════════════════\n');
    
    // Step 1: Search (FREE)
    const searchResults = await this.searchPeople(params);
    
    if (searchResults.length === 0) {
      console.log('⚠️  No search results found. Stopping here.');
      return [];
    }
    
    // Extract Apollo IDs
    const apolloIds = searchResults
      .map(person => person.id)
      .filter(id => id); // Remove any undefined IDs
    
    if (apolloIds.length === 0) {
      console.log('⚠️  No Apollo IDs found in search results. Cannot enrich.');
      return searchResults;
    }
    
    // Limit how many to enrich if specified
    const idsToEnrich = enrichLimit 
      ? apolloIds.slice(0, enrichLimit)
      : apolloIds;
    
    console.log(`\n📊 Found ${apolloIds.length} prospects`);
    console.log(`💰 Will enrich ${idsToEnrich.length} prospects (costs ${idsToEnrich.length} credits)`);
    
    if (enrichLimit && apolloIds.length > enrichLimit) {
      console.log(`⚠️  Note: Only enriching first ${enrichLimit} of ${apolloIds.length} results`);
    }
    
    // Step 2: Bulk Enrich (PAID - consumes credits)
    const enrichedContacts = await this.bulkEnrichContacts(idsToEnrich);
    
    // Merge enriched data back into search results
    const enrichedMap = new Map(enrichedContacts.map(c => [c.id, c]));
    
    const finalResults = searchResults.map(searchResult => {
      const enriched = enrichedMap.get(searchResult.id);
      return enriched || searchResult; // Use enriched if available, else keep search result
    });
    
    console.log('\n✅ Two-Step Discovery Complete!');
    console.log('══════════════════════════════════════════════════\n');
    
    return finalResults;
  }
}

export function createApolloClient(): ApolloClient {
  const apiKey = process.env.APOLLO_API_KEY;
  
  if (!apiKey) {
    throw new Error('APOLLO_API_KEY environment variable is not set. Please add it to your .env.local file.');
  }
  
  return new ApolloClient(apiKey);
}