'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CampaignForm from '@/components/campaigns/CampaignForm';

export default function NewCampaignPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (formData: any, saveAsDraft: boolean = false) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: saveAsDraft ? 'draft' : 'active',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create campaign');
      }

      console.log('✅ Campaign created:', data.data.id);

      // Redirect to campaign detail page
      router.push(`/campaigns/${data.data.id}`);
    } catch (err: any) {
      console.error('❌ Error creating campaign:', err);
      setError(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Create New Campaign
        </h1>
        <p className="mt-2 text-gray-600">
          Set up a new LinkedIn outreach campaign with AI-powered personalization
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Campaign Form */}
      <div className="rounded-lg bg-white p-6 shadow">
        <CampaignForm
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}