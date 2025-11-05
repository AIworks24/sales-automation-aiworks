import type { ActCRMContact, CRMSyncResult, Prospect } from '@/types';

export class ActCRMClient {
  private apiUrl: string;
  private apiKey: string;
  private clientId: string;

  constructor(config: { apiUrl: string; apiKey: string; clientId: string }) {
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
    this.clientId = config.clientId;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.apiUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Client-Id': this.clientId,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Act! CRM API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Act! CRM request failed:', error);
      throw error;
    }
  }

  // Search for existing contact by email
  async searchContact(email: string): Promise<ActCRMContact | null> {
    try {
      const response = await this.request(`/api/contacts/search?email=${encodeURIComponent(email)}`);
      return response.data?.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error('Error searching contact:', error);
      return null;
    }
  }

  // Create new contact
  async createContact(prospect: Prospect): Promise<ActCRMContact> {
    const contactData = {
      firstName: prospect.first_name,
      lastName: prospect.last_name,
      company: prospect.company,
      title: prospect.title,
      email: prospect.email,
      phone: prospect.phone,
      linkedInUrl: prospect.linkedin_url,
      notes: `Added from Sales Automation Platform - Campaign: ${prospect.campaign_id}`,
      customFields: {
        source: 'LinkedIn Automation',
        prospectStatus: prospect.status,
      },
    };

    try {
      const response = await this.request('/api/contacts', {
        method: 'POST',
        body: JSON.stringify(contactData),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  // Update existing contact
  async updateContact(contactId: string, updates: Partial<ActCRMContact>): Promise<ActCRMContact> {
    try {
      const response = await this.request(`/api/contacts/${contactId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  // Create activity/note
  async createActivity(contactId: string, activity: {
    type: string;
    subject: string;
    details: string;
    date: string;
  }): Promise<any> {
    try {
      const response = await this.request(`/api/contacts/${contactId}/activities`, {
        method: 'POST',
        body: JSON.stringify(activity),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  // Create opportunity
  async createOpportunity(contactId: string, opportunity: {
    name: string;
    stage: string;
    value?: number;
    closeDate?: string;
    description?: string;
  }): Promise<any> {
    try {
      const response = await this.request('/api/opportunities', {
        method: 'POST',
        body: JSON.stringify({
          ...opportunity,
          contactId,
        }),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating opportunity:', error);
      throw error;
    }
  }

  // Sync prospect to Act! CRM
  async syncProspect(prospect: Prospect): Promise<CRMSyncResult> {
    try {
      // Check if contact exists
      let contact: ActCRMContact | null = null;
      
      if (prospect.email) {
        contact = await this.searchContact(prospect.email);
      }

      if (contact) {
        // Update existing contact
        await this.updateContact(contact.id, {
          linkedInUrl: prospect.linkedin_url,
          lastContactDate: prospect.last_contacted_at,
          notes: `Last contacted: ${prospect.last_contacted_at}\nStatus: ${prospect.status}`,
        });

        // Log the interaction as an activity
        if (prospect.last_contacted_at) {
          await this.createActivity(contact.id, {
            type: 'LinkedIn Message',
            subject: 'LinkedIn Outreach',
            details: `Contacted via LinkedIn automation campaign`,
            date: prospect.last_contacted_at,
          });
        }

        return {
          success: true,
          synced_count: 1,
          failed_count: 0,
        };
      } else {
        // Create new contact
        const newContact = await this.createContact(prospect);
        
        return {
          success: true,
          synced_count: 1,
          failed_count: 0,
        };
      }
    } catch (error) {
      console.error('Error syncing prospect to Act! CRM:', error);
      return {
        success: false,
        synced_count: 0,
        failed_count: 1,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // Bulk sync multiple prospects
  async bulkSyncProspects(prospects: Prospect[]): Promise<CRMSyncResult> {
    let syncedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const prospect of prospects) {
      try {
        const result = await this.syncProspect(prospect);
        if (result.success) {
          syncedCount += result.synced_count;
        } else {
          failedCount += result.failed_count;
          if (result.errors) {
            errors.push(...result.errors);
          }
        }
        
        // Rate limiting - wait 200ms between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        failedCount++;
        errors.push(`Failed to sync ${prospect.full_name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: failedCount === 0,
      synced_count: syncedCount,
      failed_count: failedCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.request('/api/health');
      return true;
    } catch (error) {
      console.error('Act! CRM connection test failed:', error);
      return false;
    }
  }
}

// Factory function to create CRM client from company credentials
export function createActCRMClient(credentials: {
  api_url: string;
  api_key: string;
  client_id: string;
}): ActCRMClient {
  return new ActCRMClient({
    apiUrl: credentials.api_url,
    apiKey: credentials.api_key,
    clientId: credentials.client_id,
  });
}

// Helper function to get CRM client for a company
export async function getCompanyCRMClient(companyId: string): Promise<ActCRMClient | null> {
  // This will be implemented to fetch company credentials from database
  // For now, return null as placeholder
  
  // TODO: Implement database fetch
  // const supabase = createAdminClient();
  // const { data: company } = await supabase
  //   .from('companies')
  //   .select('act_crm_credentials')
  //   .eq('id', companyId)
  //   .single();
  
  // if (!company?.act_crm_credentials) {
  //   return null;
  // }
  
  // return createActCRMClient(company.act_crm_credentials);
  
  return null;
}