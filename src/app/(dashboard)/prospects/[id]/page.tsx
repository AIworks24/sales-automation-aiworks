'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import MessagePreview from '@/components/messages/MessagePreview';

export default function ProspectDetailPage() {
  const params = useParams();
  const [prospect, setProspect] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const prospectId = params.id as string;

  useEffect(() => {
    loadProspect();
  }, [prospectId]);

  const loadProspect = async () => {
    try {
      const response = await fetch('/api/prospects/' + prospectId);
      const data = await response.json();
      if (data.success) {
        setProspect(data.data);
      }
    } catch (error) {
      console.error('Error loading prospect:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Loading prospect...</p>
        </div>
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Prospect not found</p>
          <Link href="/prospects" className="mt-4 inline-block text-blue-600">Back to Prospects</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/prospects" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Back to Prospects
        </Link>
        <div className="mt-4 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{prospect.full_name}</h1>
            <p className="mt-2 text-gray-600">{prospect.title}</p>
            <p className="text-gray-600">{prospect.company}</p>
          </div>
          <div className="flex items-center gap-3">
           <span className="rounded-full px-4 py-2 text-sm font-medium capitalize bg-blue-100 text-blue-700">{prospect.status ? prospect.status.replace('_', ' ') : 'new'}</span>
            <a href={prospect.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
              <ExternalLink className="h-4 w-4" />
              View LinkedIn
            </a>
          </div>
        </div>
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Prospect Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <p className="mt-1 text-gray-900">{prospect.location || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Industry</label>
            <p className="mt-1 text-gray-900">{prospect.industry || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{prospect.email || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <p className="mt-1 text-gray-900">{prospect.phone || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Contacted</label>
            <p className="mt-1 text-gray-900">{prospect.last_contacted_at ? new Date(prospect.last_contacted_at).toLocaleDateString() : 'Never'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Added</label>
            <p className="mt-1 text-gray-900">{new Date(prospect.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        {prospect.notes && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <p className="mt-1 text-gray-900 whitespace-pre-wrap">{prospect.notes}</p>
          </div>
        )}
      </div>
      <MessagePreview prospectId={prospect.id} prospectName={prospect.full_name} onSent={loadProspect} />
    </div>
  );
}