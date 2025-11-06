'use client';

import { useState } from 'react';
import {
  trackChannel,
  generateVideoIdeas,
  getTrackedChannels,
  type VideoIdea,
  type TrackedChannel,
} from '@/services/channelAnalytics';

export default function ChannelAnalytics() {
  const [channelUrl, setChannelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [videoIdeas, setVideoIdeas] = useState<VideoIdea | null>(null);
  const [trackedChannels, setTrackedChannels] = useState<TrackedChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('');

  // Handle channel submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setVideoIdeas(null);

    try {
      // Track the channel
      const trackResult = await trackChannel(channelUrl, 'default');
      setSuccess(
        `✅ ${trackResult.channel_title} tracked successfully! (${trackResult.subscriber_count?.toLocaleString()} subscribers)`
      );

      // Generate video ideas
      const ideas = await generateVideoIdeas(trackResult.channel_id, 'default');
      setVideoIdeas(ideas);

      // Refresh tracked channels list
      const channels = await getTrackedChannels('default');
      setTrackedChannels(channels.channels);

      // Clear input
      setChannelUrl('');
    } catch (err: any) {
      setError(err.message || 'Failed to process channel');
    } finally {
      setLoading(false);
    }
  };

  // Generate ideas for existing channel
  const handleGenerateForExisting = async (channelId: string) => {
    setLoading(true);
    setError('');
    setVideoIdeas(null);

    try {
      const ideas = await generateVideoIdeas(channelId, 'default');
      setVideoIdeas(ideas);
      setSuccess(`✅ Generated new ideas for ${ideas.channel_title}`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate ideas');
    } finally {
      setLoading(false);
    }
  };

  // Load tracked channels on mount
  const loadTrackedChannels = async () => {
    try {
      const channels = await getTrackedChannels('default');
      setTrackedChannels(channels.channels);
    } catch (err: any) {
      console.error('Failed to load channels:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
          YouTube Channel Analytics & Video Ideas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your channel, analyze performance, and get AI-powered video
          ideas
        </p>
      </div>

      {/* Channel Input Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Add Your Channel</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="channelUrl"
              className="block text-sm font-medium mb-2"
            >
              YouTube Channel URL
            </label>
            <input
              type="text"
              id="channelUrl"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              placeholder="Paste channel or video URL here..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              ✨ <strong>New:</strong> Paste any YouTube link - channel page or video URL works!
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing...
              </span>
            ) : (
              '🚀 Track & Generate Ideas'
            )}
          </button>
        </form>

        {/* Messages */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
            {success}
          </div>
        )}
      </div>

      {/* Video Ideas Display */}
      {videoIdeas && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">📹 AI-Generated Video Ideas</h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(videoIdeas.generated_at).toLocaleString()}
            </span>
          </div>

          {/* Channel Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Subscribers
              </p>
              <p className="text-2xl font-bold">
                {videoIdeas.analytics.subscribers.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avg Views
              </p>
              <p className="text-2xl font-bold">
                {Math.round(videoIdeas.analytics.avg_views).toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Engagement
              </p>
              <p className="text-2xl font-bold">
                {(videoIdeas.analytics.avg_engagement * 100).toFixed(2)}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Videos
              </p>
              <p className="text-2xl font-bold">
                {videoIdeas.analytics.video_count}
              </p>
            </div>
          </div>

          {/* AI Ideas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">
              💡 Recommended Videos for {videoIdeas.channel_title}
            </h3>
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {videoIdeas.video_ideas}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tracked Channels List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">📊 Tracked Channels</h2>
          <button
            onClick={loadTrackedChannels}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {trackedChannels.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No channels tracked yet. Add one above!
          </p>
        ) : (
          <div className="grid gap-4">
            {trackedChannels.map((channel) => (
              <div
                key={channel._id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-300 dark:hover:border-red-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={channel.thumbnail}
                    alt={channel.channel_title}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">
                      {channel.channel_title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {channel.subscriber_count.toLocaleString()} subscribers •{' '}
                      {channel.video_count} videos
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleGenerateForExisting(channel.channel_id)}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 disabled:opacity-50 transition-all"
                >
                  💡 Get Ideas
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
