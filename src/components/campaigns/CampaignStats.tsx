'use client';

import { Users, MessageSquare, TrendingUp, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface CampaignStatsProps {
  campaign: any;
  prospects: any[];
}

export default function CampaignStats({ campaign, prospects }: CampaignStatsProps) {
  // Calculate stats from prospects
  const stats = {
    total: prospects.length,
    new: prospects.filter(p => p.status === 'new').length,
    contacted: prospects.filter(p => p.status === 'contacted').length,
    responded: prospects.filter(p => p.status === 'responded').length,
    meetings: prospects.filter(p => p.status === 'meeting_booked').length,
    converted: prospects.filter(p => p.status === 'converted').length,
    notInterested: prospects.filter(p => p.status === 'not_interested').length,
  };

  const responseRate = stats.contacted > 0 
    ? ((stats.responded / stats.contacted) * 100).toFixed(1)
    : '0.0';

  const conversionRate = stats.total > 0
    ? ((stats.converted / stats.total) * 100).toFixed(1)
    : '0.0';

  const statCards = [
    {
      label: 'Total Prospects',
      value: stats.total,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Contacted',
      value: stats.contacted,
      icon: MessageSquare,
      color: 'bg-purple-500',
    },
    {
      label: 'Responded',
      value: stats.responded,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      label: 'Response Rate',
      value: `${responseRate}%`,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
    {
      label: 'Meetings Booked',
      value: stats.meetings,
      icon: Calendar,
      color: 'bg-pink-500',
    },
    {
      label: 'Converted',
      value: stats.converted,
      icon: CheckCircle,
      color: 'bg-teal-500',
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        
        return (
          <div
            key={stat.label}
            className="overflow-hidden rounded-lg bg-white shadow"
          >
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}