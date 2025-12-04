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
    estimated_num_employees?: number;
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
  personal_emails?: string[];
}

export class ApolloClient {
  private apiKey: string;
  private baseUrl = 'https://api.apollo.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchPeople(params: ApolloSearchParams): Promise<ApolloContact[]> {
    try {
      console.log('========================================');
      console.log('Apollo.io People Search');
      console.log('========================================');
      
      const requestBody: any = {
        per_page: Math.min(params.limit || 25, 100),
        page: 1,
      };

      if (params.titles && params.titles.length > 0) {
        requestBody.person_titles = params.titles;
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
      }

      if (params.industries && params.industries.length > 0) {
        requestBody.q_organization_keyword_tags = params.industries;
      }

      if (params.keywords && params.keywords.length > 0) {
        requestBody.q_keywords = params.keywords.join(' ');
      }

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
      console.log(`✅ Found ${people.length} prospects`);
      console.log('========================================\n');

      return people;
    } catch (error: any) {
      console.error('❌ Search failed:', error.message);
      throw new Error(`Apollo.io search failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async bulkEnrichContacts(apolloIds: string[]): Promise<ApolloContact[]> {
    try {
      console.log('\n📦 Bulk enriching', apolloIds.length, 'contacts...');
      
      const BATCH_SIZE = 10;
      const batches: string[][] = [];
      
      for (let i = 0; i < apolloIds.length; i += BATCH_SIZE) {
        batches.push(apolloIds.slice(i, i + BATCH_SIZE));
      }
      
      const enrichedContacts: ApolloContact[] = [];
      let successCount = 0;
      let failedCount = 0;

      for (const batch of batches) {
        try {
          const requestBody = {
            reveal_personal_emails: true,
            details: batch.map(apolloId => ({ id: apolloId }))
          };

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
          
          // ✅ FIXED: The contact data is at the ROOT of each match, not in match.person!
          for (const contact of matches) {
            if (contact && contact.id) {
              enrichedContacts.push(contact);
              successCount++;
              
              // Extract email (real or personal)
              const email = contact.email || contact.personal_emails?.[0];
              
              console.log(`✅ ${contact.name}`);
              console.log(`   Email: ${email || 'NONE'}`);
              console.log(`   Phone: ${contact.phone || contact.organization?.primary_phone?.number || 'NONE'}`);
            } else {
              failedCount++;
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (batchError: any) {
          console.error('Batch failed:', batchError.message);
          failedCount += batch.length;
        }
      }

      console.log(`\n✅ Enriched: ${successCount}, Failed: ${failedCount}`);
      
      // Show email statistics
      if (enrichedContacts.length > 0) {
        const withEmail = enrichedContacts.filter(c => {
          const email = c.email || c.personal_emails?.[0];
          return email && !email.includes('email_not_unlocked');
        }).length;
        
        const withPhone = enrichedContacts.filter(c => 
          c.phone || c.organization?.primary_phone?.number
        ).length;
        
        console.log(`📧 Emails: ${withEmail}/${enrichedContacts.length}`);
        console.log(`📱 Phones: ${withPhone}/${enrichedContacts.length}\n`);
      }

      return enrichedContacts;

    } catch (error: any) {
      console.error('❌ Bulk enrichment failed:', error.message);
      throw new Error(`Apollo.io bulk enrichment failed: ${error.message}`);
    }
  }

  async getContactById(id: string): Promise<ApolloContact> {
    try {
      console.log(`📞 Fetching Apollo ID: ${id}`);
      
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

      const person = response.data.person;
      console.log('✅ Retrieved contact');
      
      return person;
    } catch (error: any) {
      console.error('❌ Failed to fetch contact:', error.message);
      throw new Error(`Failed to get contact: ${error.message}`);
    }
  }

  async searchAndEnrich(params: ApolloSearchParams, enrichLimit?: number): Promise<ApolloContact[]> {
    const searchResults = await this.searchPeople(params);
    
    if (searchResults.length === 0) {
      return [];
    }
    
    const apolloIds = searchResults
      .map(person => person.id)
      .filter(id => id);
    
    if (apolloIds.length === 0) {
      return searchResults;
    }
    
    const idsToEnrich = enrichLimit 
      ? apolloIds.slice(0, enrichLimit)
      : apolloIds;
    
    if (idsToEnrich.length === 0) {
      console.log('⚠️  Enrichment limit set to 0 - skipping enrichment');
      return searchResults;
    }
    
    console.log(`💰 Enriching ${idsToEnrich.length} contacts (${idsToEnrich.length} credits)`);
    
    const enrichedContacts = await this.bulkEnrichContacts(idsToEnrich);
    
    const enrichedMap = new Map(enrichedContacts.map(c => [c.id, c]));
    
    const finalResults = searchResults.map(searchResult => {
      const enriched = enrichedMap.get(searchResult.id);
      return enriched || searchResult;
    });
    
    return finalResults;
  }
}

export function createApolloClient(): ApolloClient {
  const apiKey = process.env.APOLLO_API_KEY;
  
  if (!apiKey) {
    throw new Error('APOLLO_API_KEY environment variable is not set');
  }
  
  return new ApolloClient(apiKey);
}