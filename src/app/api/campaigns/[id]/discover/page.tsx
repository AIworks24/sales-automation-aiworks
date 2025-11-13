'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Loader2, Plus, Check } from 'lucide-react';

interface Prospect {
  name: string;
  title: string;
  company: string;
  location: string;
  profileUrl: string;
  headline: string;
}

export default function DiscoverProspectsPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [prospects, setProspects] = useState<Prospect[]>([]);
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
      const response = await fetch(`/api/campaigns/${campaignId}`);
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
      const response = await fetch(`/api/campaigns/${campaignId}/discover-prospects`, {
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
      alert('Discovery failed. Please try again or adjust your criteria.');
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

  const toggleAll = () => {
    if (selectedProspects.size === prospects.length) {
      setSelectedProspects(new Set());
    } else {
      setSelectedProspects(new Set(prospects.map((_: Prospect, i: number) => i)));
    }
  };

  const addSelectedProspects = async () => {
    if (selectedProspects.size === 0) {
      alert('Please select at least one prospect');
      return;
    }
    
    setAddingProspects(true);
    const selectedData = Array.from(selectedProspects).map(index => prospects[index]);
    
    console.log(`Adding ${selectedData.length} prospects...`);
    
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/add-prospects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospects: selectedData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Successfully added ${data.count} prospects to campaign!`);
        router.push(`/campaigns/${campaignId}`);
      } else {
        alert(`❌ ${data.error || 'Failed to add prospects'}`);
      }
    } catch (error) {
      console.error('Error adding prospects:', error);
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
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/campaigns/${campaignId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaign
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Prospects</h1>
        <p className="text-gray-600">{campaign.name}</p>
      </div>

      {/* Search Criteria Display */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Search Criteria</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Job Titles</p>
            <div className="flex flex-wrap gap-2">
              {campaign.target_criteria?.titles?.map((title: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {title}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Industries</p>
            <div className="flex flex-wrap gap-2">
              {campaign.target_criteria?.industries?.map((industry: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {industry}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Locations</p>
            <div className="flex flex-wrap gap-2">
              {campaign.target_criteria?.locations?.map((location: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {location}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={discoverProspects}
          disabled={discovering}
          className="mt-6 inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {discovering ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Discovering...
            </>
          ) : (
            <>
              <Search className="h-5 w-5 mr-2" />
              Discover Prospects
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {prospects.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          {/* Header with select all */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleAll}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                  selectedProspects.size === prospects.length 
                    ? 'bg-purple-600 border-purple-600' 
                    : 'border-gray-300'
                }`}>
                  {selectedProspects.size === prospects.length && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                Select All ({prospects.length})
              </button>
              <span className="text-sm text-gray-500">
                {selectedProspects.size} selected
              </span>
            </div>
            <button
              onClick={addSelectedProspects}
              disabled={selectedProspects.size === 0 || addingProspects}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingProspects ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Add Selected ({selectedProspects.size})
                </>
              )}
            </button>
          </div>

          {/* Prospects list */}
          <div className="divide-y divide-gray-200">
            {prospects.map((prospect: Prospect, index: number) => (
              <div
                key={index}
                className="p-6 hover:bg-gray-50 cursor-pointer flex items-start gap-4"
                onClick={() => toggleProspect(index)}
              >
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center flex-shrink-0 mt-1 ${
                  selectedProspects.has(index) 
                    ? 'bg-purple-600 border-purple-600' 
                    : 'border-gray-300'
                }`}>
                  {selectedProspects.has(index) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{prospect.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{prospect.title}</p>
                  <p className="text-sm text-gray-500">{prospect.company}</p>
                  <p className="text-sm text-gray-400 mt-1">{prospect.location}</p>
                  {prospect.profileUrl && (
                    <a
                      href={prospect.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View LinkedIn Profile →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No results message */}
      {!discovering && prospects.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Prospects Yet</h3>
          <p className="text-gray-600">
            Click "Discover Prospects" to search for people matching your criteria
          </p>
        </div>
      )}
    </div>
  );
}