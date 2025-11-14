'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Loader2, Plus } from 'lucide-react';

export default function DiscoverProspectsPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [prospects, setProspects] = useState<any[]>([]);
  const [selectedProspects, setSelectedProspects] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [addingProspects, setAddingProspects] = useState(false);
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

  const discoverProspects = async () => {
    setDiscovering(true);
    try {
      const response = await fetch('/api/campaigns/' + campaignId + '/discover-prospects', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        setProspects(data.data);
        console.log(`✅ Found ${data.data.length} prospects`);
      } else {
        alert(data.message || 'No prospects found. Try adjusting your search criteria.');
      }
    } catch (error) {
      console.error('Error discovering prospects:', error);
      alert('Discovery failed. Please try again.');
    } finally {
      setDiscovering(false);
    }
  };

  const toggleProspect = (index: number) => {
    const newSelected = new Set(selectedProspects);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedProspects(newSelected);
  };

  const addSelectedProspects = async () => {
    if (selectedProspects.size === 0) {
      alert('Please select at least one prospect');
      return;
    }
    
    setAddingProspects(true);
    const selectedData = Array.from(selectedProspects).map(index => prospects[index]);
    
    console.log(`📤 Adding ${selectedData.length} prospects...`);
    console.log(`📍 Endpoint: /api/campaigns/${campaignId}/add-prospects`);
    
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/add-prospects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospects: selectedData,
        }),
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (data.success) {
        alert(`✅ Successfully added ${data.count} prospects to campaign!`);
        router.push(`/campaigns/${campaignId}`);
      } else {
        alert(`❌ ${data.error || 'Failed to add prospects'}`);
      }
    } catch (error) {
      console.error('❌ Error adding prospects:', error);
      alert('Failed to add prospects. Please try again.');
    } finally {
      setAddingProspects(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading campaign...</span>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Campaign not found</p>
          <Link href="/campaigns" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to campaigns
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-8">
        <Link href={'/campaigns/' + campaignId} className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaign
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Discover Prospects</h1>
        <p className="mt-2 text-gray-600">{campaign.name}</p>
      </div>

      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Target Criteria</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Job Titles</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {campaign.target_criteria?.titles?.map((title: string, i: number) => (
                <span key={i} className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                  {title}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Industries</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {campaign.target_criteria?.industries?.map((industry: string, i: number) => (
                <span key={i} className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                  {industry}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Locations</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {campaign.target_criteria?.locations?.map((location: string, i: number) => (
                <span key={i} className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700">
                  {location}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button onClick={discoverProspects} disabled={discovering} className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50">
          {discovering ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Searching LinkedIn...
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Discover Prospects
            </>
          )}
        </button>
      </div>

      {prospects.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Found {prospects.length} Prospects</h2>
            {selectedProspects.size > 0 && (
              <button onClick={addSelectedProspects} disabled={addingProspects} className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50">
                {addingProspects ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add {selectedProspects.size} Selected
                  </>
                )}
              </button>
            )}
          </div>
          <div className="space-y-3">
            {prospects.map((prospect: any, index: number) => (
              <div key={index} className={'flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-colors ' + (selectedProspects.has(index) ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50')} onClick={() => toggleProspect(index)}>
                <input type="checkbox" checked={selectedProspects.has(index)} onChange={() => toggleProspect(index)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{prospect.name}</p>
                  <p className="text-sm text-gray-600">{prospect.title}</p>
                  <p className="text-sm text-gray-500">{prospect.company} • {prospect.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {prospects.length === 0 && !discovering && (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No Prospects Yet</h3>
          <p className="text-gray-600">
            Click "Discover Prospects" to search for people matching your criteria
          </p>
        </div>
      )}
    </div>
  );
}