'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Target, 
  Calendar,
  CheckCircle,
  Building,
  Briefcase,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
        setRole(data.role);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async () => {
    if (!analytics || role === 'rep') return;
    
    setInsightsLoading(true);
    try {
      const response = await fetch('/api/analytics/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyticsData: analytics }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAiInsights(data.data.insights);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
          <p className="mt-4 text-gray-600">Failed to load analytics</p>
        </div>
      </div>
    );
  }

  // REP VIEW: Message-focused analytics
  if (role === 'rep') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Performance</h1>
          <p className="mt-2 text-gray-600">Track your messaging activity and results</p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="My Prospects"
            value={analytics.overview.total_prospects}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Messages Sent"
            value={analytics.overview.messages_sent}
            icon={MessageSquare}
            color="bg-purple-500"
          />
          <StatCard
            title="Responses"
            value={analytics.overview.responses_received}
            icon={TrendingUp}
            color="bg-green-500"
          />
          <StatCard
            title="Open Rate"
            value={`${analytics.overview.open_rate}%`}
            icon={Target}
            color="bg-orange-500"
          />
          <StatCard
            title="Response Rate"
            value={`${analytics.overview.response_rate}%`}
            icon={CheckCircle}
            color="bg-teal-500"
          />
          <StatCard
            title="Meetings Booked"
            value={analytics.overview.meetings_booked}
            icon={Calendar}
            color="bg-pink-500"
          />
        </div>

        {/* Message Performance */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Message Performance</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Messages Opened</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analytics.message_performance.opened} / {analytics.message_performance.sent}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {analytics.message_performance.open_rate}% open rate
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Messages Replied</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analytics.message_performance.replied} / {analytics.message_performance.sent}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {analytics.message_performance.reply_rate}% reply rate
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Messages</h2>
          {analytics.recent_activity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No messages sent yet</p>
          ) : (
            <div className="space-y-3">
              {analytics.recent_activity.map((msg: any) => (
                <div key={msg.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{msg.prospect?.full_name}</p>
                      <p className="text-sm text-gray-600">{msg.prospect?.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(msg.sent_at).toLocaleDateString()}
                      </p>
                      {msg.replied_at && (
                        <span className="inline-block mt-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                          ✓ Replied
                        </span>
                      )}
                      {msg.opened_at && !msg.replied_at && (
                        <span className="inline-block mt-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                          Opened
                        </span>
                      )}
                      {!msg.opened_at && (
                        <span className="inline-block mt-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                          Sent
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // MANAGER/ADMIN VIEW: Full analytics dashboard
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">Company-wide performance insights</p>
        </div>
        <button
          onClick={generateAIInsights}
          disabled={insightsLoading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {insightsLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              AI Insights
            </>
          )}
        </button>
      </div>

      {/* AI Insights Panel */}
      {aiInsights && (
        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">AI-Powered Insights</h2>
          </div>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-800">{aiInsights}</div>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Prospects"
          value={analytics.overview.total_prospects}
          icon={Users}
          color="bg-blue-500"
          subtitle={`${analytics.overview.companies_contacted} companies`}
        />
        <StatCard
          title="Active Campaigns"
          value={analytics.overview.active_campaigns}
          icon={Target}
          color="bg-purple-500"
          subtitle={`${analytics.overview.total_campaigns} total`}
        />
        <StatCard
          title="Messages Sent"
          value={analytics.overview.messages_sent}
          icon={MessageSquare}
          color="bg-green-500"
          subtitle={`${analytics.overview.open_rate}% opened`}
        />
        <StatCard
          title="Responses"
          value={analytics.overview.responses_received}
          icon={TrendingUp}
          color="bg-orange-500"
          subtitle={`${analytics.overview.response_rate}% rate`}
        />
        <StatCard
          title="Meetings Booked"
          value={analytics.overview.meetings_booked}
          icon={Calendar}
          color="bg-pink-500"
        />
        <StatCard
          title="Conversions"
          value={analytics.overview.conversions}
          icon={CheckCircle}
          color="bg-teal-500"
          subtitle={`${analytics.overview.conversion_rate}% rate`}
        />
        <StatCard
          title="Companies"
          value={analytics.overview.companies_contacted}
          icon={Building}
          color="bg-indigo-500"
        />
        <StatCard
          title="Industries"
          value={analytics.overview.industries_targeted}
          icon={Briefcase}
          color="bg-cyan-500"
        />
      </div>

      {/* Top Campaigns */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Performing Campaigns</h2>
        {analytics.top_campaigns.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No campaign data yet</p>
        ) : (
          <div className="space-y-3">
            {analytics.top_campaigns.map((campaign: any, index: number) => (
              <div key={campaign.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{campaign.name}</p>
                    <p className="text-sm text-gray-600">
                      {campaign.total_prospects} prospects · {campaign.messages_sent} messages sent
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{campaign.response_rate}%</p>
                  <p className="text-xs text-gray-500">response rate</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Performance */}
      {analytics.team_performance && analytics.team_performance.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rep</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prospects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Messages</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {analytics.team_performance.map((member: any) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {member.prospects_assigned}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {member.messages_sent}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {member.contacted}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {member.responses}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                        member.response_rate >= 30 ? 'bg-green-100 text-green-700' :
                        member.response_rate >= 15 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {member.response_rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, subtitle }: any) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}