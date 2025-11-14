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

  async searchPeople(params: ApolloSearchParams): Promise<ApolloContact[]> {
    try {
      console.log('========================================');
      console.log('Apollo.io People Search WITH EMAIL/PHONE REVEAL');
      console.log('Input params:', JSON.stringify(params, null, 2));
      console.log('========================================');
      
      // ✅ ADD REVEAL PARAMETERS TO UNLOCK EMAILS & PHONES!
      const requestBody: any = {
        per_page: Math.min(params.limit || 25, 100),
        page: 1,
        reveal_personal_emails: true,  // ← UNLOCK EMAILS!
        reveal_phone_number: true,     // ← UNLOCK PHONES!
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
      console.log('🔑 Reveal Personal Emails: true');
      console.log('🔑 Reveal Phone Numbers: true');
      console.log('\n⏳ Calling Apollo.io API (this will consume credits)...\n');

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
      console.log('📥 Apollo.io API Response');
      console.log('========================================');
      console.log('✅ Status:', response.status, 'OK');
      console.log('📊 Results Returned:', people.length);
      console.log('📈 Total Available:', pagination.total_entries || 'Unknown');
      console.log('📄 Total Pages:', pagination.total_pages || 'Unknown');
      console.log('📍 Current Page:', pagination.page || 1);
      
      if (people.length > 0) {
        console.log('\n🎯 Sample Result (First Person):');
        console.log('  Name:', people[0].name || 'N/A');
        console.log('  Title:', people[0].title || 'N/A');
        console.log('  Company:', people[0].organization?.name || 'N/A');
        console.log('  Email:', people[0].email || 'NOT AVAILABLE');
        console.log('  Email Status:', people[0].email_status || 'N/A');
        console.log('  Phone:', people[0].phone || people[0].phone_numbers?.[0]?.raw_number || 'NOT AVAILABLE');
        console.log('  Industry:', people[0].organization?.industry || 'NOT AVAILABLE');
        const location = [people[0].city, people[0].state, people[0].country].filter(Boolean).join(', ');
        console.log('  Location:', location || 'N/A');
        console.log('  LinkedIn:', people[0].linkedin_url || 'N/A');
        
        // Check if email is real or locked
        if (people[0].email && people[0].email.includes('email_not_unlocked')) {
          console.log('\n⚠️  WARNING: Email still locked!');
          console.log('Check:');
          console.log('  1. Your Apollo plan includes email credits');
          console.log('  2. You have credits remaining');
          console.log('  3. API key has correct permissions');
        } else if (people[0].email) {
          console.log('\n✅ Real email captured! Credits consumed.');
        }
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
}

export function createApolloClient(): ApolloClient {
  const apiKey = process.env.APOLLO_API_KEY;
  
  if (!apiKey) {
    throw new Error('APOLLO_API_KEY environment variable is not set. Please add it to your .env.local file.');
  }
  
  return new ApolloClient(apiKey);
}