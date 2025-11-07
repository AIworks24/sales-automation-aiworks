'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import CampaignHeader from '@/components/campaigns/CampaignHeader';
import CampaignStats from '@/components/campaigns/CampaignStats';
import ProspectList from '@/components/campaigns/ProspectList';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [prospects, setProspects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const campaignId = params.id as string;

  useEffect(() => {
    loadCampaign();
    loadProspects();
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load campaign');
      }

      setCampaign(data.data);
    } catch (err: any) {
      console.error('Error loading campaign:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProspects = async () => {
    try {
      const response = await fetch(`/api/prospects?campaign_id=${campaignId}`);
      const data = await response.json();

      if (data.success) {
        setProspects(data.data);
      }
    } catch (err) {
      console.error('Error loading prospects:', err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      let endpoint = `/api/campaigns/${campaignId}`;
      
      if (newStatus === 'active') {
        endpoint = `/api/campaigns/${campaignId}/start`;
      } else if (newStatus === 'paused') {
        endpoint = `/api/campaigns/${campaignId}/pause`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update campaign');
      }

      // Reload campaign to get updated status
      loadCampaign();
    } catch (err: any) {
      console.error('Error updating campaign:', err);
      alert(err.message || 'Failed to update campaign');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/campaigns');
      } else {
        throw new Error('Failed to delete campaign');
      }
    } catch (err: any) {
      console.error('Error deleting campaign:', err);
      alert(err.message || 'Failed to delete campaign');
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Campaign not found'}</p>
          <Link
            href="/campaigns"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            ← Back to Campaigns
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Campaigns
      </Link>

      {/* Campaign Header */}
      <CampaignHeader
        campaign={campaign}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />

      {/* Campaign Stats */}
      <CampaignStats campaign={campaign} prospects={prospects} />

      {/* Campaign Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Message Template */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Message Template
          </h3>
          <div className="rounded-lg bg-gray-50 p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {campaign.message_template}
            </pre>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${
              campaign.ai_personalization_enabled
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {campaign.ai_personalization_enabled ? '✓' : '✗'} AI Personalization
            </span>
            <span className="text-gray-600">
              Daily Limit: {campaign.daily_contact_limit}
            </span>
          </div>
        </div>

        {/* Target Criteria */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Target Criteria
          </h3>
          <div className="space-y-4">
            {campaign.target_criteria?.titles?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Job Titles</p>
                <div className="flex flex-wrap gap-2">
                  {campaign.target_criteria.titles.map((title: string) => (
                    <span
                      key={title}
                      className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                    >
                      {title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {campaign.target_criteria?.industries?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Industries</p>
                <div className="flex flex-wrap gap-2">
                  {campaign.target_criteria.industries.map((industry: string) => (
                    <span
                      key={industry}
                      className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {campaign.target_criteria?.locations?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Locations</p>
                <div className="flex flex-wrap gap-2">
                  {campaign.target_criteria.locations.map((location: string) => (
                    <span
                      key={location}
                      className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700"
                    >
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(!campaign.target_criteria?.titles?.length &&
              !campaign.target_criteria?.industries?.length &&
              !campaign.target_criteria?.locations?.length) && (
              <p className="text-sm text-gray-500">No target criteria specified</p>
            )}
          </div>
        </div>
      </div>

      {/* Prospects List */}
      <ProspectList
        campaignId={campaignId}
        prospects={prospects}
        onRefresh={loadProspects}
      />
    </div>
  );
}