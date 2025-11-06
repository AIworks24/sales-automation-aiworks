'use client';

import Link from 'next/link';
import { Target, Users, ArrowRight } from 'lucide-react';

interface RecentActivityProps {
  stats: any;
}

export default function RecentActivity({ stats }: RecentActivityProps) {
  const recentCampaigns = stats?.recent_campaigns || [];
  const recentProspects = stats?.recent_prospects || [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Recent Campaigns */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
          <Link
            href="/campaigns"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
          </Link>
        </div>

        {recentCampaigns.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">No campaigns yet</p>
            <Link
              href="/campaigns/new"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Create your first campaign
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentCampaigns.map((campaign: any) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="block rounded-lg border p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{campaign.name}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {campaign.prospects_count || 0} prospects
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      campaign.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : campaign.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Prospects */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Prospects</h2>
          <Link
            href="/prospects"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
          </Link>
        </div>

        {recentProspects.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">No prospects yet</p>
            <Link
              href="/prospects/new"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Add your first prospect
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentProspects.map((prospect: any) => (
              <Link
                key={prospect.id}
                href={`/prospects/${prospect.id}`}
                className="block rounded-lg border p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{prospect.full_name}</p>
                    <p className="text-sm text-gray-600">{prospect.title}</p>
                    {prospect.company && (
                      <p className="text-xs text-gray-500">{prospect.company}</p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      prospect.status === 'new'
                        ? 'bg-blue-100 text-blue-700'
                        : prospect.status === 'contacted'
                        ? 'bg-purple-100 text-purple-700'
                        : prospect.status === 'responded'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {prospect.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}