// Database Types
export interface Database {
  public: {
    Tables: {
      user_profiles: UserProfile;
      companies: Company;
      campaigns: Campaign;
      prospects: Prospect;
      messages: Message;
      campaign_analytics: CampaignAnalytics;
    };
  };
}

export interface UserProfile {
  id: string;
  company_id: string | null;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'rep';
  linkedin_profile_url?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  act_crm_credentials?: ActCRMCredentials;
  subscription_tier: 'starter' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'trial';
  created_at: string;
  updated_at: string;
}

export interface ActCRMCredentials {
  api_url: string;
  api_key: string;
  client_id: string;
  last_sync?: string;
}

export interface Campaign {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  target_criteria: TargetCriteria;
  message_template: string;
  ai_personalization_enabled: boolean;
  daily_contact_limit: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface TargetCriteria {
  titles?: string[];
  industries?: string[];
  locations?: string[];
  company_sizes?: string[];
  keywords?: string[];
}

export interface Prospect {
  id: string;
  campaign_id: string;
  company_id: string;
  linkedin_url: string;
  apollo_id?: string;
  first_name: string;
  last_name: string;
  full_name: string;
  title?: string;
  company?: string;
  industry?: string;
  location?: string;
  email?: string;
  phone?: string;
  status: 'new' | 'contacted' | 'responded' | 'meeting_booked' | 'converted' | 'not_interested';
  act_crm_id?: string;
  act_crm_synced: boolean;
  last_contacted_at?: string;
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  prospect_id: string;
  campaign_id: string;
  company_id: string;
  content: string;
  message_type: 'connection_request' | 'follow_up' | 'reply';
  sent_at?: string;
  sent_by?: string;
  response_received: boolean;
  response_text?: string;
  response_received_at?: string;
  created_at: string;
}

export interface CampaignAnalytics {
  id: string;
  campaign_id: string;
  date: string;
  prospects_added: number;
  contacts_made: number;
  connection_requests_sent: number;
  connections_accepted: number;
  messages_sent: number;
  responses_received: number;
  meetings_booked: number;
  created_at: string;
}

// Component Props Types
export interface CampaignCardProps {
  campaign: Campaign;
  stats?: {
    total_prospects: number;
    contacted: number;
    responses: number;
    meetings: number;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export interface ProspectTableProps {
  prospects: Prospect[];
  onSelectProspect?: (prospect: Prospect) => void;
  onBulkAction?: (action: string, prospectIds: string[]) => void;
}

export interface MessageComposerProps {
  prospect?: Prospect;
  campaign?: Campaign;
  onSend: (message: string) => Promise<void>;
  onGenerateAI?: () => Promise<string>;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// AI Types
export interface AIMessageGenerationRequest {
  prospect: Prospect;
  template: string;
  company_value_proposition?: string;
  tone?: 'professional' | 'casual' | 'enthusiastic';
}

export interface AIMessageGenerationResponse {
  message: string;
  confidence_score?: number;
  alternatives?: string[];
}

// CRM Types
export interface ActCRMContact {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  email: string;
  phone?: string;
  linkedInUrl?: string;
  notes?: string;
  lastContactDate?: string;
}

export interface CRMSyncResult {
  success: boolean;
  synced_count: number;
  failed_count: number;
  errors?: string[];
}