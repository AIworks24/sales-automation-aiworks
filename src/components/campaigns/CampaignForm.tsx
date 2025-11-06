'use client';

import { useState } from 'react';
import { Sparkles, Save, Rocket } from 'lucide-react';

interface CampaignFormProps {
  initialData?: any;
  onSubmit: (data: any, saveAsDraft?: boolean) => Promise<void>;
  loading?: boolean;
}

export default function CampaignForm({ initialData, onSubmit, loading }: CampaignFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    message_template: initialData?.message_template || '',
    ai_personalization_enabled: initialData?.ai_personalization_enabled ?? true,
    daily_contact_limit: initialData?.daily_contact_limit || 20,
    target_criteria: initialData?.target_criteria || {
      titles: [],
      industries: [],
      locations: [],
      keywords: [],
    },
  });

  const [titleInput, setTitleInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayAdd = (field: keyof typeof formData.target_criteria, value: string, inputSetter: Function) => {
    if (!value.trim()) return;
    
    const currentArray = formData.target_criteria[field] || [];
    if (!currentArray.includes(value.trim())) {
      setFormData((prev) => ({
        ...prev,
        target_criteria: {
          ...prev.target_criteria,
          [field]: [...currentArray, value.trim()],
        },
      }));
    }
    inputSetter('');
  };

  const handleArrayRemove = (field: keyof typeof formData.target_criteria, value: string) => {
    setFormData((prev) => ({
      ...prev,
      target_criteria: {
        ...prev.target_criteria,
        [field]: prev.target_criteria[field].filter((item: string) => item !== value),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
    e.preventDefault();
    await onSubmit(formData, saveAsDraft);
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Campaign Name *
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Q1 2025 SaaS Founders Outreach"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Target SaaS founders in the US for our new AI tool..."
          />
        </div>
      </div>

      {/* Target Criteria */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Target Criteria</h2>
        <p className="text-sm text-gray-600">
          Define who you want to reach with this campaign
        </p>

        {/* Job Titles */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Job Titles
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleArrayAdd('titles', titleInput, setTitleInput);
                }
              }}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="CEO, Founder, VP of Sales..."
            />
            <button
              type="button"
              onClick={() => handleArrayAdd('titles', titleInput, setTitleInput)}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.target_criteria.titles.map((title: string) => (
              <span
                key={title}
                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
              >
                {title}
                <button
                  type="button"
                  onClick={() => handleArrayRemove('titles', title)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Industries */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Industries
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={industryInput}
              onChange={(e) => setIndustryInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleArrayAdd('industries', industryInput, setIndustryInput);
                }
              }}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="SaaS, Technology, Marketing..."
            />
            <button
              type="button"
              onClick={() => handleArrayAdd('industries', industryInput, setIndustryInput)}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.target_criteria.industries.map((industry: string) => (
              <span
                key={industry}
                className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
              >
                {industry}
                <button
                  type="button"
                  onClick={() => handleArrayRemove('industries', industry)}
                  className="text-green-500 hover:text-green-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Locations
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleArrayAdd('locations', locationInput, setLocationInput);
                }
              }}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="San Francisco, New York, Remote..."
            />
            <button
              type="button"
              onClick={() => handleArrayAdd('locations', locationInput, setLocationInput)}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.target_criteria.locations.map((location: string) => (
              <span
                key={location}
                className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700"
              >
                {location}
                <button
                  type="button"
                  onClick={() => handleArrayRemove('locations', location)}
                  className="text-purple-500 hover:text-purple-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Message Template */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Message Template</h2>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ai_personalization"
              checked={formData.ai_personalization_enabled}
              onChange={(e) => handleChange('ai_personalization_enabled', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="ai_personalization" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Sparkles className="h-4 w-4 text-blue-600" />
              AI Personalization
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="message_template" className="block text-sm font-medium text-gray-700">
            Message Template *
          </label>
          <textarea
            id="message_template"
            required
            value={formData.message_template}
            onChange={(e) => handleChange('message_template', e.target.value)}
            rows={6}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Hi {{first_name}},

I noticed you're a {{title}} at {{company}}. I wanted to reach out because...

Would you be open to a quick chat?"
          />
          <p className="mt-2 text-xs text-gray-500">
            Use variables: {'{'}{'first_name}'},  {'{'}{'last_name}'},  {'{'}{'title}'},  {'{'}{'company}'}
            {formData.ai_personalization_enabled && ' • AI will personalize each message based on prospect data'}
          </p>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Campaign Settings</h2>

        <div>
          <label htmlFor="daily_limit" className="block text-sm font-medium text-gray-700">
            Daily Contact Limit
          </label>
          <input
            id="daily_limit"
            type="number"
            min="1"
            max="100"
            value={formData.daily_contact_limit}
            onChange={(e) => handleChange('daily_contact_limit', parseInt(e.target.value))}
            className="mt-1 block w-32 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Maximum prospects to contact per day (recommended: 20-50 to stay LinkedIn-safe)
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 border-t pt-6">
        <button
          type="button"
          onClick={(e) => handleSubmit(e as any, true)}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          Save as Draft
        </button>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating...
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4" />
              Create & Activate
            </>
          )}
        </button>
      </div>
    </form>
  );
}