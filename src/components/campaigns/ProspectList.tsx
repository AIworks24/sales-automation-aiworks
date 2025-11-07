'use client';

import Link from 'next/link';
import { Users, Plus, ExternalLink } from 'lucide-react';

interface ProspectListProps {
  campaignId: string;
  prospects: any[];
  onRefresh: () => void;
}

export default function ProspectList({ campaignId, prospects, onRefresh }: ProspectListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'contacted':
        return 'bg-purple-100 text-purple-700';
      case 'responded':
        return 'bg-green-100 text-green-700';
      case 'meeting_booked':
        return 'bg-pink-100 text-pink-700';
      case 'converted':
        return 'bg-teal-100 text-teal-700';
      case 'not_interested':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Prospects</h2>
          <p className="mt-1 text-sm text-gray-600">
            {prospects.length} {prospects.length === 1 ? 'prospect' : 'prospects'} in this campaign
          </p>
        </div>
        <Link
          href={`/prospects/new?campaign_id=${campaignId}`}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Prospects
        </Link>
      </div>

      {prospects.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No prospects yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Add prospects to start your campaign
          </p>
          <Link
            href={`/prospects/new?campaign_id=${campaignId}`}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add First Prospect
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Last Contacted
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {prospects.map((prospect) => (
                <tr key={prospect.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      href={`/prospects/${prospect.id}`}
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      {prospect.full_name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {prospect.title || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {prospect.company || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusColor(prospect.status)}`}>
                      {prospect.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {prospect.last_contacted_at
                      ? new Date(prospect.last_contacted_at).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <Link
                      href={`/prospects/${prospect.id}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="inline h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}