'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Pause, Edit, Trash2, CheckCircle, Search } from 'lucide-react';
import { usePermissions } from '@/hooks/userpermissions';

interface CampaignHeaderProps {
  campaign: any;
  onStatusChange: (status: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function CampaignHeader({ campaign, onStatusChange, onDelete }: CampaignHeaderProps) {
  const [loading, setLoading] = useState(false);
  const { can } = usePermissions();

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      await onStatusChange(newStatus);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const canEdit = can('canEditCampaigns');
  const canDelete = can('canDeleteCampaigns');

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
            <span className={'rounded-full border px-4 py-1 text-sm font-medium capitalize ' + getStatusColor(campaign.status)}>
              {campaign.status}
            </span>
          </div>
          {campaign.description && (
            <p className="mt-2 text-gray-600">{campaign.description}</p>
          )}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
            {campaign.started_at && (
              <span>• Started {new Date(campaign.started_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Discover Prospects Button */}
          <Link
            href={'/campaigns/' + campaign.id + '/discover'}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            <Search className="h-4 w-4" />
            Discover Prospects
          </Link>

          {/* Status Control Buttons */}
          {campaign.status === 'draft' && canEdit && (
            <button
              onClick={() => handleStatusChange('active')}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              Start Campaign
            </button>
          )}

          {campaign.status === 'active' && canEdit && (
            <button
              onClick={() => handleStatusChange('paused')}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700 disabled:opacity-50"
            >
              <Pause className="h-4 w-4" />
              Pause
            </button>
          )}

          {campaign.status === 'paused' && canEdit && (
            <button
              onClick={() => handleStatusChange('active')}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              Resume
            </button>
          )}

          {(campaign.status === 'active' || campaign.status === 'paused') && canEdit && (
            <button
              onClick={() => handleStatusChange('completed')}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              Complete
            </button>
          )}

          {/* Edit Button */}
          {canEdit && (
            <Link
              href={'/campaigns/' + campaign.id + '/edit'}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          )}

          {/* Delete Button */}
          {canDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}