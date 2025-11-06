'use client';

interface CampaignFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

export default function CampaignFilters({ statusFilter, onStatusChange }: CampaignFiltersProps) {
  const statuses = [
    { value: 'all', label: 'All Campaigns', count: null },
    { value: 'active', label: 'Active', count: null },
    { value: 'paused', label: 'Paused', count: null },
    { value: 'draft', label: 'Draft', count: null },
    { value: 'completed', label: 'Completed', count: null },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Status:</span>
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
    </div>
  );
}