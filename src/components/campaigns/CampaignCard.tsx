'use client';

import Link from 'next/link';
import { MoreVertical, Play, Pause, Edit, Trash2, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface CampaignCardProps {
  campaign: any;
  onDelete?: (id: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function CampaignCard({ campaign, onDelete, canEdit, canDelete }: CampaignCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const stats = campaign.stats || {};

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link
              href={`/campaigns/${campaign.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600"
            >
              {campaign.name}
            </Link>
            {campaign.description && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {campaign.description}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <span className={`ml-4 rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusColor(campaign.status)}`}>
            {campaign.status}
          </span>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div>
            <div className="flex items-center gap-2 text-gray-500">
              <Users className="h-4 w-4" />
              <span className="text-xs">Prospects</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {stats.total_prospects || 0}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-500">
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs">Contacted</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {stats.contacted || 0}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-500">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Responses</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {stats.responses || 0}
            </p>
          </div>
        </div>

        {/* Created date */}
        <div className="mt-4 text-xs text-gray-500">
          Created {new Date(campaign.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* Actions Menu */}
      {(canEdit || canDelete) && (
        <div className="absolute top-4 right-4" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10">
              <div className="p-1">
                <Link
                  href={`/campaigns/${campaign.id}`}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  <Play className="h-4 w-4" />
                  View Details
                </Link>

                {canEdit && (
                  <Link
                    href={`/campaigns/${campaign.id}/edit`}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit Campaign
                  </Link>
                )}

                {canDelete && (
                  <>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete?.(campaign.id);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom border color based on status */}
      <div className={`h-1 ${
        campaign.status === 'active' ? 'bg-green-500' :
        campaign.status === 'paused' ? 'bg-yellow-500' :
        campaign.status === 'completed' ? 'bg-gray-400' :
        'bg-blue-500'
      }`} />
    </div>
  );
}