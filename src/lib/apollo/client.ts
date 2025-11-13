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
  };
  city: string;
  state: string;
  country: string;
  linkedin_url: string;
  email?: string;
  phone?: string;
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
      console.log('Input params:', JSON.stringify(params, null, 2));
      console.log('========================================');
      
      // Build the request body using CORRECT Apollo API parameters
      const requestBody: any = {
        per_page: Math.min(params.limit || 25, 100),
        page: 1,
      };

      // Add person_titles if provided (CORRECT FORMAT)
      if (params.titles && params.titles.length > 0) {
        requestBody.person_titles = params.titles;
        console.log('✓ Job Titles:', params.titles);
      }

      // Add person_locations if provided
      // FORMAT: "City, State, Country" or "State, Country" or "Country"
      // Example: "Richmond, Virginia, US" or "Virginia, US" or "United States"
      if (params.locations && params.locations.length > 0) {
        // Convert locations to Apollo format
        const formattedLocations = params.locations.map(loc => {
          // If location contains "VA", replace with "Virginia, US"
          if (loc.includes('VA') && !loc.includes('Virginia')) {
            return loc.replace(/,?\s*VA\s*/, ', Virginia, US');
          }
          // If location doesn't end with country code, add "US"
          if (!loc.includes('US') && !loc.includes('USA') && !loc.includes('United States')) {
            return `${loc}, US`;
          }
          // Replace "USA" with "US"
          return loc.replace(/\bUSA\b/g, 'US');
        });
        
        requestBody.person_locations = formattedLocations;
        console.log('✓ Locations (formatted):', formattedLocations);
      }

      // Add q_organization_keyword_tags for industries (CORRECT PARAMETER)
      // This filters by company keywords/industries
      if (params.industries && params.industries.length > 0) {
        requestBody.q_organization_keyword_tags = params.industries;
        console.log('✓ Industry Keywords:', params.industries);
      }

      // Add general keywords if provided
      if (params.keywords && params.keywords.length > 0) {
        requestBody.q_keywords = params.keywords.join(' ');
        console.log('✓ General Keywords:', params.keywords.join(' '));
      }

      console.log('\n📤 Final API Request Body:');
      console.log(JSON.stringify(requestBody, null, 2));
      console.log('\n⏳ Calling Apollo.io API...\n');

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
        const location = [people[0].city, people[0].state, people[0].country].filter(Boolean).join(', ');
        console.log('  Location:', location || 'N/A');
        console.log('  LinkedIn:', people[0].linkedin_url || 'N/A');
      } else {
        console.log('\n⚠️  NO RESULTS FOUND');
        console.log('\n💡 Troubleshooting Suggestions:');
        console.log('─────────────────────────────────────');
        console.log('1. Try broader job titles:');
        console.log('   ❌ "COO" → ✅ "Operations" or "Executive"');
        console.log('');
        console.log('2. Try broader locations:');
        console.log('   ❌ "Richmond, VA" → ✅ "Virginia, US" or "United States"');
        console.log('');
        console.log('3. Remove industry filters temporarily:');
        console.log('   Test with just titles + location first');
        console.log('');
        console.log('4. Test in Apollo web interface:');
        console.log('   Visit https://app.apollo.io/people');
        console.log('   Try same filters to verify people exist');
        console.log('');
        console.log('5. Common working examples:');
        console.log('   • Title: "CEO" + Location: "United States"');
        console.log('   • Title: "Operations" + Location: "Virginia, US"');
        console.log('   • Title: "Director" + Location: "United States"');
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
        
        if (error.response.status === 401) {
          console.error('\n🔑 Authentication Error:');
          console.error('Your API key may be invalid or expired.');
          console.error('Check: https://app.apollo.io/#/settings/api-keys');
        } else if (error.response.status === 403) {
          console.error('\n🚫 Permission Error:');
          console.error('Your plan may not have access to this endpoint.');
          console.error('Upgrade: https://www.apollo.io/pricing');
        } else if (error.response.status === 429) {
          console.error('\n⏱️  Rate Limit Error:');
          console.error('You have exceeded your API rate limit.');
          console.error('Wait a moment and try again.');
        }
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