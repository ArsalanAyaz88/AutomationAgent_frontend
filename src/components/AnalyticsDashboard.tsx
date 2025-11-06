'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { jsPDF } from 'jspdf';
import { Copy, Download, Check } from 'lucide-react';
import {
  trackChannel,
  getTrackedChannels,
  getAnalyticsStatus,
  generateScriptWithAnalytics,
  generateIdeasWithAnalytics,
  generateTitlesWithAnalytics,
  generateRoadmapWithAnalytics,
  refreshChannelAnalytics,
  deleteChannel,
  type TrackedChannel,
  type AnalyticsStatus,
  type UnifiedResponse,
} from '@/services/channelAnalytics';

type TabType = 'overview' | 'channels' | 'ideas' | 'titles' | 'script' | 'roadmap';

export default function AnalyticsDashboard() {
  // State management
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== 'undefined') {
      // Restore saved tab from localStorage, default to 'channels' for first visit
      const savedTab = window.localStorage.getItem('activeTab');
      if (savedTab && ['overview', 'channels', 'ideas', 'titles', 'script', 'roadmap'].includes(savedTab)) {
        return savedTab as TabType;
      }
    }
    return 'channels';
  });
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
  const [scriptAudience, setScriptAudience] = useState('general');
  const [scriptDuration, setScriptDuration] = useState<number | undefined>(undefined);
  const [scriptHook, setScriptHook] = useState(true);
  const [scriptCta, setScriptCta] = useState(true);
  const [scriptStructure, setScriptStructure] = useState('standard');
  const [scriptInstructions, setScriptInstructions] = useState('');
  const [ideasCount, setIdeasCount] = useState(5);
  const [ideasStyle, setIdeasStyle] = useState('viral');
  const [titleDescription, setTitleDescription] = useState('');
  const [titleCount, setTitleCount] = useState(5);
  const [roadmapVideos, setRoadmapVideos] = useState(30);
  const [roadmapDays, setRoadmapDays] = useState(90);

  // Copy/Download state
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedIdeas, setCopiedIdeas] = useState(false);
  const [copiedTitles, setCopiedTitles] = useState(false);
  const [copiedRoadmap, setCopiedRoadmap] = useState(false);

  // Channels management state
  const [editingChannel, setEditingChannel] = useState<TrackedChannel | null>(null);
  const [showChannelForm, setShowChannelForm] = useState(false);
  const [newChannelUrl, setNewChannelUrl] = useState('');
  const [newChannelNote, setNewChannelNote] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<TrackedChannel | null>(null);

  // Strip markdown formatting to get clean plain text
  const stripMarkdown = (text: string): string => {
    let cleanText = text;
    
    // Remove bold (**text** or __text__)
    cleanText = cleanText.replace(/\*\*(.+?)\*\*/g, '$1');
    cleanText = cleanText.replace(/__(.+?)__/g, '$1');
    
    // Remove italic (*text* or _text_)
    cleanText = cleanText.replace(/\*(.+?)\*/g, '$1');
    cleanText = cleanText.replace(/_(.+?)_/g, '$1');
    
    // Remove strikethrough (~~text~~)
    cleanText = cleanText.replace(/~~(.+?)~~/g, '$1');
    
    // Remove headings (# ## ### etc)
    cleanText = cleanText.replace(/^#{1,6}\s+/gm, '');
    
    // Remove horizontal rules (--- or ***)
    cleanText = cleanText.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, '');
    
    // Remove links but keep text [text](url)
    cleanText = cleanText.replace(/\[(.+?)\]\(.+?\)/g, '$1');
    
    // Remove images ![alt](url)
    cleanText = cleanText.replace(/!\[.+?\]\(.+?\)/g, '');
    
    // Remove inline code (`code`)
    cleanText = cleanText.replace(/`(.+?)`/g, '$1');
    
    // Remove code blocks (```code```)
    cleanText = cleanText.replace(/```[\s\S]*?```/g, '');
    
    // Remove blockquotes (> text)
    cleanText = cleanText.replace(/^>\s+/gm, '');
    
    // Clean up list markers (-, *, +)
    cleanText = cleanText.replace(/^[\s]*[-*+]\s+/gm, '• ');
    
    // Clean up numbered lists (1. text)
    cleanText = cleanText.replace(/^[\s]*\d+\.\s+/gm, '');
    
    // Remove HTML tags
    cleanText = cleanText.replace(/<[^>]*>/g, '');
    
    // Clean up extra whitespace
    cleanText = cleanText.replace(/\n{3,}/g, '\n\n');
    
    return cleanText.trim();
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string, setCopied: (val: boolean) => void) => {
    try {
      const cleanText = stripMarkdown(text);
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Download as PDF function
  const downloadAsPDF = (content: string, filename: string) => {
    try {
      const cleanContent = stripMarkdown(content);
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      
      // Title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(filename, margin, margin);
      
      // Content
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Split content into lines
      const lines = doc.splitTextToSize(cleanContent, maxWidth);
      let y = margin + 10;
      
      lines.forEach((line: string) => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 7;
      });
      
      doc.save(`${filename}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    }
  };

  // Save active tab to localStorage whenever it changes (browser only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('activeTab', activeTab);
    }
  }, [activeTab]);

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
      
      // Try to restore selected channel from localStorage (browser only)
      const savedChannelId = typeof window !== 'undefined'
        ? window.localStorage.getItem('selectedChannelId')
        : null;
      let channelToSelect = null;
      
      if (savedChannelId && channels.channels.length > 0) {
        // Find the saved channel
        channelToSelect = channels.channels.find(c => c._id === savedChannelId);
      }
      
      // If not found or no saved channel, use first one
      if (!channelToSelect && channels.channels.length > 0) {
        channelToSelect = channels.channels[0];
      }
      
      if (channelToSelect) {
        setSelectedChannel(channelToSelect);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('selectedChannelId', channelToSelect._id);
        }
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

  // Add new channel from Channels tab
  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await trackChannel(newChannelUrl);
      setSuccess(
        `✅ ${result.channel_title} added! (${result.subscriber_count?.toLocaleString()} subscribers)`
      );
      setNewChannelUrl('');
      setNewChannelNote('');
      setShowChannelForm(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to add channel');
    } finally {
      setLoading(false);
    }
  };

  // Select a channel as active
  const handleSelectChannel = (channel: TrackedChannel) => {
    setSelectedChannel(channel);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('selectedChannelId', channel._id);
    }
    setSuccess(`✅ Now using: ${channel.channel_title}`);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Show delete confirmation modal
  const handleDeleteChannel = (channel: TrackedChannel) => {
    setChannelToDelete(channel);
    setShowDeleteConfirm(true);
  };

  // Confirm and delete channel
  const confirmDelete = async () => {
    if (!channelToDelete) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    setShowDeleteConfirm(false);
    
    try {
      await deleteChannel(channelToDelete._id);
      setSuccess('✅ Channel removed successfully');
      
      // If deleted channel was selected, select first remaining channel
      if (selectedChannel?._id === channelToDelete._id) {
        const remaining = trackedChannels.filter(c => c._id !== channelToDelete._id);
        const newSelected = remaining.length > 0 ? remaining[0] : null;
        setSelectedChannel(newSelected);
        
        // Update localStorage
        if (typeof window !== 'undefined') {
          if (newSelected) {
            window.localStorage.setItem('selectedChannelId', newSelected._id);
          } else {
            window.localStorage.removeItem('selectedChannelId');
          }
        }
      }
      
      // Reload channels list
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete channel');
    } finally {
      setLoading(false);
      setChannelToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setChannelToDelete(null);
  };

  // Refresh channel analytics
  const handleRefreshChannel = async (channelId: string) => {
    setLoading(true);
    try {
      await refreshChannelAnalytics(channelId);
      await loadData();
      setSuccess('✅ Channel data refreshed');
    } catch (err: any) {
      setError(err.message || 'Failed to refresh channel');
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
        target_audience: scriptAudience,
        video_duration: scriptDuration,
        include_hook: scriptHook,
        include_cta: scriptCta,
        script_structure: scriptStructure,
        additional_instructions: scriptInstructions || undefined,
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
                  { id: 'channels', icon: '📺', label: 'Channels' },
                  { id: 'overview', icon: '📊', label: 'Overview' },
                  
                  { id: 'ideas', icon: '💡', label: 'Video Ideas' },
                  { id: 'titles', icon: '📌', label: 'Title Generator' },
                  { id: 'script', icon: '📝', label: 'Script Generator' },
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
                  
                  {selectedChannel ? (
                    <div className="space-y-6">
                      {/* Selected Channel Card */}
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                        <div className="flex items-center space-x-6 mb-6">
                          <img
                            src={selectedChannel.thumbnail}
                            alt={selectedChannel.channel_title}
                            className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-3xl font-bold">{selectedChannel.channel_title}</h3>
                              <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                                ✓ ACTIVE
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                              All analytics-aware agents are using this channel's data
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              🆔 Channel ID: {selectedChannel.channel_id}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              📅 Last updated: {new Date(selectedChannel.last_accessed).toLocaleDateString()} at{' '}
                              {new Date(selectedChannel.last_accessed).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>

                        {/* Statistics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                              {selectedChannel.subscriber_count.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Subscribers</p>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                              {selectedChannel.video_count}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Videos</p>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                              {(selectedChannel.view_count / 1000000).toFixed(1)}M
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Total Views</p>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <p className="text-4xl font-bold text-green-600 dark:text-green-400">✅</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">AI Ready</p>
                          </div>
                        </div>

                        {/* Top Videos Preview */}
                        {selectedChannel.top_videos && selectedChannel.top_videos.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-blue-200 dark:border-blue-800">
                            <h4 className="font-semibold mb-4 text-lg">🔥 Top Performing Videos:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {selectedChannel.top_videos.slice(0, 4).map((video: any, idx: number) => (
                                <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                                  <p className="font-semibold mb-1 line-clamp-2">{video.title}</p>
                                  <p className="text-sm text-gray-500">
                                    👁️ {(video.view_count || 0).toLocaleString()} views
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info Box */}
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-center text-gray-700 dark:text-gray-300">
                          💡 To manage multiple channels or switch to a different channel, go to the <strong>Channels</strong> tab
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                        📺 No channel selected
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm">
                        Go to the <strong>Channels</strong> tab to select or add a channel
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Channels Tab */}
              {activeTab === 'channels' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">📺 Manage Channels</h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Add, manage, and switch between your tracked YouTube channels
                      </p>
                    </div>
                    <button
                      onClick={() => setShowChannelForm(!showChannelForm)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 font-semibold"
                    >
                      {showChannelForm ? '✕ Cancel' : '+ Add Channel'}
                    </button>
                  </div>

                  {/* Add Channel Form */}
                  {showChannelForm && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                      <h3 className="text-xl font-bold mb-4">Add New Channel</h3>
                      <form onSubmit={handleAddChannel} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            YouTube Channel URL
                          </label>
                          <input
                            type="text"
                            value={newChannelUrl}
                            onChange={(e) => setNewChannelUrl(e.target.value)}
                            placeholder="https://youtube.com/@channel or video URL"
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                            required
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Enter channel URL, video URL, or @handle
                          </p>
                        </div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
                        >
                          {loading ? '⏳ Adding...' : '✨ Add Channel'}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Channels List */}
                  {trackedChannels.length > 0 ? (
                    <div className="grid gap-4">
                      {trackedChannels.map((channel) => (
                        <div
                          key={channel._id}
                          className={`p-6 border-2 rounded-lg transition-all ${
                            selectedChannel?._id === channel._id
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            {/* Channel Info */}
                            <div className="flex items-start space-x-4">
                              <img
                                src={channel.thumbnail}
                                alt={channel.channel_title}
                                className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-bold text-2xl">{channel.channel_title}</h3>
                                  {selectedChannel?._id === channel._id && (
                                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                                      ✓ ACTIVE
                                    </span>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                  <div>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                      {channel.subscriber_count.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Subscribers</p>
                                  </div>
                                  <div>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                      {channel.video_count}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Videos</p>
                                  </div>
                                  <div>
                                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                      {(channel.view_count / 1000000).toFixed(1)}M
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Views</p>
                                  </div>
                                  <div>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                      {channel.top_videos?.length || 0}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Top Videos</p>
                                  </div>
                                </div>
                                
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  📅 Last updated: {new Date(channel.last_accessed).toLocaleDateString()} at{' '}
                                  {new Date(channel.last_accessed).toLocaleTimeString()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  🆔 Channel ID: {channel.channel_id}
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 ml-4">
                              {selectedChannel?._id !== channel._id && (
                                <button
                                  onClick={() => handleSelectChannel(channel)}
                                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-semibold whitespace-nowrap"
                                >
                                  ✓ Select
                                </button>
                              )}
                              <button
                                onClick={() => handleRefreshChannel(channel.channel_id)}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold whitespace-nowrap disabled:opacity-50"
                              >
                                🔄 Refresh
                              </button>
                              <button
                                onClick={() => handleDeleteChannel(channel)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold whitespace-nowrap"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>

                          {/* Top Videos Preview */}
                          {channel.top_videos && channel.top_videos.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <h4 className="font-semibold mb-2 text-sm">🔥 Top Performing Videos:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {channel.top_videos.slice(0, 4).map((video: any, idx: number) => (
                                  <div key={idx} className="text-xs bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                                    <p className="font-semibold truncate">{video.title}</p>
                                    <p className="text-gray-500">
                                      👁️ {(video.view_count || 0).toLocaleString()} views
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400 text-lg">
                        📺 No channels tracked yet
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                        Click "Add Channel" to get started
                      </p>
                    </div>
                  )}

                  {/* Active Channel Info */}
                  {selectedChannel && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-2 border-green-300 dark:border-green-700">
                      <h3 className="text-xl font-bold mb-2">✅ Active Channel for All Agents</h3>
                      <p className="text-lg">
                        <strong>{selectedChannel.channel_title}</strong>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        All analytics-aware agents (Script, Ideas, Titles, Roadmap) will use data from this channel
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

                  {/* Selected Channel Info */}
                  {selectedChannel && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-2 border-green-300 dark:border-green-700">
                      <div className="flex items-center gap-4">
                        <img
                          src={selectedChannel.thumbnail}
                          alt={selectedChannel.channel_title}
                          className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-800 shadow-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-lg">{selectedChannel.channel_title}</h4>
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                              ✓ ACTIVE
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Script will be optimized for this channel's style and audience
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            👥 {selectedChannel.subscriber_count.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">subscribers</p>
                        </div>
                      </div>
                    </div>
                  )}

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
                        <label className="block text-sm font-medium mb-2">Video Duration (min)</label>
                        <input
                          type="number"
                          value={scriptDuration || ''}
                          onChange={(e) => setScriptDuration(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Optional"
                          className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                      <div>
                        <label className="block text-sm font-medium mb-2">Target Audience</label>
                        <select
                          value={scriptAudience}
                          onChange={(e) => setScriptAudience(e.target.value)}
                          className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700"
                        >
                          <option value="general">General</option>
                          <option value="beginners">Beginners</option>
                          <option value="professionals">Professionals</option>
                          <option value="tech enthusiasts">Tech Enthusiasts</option>
                          <option value="entrepreneurs">Entrepreneurs</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Script Structure</label>
                      <select
                        value={scriptStructure}
                        onChange={(e) => setScriptStructure(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700"
                      >
                        <option value="standard">Standard (Hook → Intro → Main → CTA)</option>
                        <option value="story-based">Story-Based (Hook → Setup → Conflict → Resolution)</option>
                        <option value="tutorial">Tutorial (Hook → Problem → Steps → Summary)</option>
                        <option value="listicle">Listicle (Hook → List Items → Conclusion)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={scriptHook}
                          onChange={(e) => setScriptHook(e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300"
                        />
                        <span className="text-sm font-medium">Include Hook</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={scriptCta}
                          onChange={(e) => setScriptCta(e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300"
                        />
                        <span className="text-sm font-medium">Include Call-to-Action</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Additional Instructions (Optional)</label>
                      <textarea
                        value={scriptInstructions}
                        onChange={(e) => setScriptInstructions(e.target.value)}
                        placeholder="e.g., Include code examples, mention specific tools..."
                        rows={3}
                        className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700"
                      />
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
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => copyToClipboard(scriptResponse.result, setCopiedScript)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          {copiedScript ? <Check size={16} /> : <Copy size={16} />}
                          {copiedScript ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={() => downloadAsPDF(scriptResponse.result, `Script-${scriptTopic}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Download size={16} />
                          Download PDF
                        </button>
                      </div>
                      
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {scriptResponse.result}
                        </ReactMarkdown>
                      </div>
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

                  {/* Selected Channel Info */}
                  {selectedChannel && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-2 border-green-300 dark:border-green-700">
                      <div className="flex items-center gap-4">
                        <img
                          src={selectedChannel.thumbnail}
                          alt={selectedChannel.channel_title}
                          className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-800 shadow-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-lg">{selectedChannel.channel_title}</h4>
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                              ✓ ACTIVE
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Ideas will be optimized for this channel's audience and style
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            👥 {selectedChannel.subscriber_count.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">subscribers</p>
                        </div>
                      </div>
                    </div>
                  )}

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
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => copyToClipboard(ideasResponse.result, setCopiedIdeas)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          {copiedIdeas ? <Check size={16} /> : <Copy size={16} />}
                          {copiedIdeas ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={() => downloadAsPDF(ideasResponse.result, `Video-Ideas-${ideasStyle}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Download size={16} />
                          Download PDF
                        </button>
                      </div>
                      
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {ideasResponse.result}
                        </ReactMarkdown>
                      </div>
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

                  {/* Selected Channel Info */}
                  {selectedChannel && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-2 border-green-300 dark:border-green-700">
                      <div className="flex items-center gap-4">
                        <img
                          src={selectedChannel.thumbnail}
                          alt={selectedChannel.channel_title}
                          className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-800 shadow-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-lg">{selectedChannel.channel_title}</h4>
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                              ✓ ACTIVE
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Titles will match this channel's proven patterns
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            👥 {selectedChannel.subscriber_count.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">subscribers</p>
                        </div>
                      </div>
                    </div>
                  )}

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
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => copyToClipboard(titlesResponse.result, setCopiedTitles)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          {copiedTitles ? <Check size={16} /> : <Copy size={16} />}
                          {copiedTitles ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={() => downloadAsPDF(titlesResponse.result, `Video-Titles`)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Download size={16} />
                          Download PDF
                        </button>
                      </div>
                      
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {titlesResponse.result}
                        </ReactMarkdown>
                      </div>
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

                  {/* Selected Channel Info */}
                  {selectedChannel && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-2 border-green-300 dark:border-green-700">
                      <div className="flex items-center gap-4">
                        <img
                          src={selectedChannel.thumbnail}
                          alt={selectedChannel.channel_title}
                          className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-800 shadow-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-lg">{selectedChannel.channel_title}</h4>
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                              ✓ ACTIVE
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Roadmap will be tailored for this channel's strengths
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            👥 {selectedChannel.subscriber_count.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">subscribers</p>
                        </div>
                      </div>
                    </div>
                  )}

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
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => copyToClipboard(roadmapResponse.result, setCopiedRoadmap)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          {copiedRoadmap ? <Check size={16} /> : <Copy size={16} />}
                          {copiedRoadmap ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={() => downloadAsPDF(roadmapResponse.result, `Content-Roadmap-${roadmapVideos}videos`)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Download size={16} />
                          Download PDF
                        </button>
                      </div>
                      
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {roadmapResponse.result}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && channelToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 animate-scale-in">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Channel?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                </div>
              </div>

              {/* Channel Info */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <img
                    src={channelToDelete.thumbnail}
                    alt={channelToDelete.channel_title}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {channelToDelete.channel_title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {channelToDelete.subscriber_count.toLocaleString()} subscribers
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>⚠️ Warning:</strong> This will permanently delete:
                </p>
                <ul className="mt-2 text-sm text-red-700 dark:text-red-300 space-y-1 ml-4">
                  <li>• Channel data</li>
                  <li>• All analytics history</li>
                  <li>• Top videos information</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      🗑️ Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
