'use client';

import React, { useState } from 'react';
import { VideoAnalyticsData } from '@/services/channelAnalytics';

interface VideoAnalyticsDisplayProps {
  videoAnalytics: {
    total_videos_analyzed: number;
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
    <div className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg border-2 border-blue-200 dark:border-blue-800">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              AI Analysis Data Source
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              See which videos AI analyzed to generate recommendations
            </p>
          </div>
        </div>
        <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <span className="text-2xl">{isExpanded ? '▼' : '▶'}</span>
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 border-t border-blue-200 dark:border-gray-700">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Videos Analyzed</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {videoAnalytics.total_videos_analyzed}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Views</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatNumber(Math.round(videoAnalytics.avg_views))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Engagement</div>
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
              🔥 Top {videoAnalytics.top_performing_videos.length} by Views
            </button>
            <button
              onClick={() => setActiveTab('high_engagement')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'high_engagement'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              💎 Top {videoAnalytics.high_engagement_videos.length} by Engagement
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
              <strong>💡 How AI Uses This Data:</strong> The AI analyzes these {videoAnalytics.total_videos_analyzed} videos to understand what works for <strong>{channelTitle}</strong>. It looks for patterns in titles, topics, engagement rates, and view counts to generate recommendations that match your channel's proven success formula.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
