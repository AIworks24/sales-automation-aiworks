'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Briefcase,
  Globe,
  Calendar,
  Loader2
} from 'lucide-react';
import MessagePreview from '@/components/messages/MessagePreview';

export default function ProspectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [prospect, setProspect] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const prospectId = params.id as string;

  useEffect(() => {
    loadProspect();
  }, [prospectId]);

  const loadProspect = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/prospects/${prospectId}`);
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
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600">Loading prospect details...</p>
        </div>
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Prospect not found</p>
          <Link href="/prospects" className="text-blue-600 hover:underline">
            Back to Prospects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <Link 
          href="/prospects" 
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Prospects
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{prospect.full_name}</h1>
            <p className="mt-2 text-lg text-gray-600">{prospect.title || 'Title not available'}</p>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <Building className="h-4 w-4" />
              {prospect.company || 'Company not available'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
              prospect.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
              prospect.status === 'replied' ? 'bg-green-100 text-green-700' :
              prospect.status === 'interested' ? 'bg-purple-100 text-purple-700' :
              prospect.status === 'not_interested' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {prospect.status?.replace('_', ' ') || 'new'}
            </span>
            
            {prospect.linkedin_url && (
              <a
                href={prospect.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
              >
                <ExternalLink className="h-4 w-4" />
                View LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information Card */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4" />
              Email
            </label>
            {prospect.email ? (
              <a 
                href={`mailto:${prospect.email}`}
                className="text-blue-600 hover:underline"
              >
                {prospect.email}
              </a>
            ) : (
              <p className="text-gray-400">Not available</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4" />
              Phone
            </label>
            {prospect.phone ? (
              <a 
                href={`tel:${prospect.phone}`}
                className="text-blue-600 hover:underline"
              >
                {prospect.phone}
              </a>
            ) : (
              <p className="text-gray-400">Not available</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4" />
              Location
            </label>
            <p className="text-gray-900">
              {prospect.location || prospect.city || 'N/A'}
              {prospect.state && `, ${prospect.state}`}
              {prospect.country && ` ${prospect.country}`}
            </p>
          </div>

          {/* Industry */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="h-4 w-4" />
              Industry
            </label>
            <p className="text-gray-900">{prospect.industry || prospect.company_industry || 'N/A'}</p>
          </div>

          {/* Company Website */}
          {prospect.company_website && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Globe className="h-4 w-4" />
                Company Website
              </label>
              <a 
                href={prospect.company_website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {prospect.company_website}
              </a>
            </div>
          )}

          {/* Last Contacted */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4" />
              Last Contacted
            </label>
            <p className="text-gray-900">
              {prospect.last_contacted_at 
                ? new Date(prospect.last_contacted_at).toLocaleDateString() 
                : 'Never'}
            </p>
          </div>
        </div>
      </div>

      {/* Professional Details Card */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h2>
        
        <div className="space-y-4">
          {/* Headline */}
          {prospect.headline && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
              <p className="text-gray-900">{prospect.headline}</p>
            </div>
          )}

          {/* Company Size */}
          {prospect.company_size && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
              <p className="text-gray-900">{prospect.company_size} employees</p>
            </div>
          )}

          {/* Notes */}
          {prospect.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <p className="text-gray-900 whitespace-pre-wrap">{prospect.notes}</p>
            </div>
          )}

          {/* Date Added */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Added to Campaign</label>
            <p className="text-gray-900">{new Date(prospect.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Social Links Card (if available) */}
      {(prospect.twitter_url || prospect.facebook_url) && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Profiles</h2>
          <div className="flex gap-4">
            {prospect.twitter_url && (
              <a
                href={prospect.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                Twitter Profile →
              </a>
            )}
            {prospect.facebook_url && (
              <a
                href={prospect.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                Facebook Profile →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Message Section */}
      <MessagePreview 
        prospectId={prospect.id} 
        prospectName={prospect.full_name} 
        onSent={loadProspect} 
      />
    </div>
  );
}