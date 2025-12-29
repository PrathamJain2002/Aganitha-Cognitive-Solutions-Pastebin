'use client';

import { useState } from 'react';

export default function Home() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pasteUrl, setPasteUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPasteUrl('');

    try {
      const body: {
        content: string;
        ttl_seconds?: number;
        max_views?: number;
      } = {
        content,
      };

      if (ttlSeconds) {
        const ttl = parseInt(ttlSeconds, 10);
        if (isNaN(ttl) || ttl < 1) {
          setError('TTL must be an integer >= 1');
          setLoading(false);
          return;
        }
        body.ttl_seconds = ttl;
      }

      if (maxViews) {
        const views = parseInt(maxViews, 10);
        if (isNaN(views) || views < 1) {
          setError('Max views must be an integer >= 1');
          setLoading(false);
          return;
        }
        body.max_views = views;
      }

      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create paste');
        setLoading(false);
        return;
      }

      setPasteUrl(data.url);
      setContent('');
      setTtlSeconds('');
      setMaxViews('');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (pasteUrl) {
      navigator.clipboard.writeText(pasteUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Pastebin-Lite
          </h1>
          <p className="text-gray-600 mb-6">
            Create a text paste and share it with a link
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {pasteUrl && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium mb-2">
                Paste created successfully!
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={pasteUrl}
                  className="flex-1 px-3 py-2 border border-green-300 rounded bg-white text-gray-900"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Enter your paste content here..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="ttl"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Time to Live (seconds)
                </label>
                <input
                  type="number"
                  id="ttl"
                  value={ttlSeconds}
                  onChange={(e) => setTtlSeconds(e.target.value)}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Paste will expire after this many seconds
                </p>
              </div>

              <div>
                <label
                  htmlFor="maxViews"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Max Views
                </label>
                <input
                  type="number"
                  id="maxViews"
                  value={maxViews}
                  onChange={(e) => setMaxViews(e.target.value)}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Paste will expire after this many views
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Creating...' : 'Create Paste'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
