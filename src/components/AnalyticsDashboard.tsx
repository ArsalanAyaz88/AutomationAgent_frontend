'use client';

import { useState, useEffect } from 'react';
import {
  trackChannel,
  getTrackedChannels,
  getAnalyticsStatus,
  generateScriptWithAnalytics,
  generateIdeasWithAnalytics,
  generateTitlesWithAnalytics,
  generateRoadmapWithAnalytics,
  refreshChannelAnalytics,
  type TrackedChannel,
  type AnalyticsStatus,
  type UnifiedResponse,
} from '@/services/channelAnalytics';

type TabType = 'overview' | 'script' | 'ideas' | 'titles' | 'roadmap';

export default function AnalyticsDashboard() {
  // State management
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [channelUrl, setChannelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Analytics state
  const [analyticsStatus, setAnalyticsStatus] = useState<AnalyticsStatus | null>(null);
  const [trackedChannels, setTrackedChannels] = useState<TrackedChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<TrackedChannel | null>(null);
  
  // Agent responses
  const [scriptResponse, setScriptResponse] = useState<UnifiedResponse | null>(null);
  const [ideasResponse, setIdeasResponse] = useState<UnifiedResponse | null>(null);
  const [titlesResponse, setTitlesResponse] = useState<UnifiedResponse | null>(null);
  const [roadmapResponse, setRoadmapResponse] = useState<UnifiedResponse | null>(null);
  
  // Form inputs
  const [scriptTopic, setScriptTopic] = useState('');
  const [scriptWords, setScriptWords] = useState(1500);
  const [scriptTone, setScriptTone] = useState('conversational');
  const [ideasCount, setIdeasCount] = useState(5);
  const [ideasStyle, setIdeasStyle] = useState('viral');
  const [titleDescription, setTitleDescription] = useState('');
  const [titleCount, setTitleCount] = useState(5);
  const [roadmapVideos, setRoadmapVideos] = useState(30);
  const [roadmapDays, setRoadmapDays] = useState(90);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [status, channels] = await Promise.all([
        getAnalyticsStatus(),
        getTrackedChannels(),
      ]);
      setAnalyticsStatus(status);
      setTrackedChannels(channels.channels);
      if (channels.channels.length > 0) {
        setSelectedChannel(channels.channels[0]);
      }
    } catch (err: any) {
      console.error('Failed to load data:', err);
    }
  };

  // Track new channel
  const handleTrackChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await trackChannel(channelUrl);
      setSuccess(
        `✅ ${result.channel_title} tracked! (${result.subscriber_count?.toLocaleString()} subscribers)`
      );
      setChannelUrl('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to track channel');
    } finally {
      setLoading(false);
    }
  };

  // Generate script
  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setScriptResponse(null);

    try {
      const result = await generateScriptWithAnalytics(scriptTopic, {
        total_words: scriptWords,
        tone: scriptTone,
      });
      setScriptResponse(result);
      setSuccess('✅ Script generated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to generate script');
    } finally {
      setLoading(false);
    }
  };

  // Generate ideas
  const handleGenerateIdeas = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIdeasResponse(null);

    try {
      const result = await generateIdeasWithAnalytics({
        video_count: ideasCount,
        style: ideasStyle,
      });
      setIdeasResponse(result);
      setSuccess('✅ Video ideas generated!');
    } catch (err: any) {
      setError(err.message || 'Failed to generate ideas');
    } finally {
      setLoading(false);
    }
  };

  // Generate titles
  const handleGenerateTitles = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTitlesResponse(null);

    try {
      const result = await generateTitlesWithAnalytics(titleDescription, {
        title_count: titleCount,
      });
      setTitlesResponse(result);
      setSuccess('✅ Titles generated!');
    } catch (err: any) {
      setError(err.message || 'Failed to generate titles');
    } finally {
      setLoading(false);
    }
  };

  // Generate roadmap
  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRoadmapResponse(null);

    try {
      const result = await generateRoadmapWithAnalytics({
        video_count: roadmapVideos,
        timeframe_days: roadmapDays,
      });
      setRoadmapResponse(result);
      setSuccess('✅ Roadmap generated!');
    } catch (err: any) {
      setError(err.message || 'Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  // Refresh analytics
  const handleRefreshAnalytics = async () => {
    if (!selectedChannel) return;
    setLoading(true);
    try {
      await refreshChannelAnalytics(selectedChannel.channel_id);
      await loadData();
      setSuccess('✅ Analytics refreshed!');
    } catch (err: any) {
      setError(err.message || 'Failed to refresh analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Analytics-Powered AI Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Track your channel, view analytics, and get AI-powered recommendations
          </p>
        </div>

        {/* Analytics Status Banner */}
        {analyticsStatus && (
          <div
            className={`p-4 rounded-lg border-2 ${
              analyticsStatus.has_analytics
                ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700'
                : 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">
                  {analyticsStatus.has_analytics ? '✅ Analytics Active' : '⚠️ No Analytics'}
                </p>
                <p className="text-sm opacity-80">{analyticsStatus.message}</p>
                {analyticsStatus.most_recent_channel && (
                  <p className="text-sm mt-1">
                    📺 <strong>{analyticsStatus.most_recent_channel.title}</strong> (
                    {analyticsStatus.most_recent_channel.subscribers.toLocaleString()} subscribers)
                  </p>
                )}
              </div>
              {analyticsStatus.has_analytics && (
                <button
                  onClick={handleRefreshAnalytics}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  🔄 Refresh
                </button>
              )}
            </div>
          </div>
        )}

        {/* Track Channel Section */}
        {!analyticsStatus?.has_analytics && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">📊 Track Your Channel</h2>
            <form onSubmit={handleTrackChannel} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  YouTube Channel URL
                </label>
                <input
                  type="text"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  placeholder="Paste channel or video URL here..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  ✨ <strong>Supports both:</strong> Channel URLs (@MrBeast) or Video URLs (youtube.com/watch?v=...)
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
              >
                {loading ? '⏳ Tracking...' : '🚀 Track Channel'}
              </button>
            </form>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
            {success}
          </div>
        )}

        {/* Main Content - Tabs */}
        {analyticsStatus?.has_analytics && (
          <>
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'overview', icon: '📊', label: 'Overview' },
                  { id: 'script', icon: '📝', label: 'Script Generator' },
                  { id: 'ideas', icon: '💡', label: 'Video Ideas' },
                  { id: 'titles', icon: '📌', label: 'Title Generator' },
                  { id: 'roadmap', icon: '🗺️', label: 'Content Roadmap' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex-1 min-w-[140px] px-4 py-3 rounded-lg font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">📊 Channel Overview</h2>
                  
                  {trackedChannels.length > 0 && (
                    <div className="grid gap-4">
                      {trackedChannels.map((channel) => (
                        <div
                          key={channel._id}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <img
                              src={channel.thumbnail}
                              alt={channel.channel_title}
                              className="w-20 h-20 rounded-full"
                            />
                            <div>
                              <h3 className="font-bold text-xl">{channel.channel_title}</h3>
                              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <p>👥 {channel.subscriber_count.toLocaleString()} subscribers</p>
                                <p>📹 {channel.video_count} videos</p>
                                <p>👁️ {channel.view_count.toLocaleString()} total views</p>
                                <p className="text-xs">
                                  Last accessed: {new Date(channel.last_accessed).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => setSelectedChannel(channel)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                              Select
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedChannel && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                      <h3 className="text-xl font-bold mb-4">✅ Active Channel</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-3xl font-bold">{selectedChannel.subscriber_count.toLocaleString()}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Subscribers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold">{selectedChannel.video_count}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Videos</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold">{(selectedChannel.view_count / 1000000).toFixed(1)}M</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold">✅</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">AI Ready</p>
                        </div>
                      </div>
                      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        All agents will use analytics from <strong>{selectedChannel.channel_title}</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Script Generator Tab */}
              {activeTab === 'script' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">📝 Script Generator</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Generate scripts optimized for YOUR channel's style and audience
                  </p>

                  <form onSubmit={handleGenerateScript} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Video Topic</label>
                      <input
                        type="text"
                        value={scriptTopic}
                        onChange={(e) => setScriptTopic(e.target.value)}
                        placeholder="e.g., Best Budget Tech 2024"
                        className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Word Count</label>
                        <input
                          type="number"
                          value={scriptWords}
                          onChange={(e) => setScriptWords(Number(e.target.value))}
                          className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Tone</label>
                        <select
                          value={scriptTone}
                          onChange={(e) => setScriptTone(e.target.value)}
                          className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700"
                        >
                          <option value="conversational">Conversational</option>
                          <option value="professional">Professional</option>
                          <option value="energetic">Energetic</option>
                          <option value="casual">Casual</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
                    >
                      {loading ? '⏳ Generating...' : '✨ Generate Script'}
                    </button>
                  </form>

                  {scriptResponse && (
                    <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      {scriptResponse.analytics_used && scriptResponse.channel_info && (
                        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="font-semibold">✅ Analytics Applied</p>
                          <p className="text-sm">
                            Optimized for <strong>{scriptResponse.channel_info.channel_title}</strong>
                          </p>
                        </div>
                      )}
                      <pre className="whitespace-pre-wrap font-sans text-sm">{scriptResponse.result}</pre>
                    </div>
                  )}
                </div>
              )}

              {/* Video Ideas Tab */}
              {activeTab === 'ideas' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">💡 Video Ideas</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get video ideas based on YOUR channel's proven success patterns
                  </p>

                  <form onSubmit={handleGenerateIdeas} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Number of Ideas</label>
                        <input
                          type="number"
                          value={ideasCount}
                          onChange={(e) => setIdeasCount(Number(e.target.value))}
                          min="1"
                          max="10"
                          className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Style</label>
                        <select
                          value={ideasStyle}
                          onChange={(e) => setIdeasStyle(e.target.value)}
                          className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700"
                        >
                          <option value="viral">Viral</option>
                          <option value="educational">Educational</option>
                          <option value="entertaining">Entertaining</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
                    >
                      {loading ? '⏳ Generating...' : '💡 Generate Ideas'}
                    </button>
                  </form>

                  {ideasResponse && (
                    <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      {ideasResponse.analytics_used && ideasResponse.channel_info && (
                        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="font-semibold">✅ Analytics Applied</p>
                          <p className="text-sm">
                            Ideas based on <strong>{ideasResponse.channel_info.channel_title}</strong>'s top performers
                          </p>
                        </div>
                      )}
                      <pre className="whitespace-pre-wrap font-sans text-sm">{ideasResponse.result}</pre>
                    </div>
                  )}
                </div>
              )}

              {/* Titles Tab */}
              {activeTab === 'titles' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">📌 Title Generator</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Generate titles matching YOUR channel's successful patterns
                  </p>

                  <form onSubmit={handleGenerateTitles} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Video Description</label>
                      <textarea
                        value={titleDescription}
                        onChange={(e) => setTitleDescription(e.target.value)}
                        placeholder="Describe your video content..."
                        rows={4}
                        className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Number of Titles</label>
                      <input
                        type="number"
                        value={titleCount}
                        onChange={(e) => setTitleCount(Number(e.target.value))}
                        min="1"
                        max="10"
                        className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
                    >
                      {loading ? '⏳ Generating...' : '📌 Generate Titles'}
                    </button>
                  </form>

                  {titlesResponse && (
                    <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      {titlesResponse.analytics_used && titlesResponse.channel_info && (
                        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="font-semibold">✅ Analytics Applied</p>
                          <p className="text-sm">
                            Titles optimized for <strong>{titlesResponse.channel_info.channel_title}</strong>
                          </p>
                        </div>
                      )}
                      <pre className="whitespace-pre-wrap font-sans text-sm">{titlesResponse.result}</pre>
                    </div>
                  )}
                </div>
              )}

              {/* Roadmap Tab */}
              {activeTab === 'roadmap' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">🗺️ Content Roadmap</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create a strategic roadmap based on YOUR channel's strengths
                  </p>

                  <form onSubmit={handleGenerateRoadmap} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Number of Videos</label>
                        <input
                          type="number"
                          value={roadmapVideos}
                          onChange={(e) => setRoadmapVideos(Number(e.target.value))}
                          min="10"
                          max="100"
                          className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Timeframe (Days)</label>
                        <input
                          type="number"
                          value={roadmapDays}
                          onChange={(e) => setRoadmapDays(Number(e.target.value))}
                          min="30"
                          max="365"
                          className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
                    >
                      {loading ? '⏳ Generating...' : '🗺️ Generate Roadmap'}
                    </button>
                  </form>

                  {roadmapResponse && (
                    <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      {roadmapResponse.analytics_used && roadmapResponse.channel_info && (
                        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="font-semibold">✅ Analytics Applied</p>
                          <p className="text-sm">
                            Roadmap tailored for <strong>{roadmapResponse.channel_info.channel_title}</strong>
                          </p>
                        </div>
                      )}
                      <pre className="whitespace-pre-wrap font-sans text-sm">{roadmapResponse.result}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
