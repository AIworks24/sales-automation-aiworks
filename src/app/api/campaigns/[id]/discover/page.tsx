'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';

export default function DiscoverProspectsPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const campaignId = params.id as string;

  useEffect(() => {
    loadCampaign();
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      const response = await fetch('/api/campaigns/' + campaignId);
      const data = await response.json();
      if (data.success) {
        setCampaign(data.data);
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
    } finally {
      setLoading(false);
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

  if (!campaign) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Campaign not found</p>
          <Link href="/campaigns" className="mt-4 inline-block text-blue-600">
            Back to Campaigns
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={'/campaigns/' + campaignId} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Back to Campaign
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Discover Prospects</h1>
        <p className="mt-2 text-gray-600">Finding prospects for: <strong>{campaign.name}</strong></p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">About LinkedIn Discovery</h2>
        <div className="space-y-4 text-gray-600">
          <p>LinkedIn automated prospect discovery requires parsing HTML from search results, which is complex and unreliable.</p>
          <p className="font-semibold text-gray-900">Recommended approach:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Manually search LinkedIn for prospects matching your criteria</li>
            <li>Copy their LinkedIn profile URLs</li>
            <li>Add them one-by-one using the form below</li>
            <li>Our system will scrape their profile data automatically</li>
          </ol>
          <p className="text-sm bg-blue-50 p-4 rounded-lg border border-blue-200">
            <strong>Pro tip:</strong> Services like Apollo.io, ZoomInfo, or LinkedIn Sales Navigator provide structured prospect data through APIs, making bulk discovery much more reliable.
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Prospects Manually</h2>
        <Link href={'/prospects/new?campaign_id=' + campaignId} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
          <Search className="h-5 w-5" />
          Add Prospect via LinkedIn URL
        </Link>
      </div>
    </div>
  );
}