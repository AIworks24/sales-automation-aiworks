import axios from 'axios';

interface LinkedInProfileData {
  firstName: string;
  lastName: string;
  fullName: string;
  headline?: string;
  location?: string;
  company?: string;
  title?: string;
  industry?: string;
  profileUrl: string;
  photoUrl?: string;
  summary?: string;
}

export class ScrapingDogClient {
  private apiKey: string;
  private baseUrl = 'https://api.scrapingdog.com/linkedin';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async scrapeLinkedInProfile(profileUrl: string): Promise<LinkedInProfileData> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          api_key: this.apiKey,
          url: profileUrl,
          field: 'profile',
        },
        timeout: 30000, // 30 second timeout
      });

      if (!response.data) {
        throw new Error('No data returned from Scrapingdog');
      }

      // Parse the response and extract relevant fields
      const data = response.data;
      
      return {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        fullName: data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        headline: data.headline || data.title || '',
        location: data.location || '',
        company: data.company || this.extractCompanyFromHeadline(data.headline),
        title: data.title || this.extractTitleFromHeadline(data.headline),
        industry: data.industry || '',
        profileUrl: profileUrl,
        photoUrl: data.photoUrl || data.profilePicture || '',
        summary: data.summary || data.about || '',
      };
    } catch (error: any) {
      console.error('Scrapingdog API error:', error.response?.data || error.message);
      throw new Error(`Failed to scrape LinkedIn profile: ${error.message}`);
    }
  }

  private extractCompanyFromHeadline(headline?: string): string {
    if (!headline) return '';
    
    // Try to extract company from "Title at Company" pattern
    const atMatch = headline.match(/\s+at\s+(.+?)(?:\s+\||$)/i);
    if (atMatch) return atMatch[1].trim();
    
    return '';
  }

  private extractTitleFromHeadline(headline?: string): string {
    if (!headline) return '';
    
    // Try to extract title from "Title at Company" pattern
    const atMatch = headline.match(/^(.+?)\s+at\s+/i);
    if (atMatch) return atMatch[1].trim();
    
    return headline;
  }

  async searchLinkedInProfiles(searchParams: {
    keywords?: string;
    location?: string;
    industry?: string;
    company?: string;
    title?: string;
    limit?: number;
  }): Promise<any[]> {
    try {
      // Build LinkedIn search URL
      const searchUrl = this.buildLinkedInSearchUrl(searchParams);
      
      const response = await axios.get(this.baseUrl, {
        params: {
          api_key: this.apiKey,
          url: searchUrl,
          field: 'search',
        },
        timeout: 30000,
      });

      return response.data.results || [];
    } catch (error: any) {
      console.error('Scrapingdog search error:', error.response?.data || error.message);
      throw new Error(`Failed to search LinkedIn: ${error.message}`);
    }
  }

  private buildLinkedInSearchUrl(params: {
    keywords?: string;
    location?: string;
    industry?: string;
    company?: string;
    title?: string;
  }): string {
    const baseSearchUrl = 'https://www.linkedin.com/search/results/people/';
    const searchParams = new URLSearchParams();

    if (params.keywords) searchParams.append('keywords', params.keywords);
    if (params.location) searchParams.append('geoUrn', params.location);
    if (params.title) searchParams.append('title', params.title);
    if (params.company) searchParams.append('company', params.company);

    return `${baseSearchUrl}?${searchParams.toString()}`;
  }
}

export function createScrapingDogClient(): ScrapingDogClient {
  const apiKey = process.env.SCRAPINGDOG_API_KEY;
  
  if (!apiKey) {
    throw new Error('SCRAPINGDOG_API_KEY environment variable is not set');
  }
  
  return new ScrapingDogClient(apiKey);
}