'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Send, RefreshCw, Copy, Check, Zap, X, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface MessagePreviewProps {
  prospectId: string;
  prospectName: string;
  onSent?: () => void;
}

interface SavedMessage {
  id: string;
  content: string;
  subject?: string;
  created_at: string;
  sent_at?: string;
  variations?: string[];
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
  
  // NEW: Message history
  const [messageHistory, setMessageHistory] = useState<SavedMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  // Load message history on mount
  useEffect(() => {
    loadMessageHistory();
  }, [prospectId]);

  const loadMessageHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/prospects/${prospectId}/messages`);
      const data = await response.json();
      
      if (data.success) {
        setMessageHistory(data.data);
        
        // If there's a recent unsent message, load it automatically
        const recentUnsent = data.data.find((m: SavedMessage) => !m.sent_at);
        if (recentUnsent) {
          setMessage(recentUnsent.content);
          setSubject(recentUnsent.subject || '');
          setMessageId(recentUnsent.id);
          if (recentUnsent.variations) {
            setVariations(recentUnsent.variations);
          }
        }
      }
    } catch (error) {
      console.error('Error loading message history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

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
        
        // Reload history to show new message
        await loadMessageHistory();
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
        const improvedMessage = data.data.improved_message;
        setMessage(improvedMessage);
        
        // Update the message in database
        if (messageId) {
          await fetch(`/api/messages/${messageId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: improvedMessage }),
          });
        }
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
        const newVariations = data.data.variations;
        setVariations(newVariations);
        setShowVariations(true);
        
        // Save variations to the message
        if (messageId) {
          await fetch(`/api/messages/${messageId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              variations: newVariations 
            }),
          });
          
          // Reload history
          await loadMessageHistory();
        }
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
        await loadMessageHistory();
        onSent?.();
        
        // Clear current message to start fresh
        setMessage('');
        setSubject('');
        setMessageId('');
        setVariations([]);
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
    
    // Update message in database
    if (messageId) {
      fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: variation }),
      });
    }
  };

  const loadPreviousMessage = (savedMessage: SavedMessage) => {
    setMessage(savedMessage.content);
    setSubject(savedMessage.subject || '');
    setMessageId(savedMessage.id);
    if (savedMessage.variations) {
      setVariations(savedMessage.variations);
    }
    setShowHistory(false);
  };

  return (
    <div className="space-y-4">
      {/* Message History */}
      {messageHistory.length > 0 && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <span className="font-semibold text-gray-900">
                Message History ({messageHistory.length})
              </span>
            </div>
            {showHistory ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {showHistory && (
            <div className="mt-4 space-y-3">
              {messageHistory.map((savedMsg) => (
                <div
                  key={savedMsg.id}
                  className="rounded-lg border border-gray-300 bg-white p-4 hover:border-blue-400 cursor-pointer transition-colors"
                  onClick={() => loadPreviousMessage(savedMsg)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {savedMsg.sent_at ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          ✓ Sent
                        </span>
                      ) : (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          Draft
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(savedMsg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {savedMsg.content.length} chars
                    </span>
                  </div>
                  
                  {savedMsg.subject && (
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {savedMsg.subject}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {savedMsg.content}
                  </p>
                  
                  {savedMsg.variations && savedMsg.variations.length > 0 && (
                    <div className="mt-2 text-xs text-blue-600">
                      + {savedMsg.variations.length} variations saved
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Message Generator */}
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
            {subject && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line
                </label>
                <div className="rounded-lg bg-gray-50 px-4 py-2 border border-gray-200">
                  <p className="text-gray-900 font-medium">{subject}</p>
                </div>
              </div>
            )}

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
              {message.length > 1200 && (
                <span className="text-orange-600">
                  ⚠ Consider shortening (ideal: under 1200 characters)
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
                {generatingVariations ? 'Creating...' : variations.length > 0 ? 'Regenerate Variations' : '3 Variations'}
              </button>

              <button
                onClick={generateMessage}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                New Message
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
      {variations.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              3 Message Variations (Saved)
            </h4>
            <button
              onClick={() => setShowVariations(!showVariations)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showVariations ? 'Hide' : 'Show'}
            </button>
          </div>

          {showVariations && (
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
          )}
        </div>
      )}
    </div>
  );
}