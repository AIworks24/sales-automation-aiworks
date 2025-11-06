'use client';

import { Users, Target, MessageSquare, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

interface StatsCardsProps {
  stats: any;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Prospects',
      value: stats?.total_prospects || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: stats?.prospects_change,
    },
    {
      title: 'Active Campaigns',
      value: stats?.active_campaigns || 0,
      icon: Target,
      color: 'bg-purple-500',
      change: stats?.campaigns_change,
    },
    {
      title: 'Messages Sent',
      value: stats?.messages_sent_today || 0,
      icon: MessageSquare,
      color: 'bg-green-500',
      subtitle: 'Today',
    },
    {
      title: 'Response Rate',
      value: stats?.response_rate ? `${stats.response_rate}%` : '0%',
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: stats?.response_rate_change,
    },
    {
      title: 'Meetings Booked',
      value: stats?.meetings_booked || 0,
      icon: Calendar,
      color: 'bg-pink-500',
      subtitle: 'This week',
    },
    {
      title: 'Conversions',
      value: stats?.conversions || 0,
      icon: CheckCircle,
      color: 'bg-teal-500',
      change: stats?.conversions_change,
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        
        return (
          <div
            key={card.title}
            className="overflow-hidden rounded-lg bg-white shadow hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                  
                  {card.subtitle && (
                    <p className="mt-1 text-xs text-gray-500">{card.subtitle}</p>
                  )}
                  
                  {card.change !== undefined && (
                    <p
                      className={`mt-2 text-sm font-medium ${
                        card.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {card.change >= 0 ? '+' : ''}
                      {card.change}% from last week
                    </p>
                  )}
                </div>
                
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color}`}>
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