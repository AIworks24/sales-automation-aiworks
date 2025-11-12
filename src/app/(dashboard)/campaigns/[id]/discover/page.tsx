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
      } else {
        alert('No prospects found. Scrapingdog returned results but they need manual parsing. Please add prospects manually using LinkedIn URLs.');
      }
    } catch (error) {
      console.error('Error discovering prospects:', error);
      alert('Discovery failed. Please add prospects manually.');
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
    if (selectedProspects.size === 0) return;
    
    setAddingProspects(true);
    const selectedData = Array.from(selectedProspects).map(index => prospects[index]);
    
    try {
      for (const prospect of selectedData) {
        await fetch('/api/prospects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaign_id: campaignId,
            linkedin_url: prospect.profileUrl,
            first_name: prospect.name.split(' ')[0],
            last_name: prospect.name.split(' ').slice(1).join(' '),
            title: prospect.title,
            company: prospect.company,
            location: prospect.location,
          }),
        });
      }
      alert('Added ' + selectedData.length + ' prospects to campaign');
      router.push('/campaigns/' + campaignId);
    } catch (error) {
      alert('Failed to add prospects');
    } finally {
      setAddingProspects(false);
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
          <Link href="/campaigns" className="mt-4 inline-block text-blue-600">Back to Campaigns</Link>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Criteria</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {campaign.target_criteria?.titles?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Titles</p>
              <div className="flex flex-wrap gap-2">
                {campaign.target_criteria.titles.map((title: string) => (
                  <span key={title} className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">{title}</span>
                ))}
              </div>
            </div>
          )}
          {campaign.target_criteria?.industries?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Industries</p>
              <div className="flex flex-wrap gap-2">
                {campaign.target_criteria.industries.map((industry: string) => (
                  <span key={industry} className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">{industry}</span>
                ))}
              </div>
            </div>
          )}
          {campaign.target_criteria?.locations?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Locations</p>
              <div className="flex flex-wrap gap-2">
                {campaign.target_criteria.locations.map((location: string) => (
                  <span key={location} className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700">{location}</span>
                ))}
              </div>
            </div>
          )}
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
            {prospects.map((prospect, index) => (
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

      <div className="rounded-lg bg-yellow-50 p-6 border border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Note: LinkedIn Scraping Limitations</h3>
        <p className="text-sm text-yellow-800">Scrapingdog returns HTML that requires complex parsing. If no results appear above, add prospects manually using their LinkedIn URLs instead.</p>
        <Link href={'/prospects/new?campaign_id=' + campaignId} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add Prospect Manually
        </Link>
      </div>
    </div>
  );
}