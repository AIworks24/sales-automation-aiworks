'use client';

import { useState } from 'react';
import { Sparkles, Send, RefreshCw, Copy, Check, Zap, X } from 'lucide-react';

interface MessagePreviewProps {
  prospectId: string;
  prospectName: string;
  onSent?: () => void;
}

export default function MessagePreview({ prospectId, prospectName, onSent }: MessagePreviewProps) {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [messageId, setMessageId] = useState('');
  const [loading, setLoading] = useState(false);
  const [improving, setImproving] = useState(false);
  const [generatingVariations, setGeneratingVariations] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const [showVariations, setShowVariations] = useState(false);

  const generateMessage = async () => {
    setLoading(true);
    setVariations([]);
    setShowVariations(false);
    
    try {
      const response = await fetch(`/api/prospects/${prospectId}/generate-message`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.data.message);
        setSubject(data.data.subject);
        setMessageId(data.data.message_id);
      } else {
        alert(data.error || 'Failed to generate message');
      }
    } catch (error) {
      alert('Failed to generate message');
    } finally {
      setLoading(false);
    }
  };

  const improveMessage = async () => {
    if (!message) return;
    
    setImproving(true);
    
    try {
      const response = await fetch('/api/ai/improve-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.data.improved_message);
      } else {
        alert(data.error || 'Failed to improve message');
      }
    } catch (error) {
      alert('Failed to improve message');
    } finally {
      setImproving(false);
    }
  };

  const generateVariations = async () => {
    if (!message) return;
    
    setGeneratingVariations(true);
    
    try {
      const response = await fetch('/api/ai/variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setVariations(data.data.variations);
        setShowVariations(true);
      } else {
        alert(data.error || 'Failed to generate variations');
      }
    } catch (error) {
      alert('Failed to generate variations');
    } finally {
      setGeneratingVariations(false);
    }
  };

  const sendMessage = async () => {
    if (!messageId) return;
    
    setSending(true);
    
    try {
      const response = await fetch(`/api/messages/${messageId}/send`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Message marked as sent!');
        onSent?.();
      } else {
        alert(data.error || 'Failed to send message');
      }
    } catch (error) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = () => {
    const fullMessage = `Subject: ${subject}\n\n${message}`;
    navigator.clipboard.writeText(fullMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const useVariation = (variation: string) => {
    setMessage(variation);
    setShowVariations(false);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          AI Message Generator for {prospectName}
        </h3>

        {!message ? (
          <button
            onClick={generateMessage}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                Generating AI Message...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate AI Message
              </>
            )}
          </button>
        ) : (
          <div className="space-y-4">
            {/* Subject Line */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Line
              </label>
              <div className="rounded-lg bg-gray-50 px-4 py-2 border border-gray-200">
                <p className="text-gray-900 font-medium">{subject}</p>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                <p className="whitespace-pre-wrap text-gray-900">{message}</p>
              </div>
            </div>

            {/* Character Count */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{message.length} characters</span>
              {message.length > 500 && (
                <span className="text-orange-600">
                  ⚠ Consider shortening (ideal: under 500 characters)
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>

              <button
                onClick={improveMessage}
                disabled={improving}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Zap className={`h-4 w-4 ${improving ? 'animate-pulse' : ''}`} />
                {improving ? 'Improving...' : 'Improve'}
              </button>

              <button
                onClick={generateVariations}
                disabled={generatingVariations}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Sparkles className={`h-4 w-4 ${generatingVariations ? 'animate-spin' : ''}`} />
                {generatingVariations ? 'Creating...' : '3 Variations'}
              </button>

              <button
                onClick={generateMessage}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Regenerate
              </button>

              <button
                onClick={sendMessage}
                disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Mark as Sent
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500">
              💡 Copy this message and send it manually via email or LinkedIn, then click "Mark as Sent" to track it.
            </p>
          </div>
        )}
      </div>

      {/* Variations Panel */}
      {showVariations && variations.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              3 Message Variations
            </h4>
            <button
              onClick={() => setShowVariations(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {variations.map((variation, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 p-4 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => useVariation(variation)}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-medium text-blue-600">
                    Variation {index + 1}
                  </span>
                  <span className="text-xs text-gray-500">
                    {variation.length} chars
                  </span>
                </div>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {variation}
                </p>
                <p className="mt-2 text-xs text-blue-600">
                  Click to use this variation →
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}