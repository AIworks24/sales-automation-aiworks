'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import CampaignForm from '@/components/campaigns/CampaignForm';

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const campaignId = params.id as string;

  useEffect(() => {
    loadCampaign();
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

  const handleSubmit = async (formData: any) => {
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update campaign');
      }

      console.log('✅ Campaign updated:', data.data.id);

      // Redirect back to campaign detail
      router.push(`/campaigns/${campaignId}`);
    } catch (err: any) {
      console.error('❌ Error updating campaign:', err);
      setError(err.message || 'Failed to update campaign');
    } finally {
      setSubmitting(false);
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
      {/* Header */}
      <div>
        <Link
          href={`/campaigns/${campaignId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaign
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Edit Campaign
        </h1>
        <p className="mt-2 text-gray-600">
          Update your campaign settings and message template
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
          initialData={campaign}
          onSubmit={handleSubmit}
          loading={submitting}
        />
      </div>
    </div>
  );
}