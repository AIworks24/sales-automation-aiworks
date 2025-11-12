'use client';

import { useState } from 'react';
import { Sparkles, Send, RefreshCw, Copy, Check } from 'lucide-react';

interface MessagePreviewProps {
  prospectId: string;
  prospectName: string;
  onSent?: () => void;
}

export default function MessagePreview({ prospectId, prospectName, onSent }: MessagePreviewProps) {
  const [message, setMessage] = useState('');
  const [messageId, setMessageId] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateMessage = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/prospects/${prospectId}/generate-message`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.data.message);
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
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        AI Message for {prospectName}
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
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate Message
            </>
          )}
        </button>
      ) : (
        <div className="space-y-4">
          {/* Message Preview */}
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="whitespace-pre-wrap text-gray-900">{message}</p>
          </div>

          {/* Character Count */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{message.length} characters</span>
            {message.length > 300 && (
              <span className="text-orange-600">
                ⚠ Over 300 characters (recommended for connection requests)
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
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
            💡 Copy this message and send it manually on LinkedIn, then click "Mark as Sent" to track it.
          </p>
        </div>
      )}
    </div>
  );
}