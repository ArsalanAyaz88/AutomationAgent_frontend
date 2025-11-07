'use client';

import React, { useState } from 'react';
import { VideoAnalyticsData } from '@/services/channelAnalytics';
import { BarChart3, Eye, ThumbsUp, HeartPulse } from 'lucide-react';

interface VideoAnalyticsDisplayProps {
  videoAnalytics: {
    total_videos_analyzed: number;
    videos_shown: number;
    showing_all: boolean;
    avg_views: number;
    avg_engagement: number;
    top_performing_videos: VideoAnalyticsData[];
    high_engagement_videos: VideoAnalyticsData[];
  };
  channelTitle: string;
}

export default function VideoAnalyticsDisplay({ videoAnalytics, channelTitle }: VideoAnalyticsDisplayProps) {
  const [activeTab, setActiveTab] = useState<'top_views' | 'high_engagement'>('top_views');
  const [isExpanded, setIsExpanded] = useState(false);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return (num * 100).toFixed(2) + '%';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const currentVideos = activeTab === 'top_views' 
    ? videoAnalytics.top_performing_videos 
    : videoAnalytics.high_engagement_videos;

  return (
    <div className="mt-6 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-gray-800 transition-colors rounded-t-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Video Analytics Data
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Source data for AI recommendations
            </p>
          </div>
        </div>
        <span className="text-lg text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 border-t border-blue-200 dark:border-gray-700">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Eye className="w-4 h-4" />
                Videos Analyzed
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {videoAnalytics.total_videos_analyzed}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <ThumbsUp className="w-4 h-4" />
                Average Views
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatNumber(Math.round(videoAnalytics.avg_views))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <HeartPulse className="w-4 h-4" />
                Avg Engagement
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatPercentage(videoAnalytics.avg_engagement)}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('top_views')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'top_views'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              🔥 {videoAnalytics.showing_all ? 'All' : `Top ${videoAnalytics.videos_shown}`} by Views
            </button>
            <button
              onClick={() => setActiveTab('high_engagement')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'high_engagement'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              💎 {videoAnalytics.showing_all ? 'All' : `Top ${videoAnalytics.videos_shown}`} by Engagement
            </button>
          </div>

          {/* Video List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-h-[600px] overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-5">Title</div>
                <div className="col-span-2 text-center">Views</div>
                <div className="col-span-2 text-center">Engagement</div>
                <div className="col-span-2 text-center">Date</div>
              </div>
            </div>

            {currentVideos.map((video, index) => {
              const isTopPerformer = index < 3;
              const medals = ['🏆', '🥈', '🥉'];
              
              return (
                <div
                  key={index}
                  className={`grid grid-cols-12 gap-2 p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    isTopPerformer ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                  }`}
                >
                  <div className="col-span-1 text-center flex items-center justify-center">
                    {isTopPerformer ? (
                      <span className="text-xl">{medals[index]}</span>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">{video.rank}</span>
                    )}
                  </div>
                  <div className="col-span-5 flex items-center">
                    <p className="text-sm text-gray-900 dark:text-white line-clamp-2 leading-tight">
                      {video.title}
                    </p>
                  </div>
                  <div className="col-span-2 text-center flex flex-col items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {formatNumber(video.views)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      👁️ {formatNumber(video.likes)} 👍
                    </span>
                  </div>
                  <div className="col-span-2 text-center flex flex-col items-center justify-center">
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                      {formatPercentage(video.engagement_rate)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      💬 {formatNumber(video.comments)}
                    </span>
                  </div>
                  <div className="col-span-2 text-center flex items-center justify-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {formatDate(video.published_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Footer */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>💡 How AI Uses This Data:</strong> The AI analyzes {videoAnalytics.showing_all ? `all ${videoAnalytics.total_videos_analyzed}` : `these ${videoAnalytics.total_videos_analyzed}`} videos to understand what works for <strong>{channelTitle}</strong>. {videoAnalytics.showing_all ? 'Showing all available videos since the channel has fewer than 30 videos.' : `Showing top ${videoAnalytics.videos_shown} performers by views and engagement.`} It looks for patterns in titles, topics, engagement rates, and view counts to generate recommendations that match your channel's proven success formula.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
