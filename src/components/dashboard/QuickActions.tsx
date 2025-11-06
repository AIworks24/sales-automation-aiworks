'use client';

import Link from 'next/link';
import { Plus, Upload, MessageSquare, Users } from 'lucide-react';

interface QuickActionsProps {
  role: 'admin' | 'manager' | 'rep';
}

export default function QuickActions({ role }: QuickActionsProps) {
  const actions = [
    {
      name: 'Create Campaign',
      description: 'Start a new outreach campaign',
      href: '/campaigns/new',
      icon: Plus,
      color: 'bg-blue-600 hover:bg-blue-700',
      roles: ['admin', 'manager'],
    },
    {
      name: 'Add Prospects',
      description: 'Import or add new prospects',
      href: '/prospects/new',
      icon: Users,
      color: 'bg-green-600 hover:bg-green-700',
      roles: ['admin', 'manager', 'rep'],
    },
    {
      name: 'Bulk Import',
      description: 'Upload CSV of prospects',
      href: '/prospects/import',
      icon: Upload,
      color: 'bg-purple-600 hover:bg-purple-700',
      roles: ['admin', 'manager'],
    },
    {
      name: 'Send Messages',
      description: 'Compose outreach messages',
      href: '/messages/compose',
      icon: MessageSquare,
      color: 'bg-orange-600 hover:bg-orange-700',
      roles: ['admin', 'manager', 'rep'],
    },
  ];

  const filteredActions = actions.filter((action) => action.roles.includes(role));

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredActions.map((action) => {
          const Icon = action.icon;
          
          return (
            <Link
              key={action.name}
              href={action.href}
              className={`flex flex-col items-center rounded-lg p-6 text-white transition-colors ${action.color}`}
            >
              <Icon className="h-8 w-8 mb-3" />
              <p className="font-semibold text-center">{action.name}</p>
              <p className="mt-1 text-xs text-center opacity-90">{action.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}