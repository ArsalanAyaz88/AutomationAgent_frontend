/**
 * Channel Analytics API Service
 * Handles YouTube channel tracking and video idea generation
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ChannelTrackResponse {
  status: string;
  channel_id: string;
  channel_title: string;
  subscriber_count?: number;
  video_count?: number;
  message: string;
}

export interface VideoIdea {
  status: string;
  channel_title: string;
  analytics: {
    subscribers: number;
    avg_views: number;
    avg_engagement: number;
    video_count: number;
  };
  video_ideas: string;
  generated_at: string;
}

export interface TrackedChannel {
  _id: string;
  channel_id: string;
  channel_title: string;
  channel_url: string;
  subscriber_count: number;
  video_count: number;
  view_count: number;
  thumbnail: string;
  created_at: string;
  last_accessed: string;
  tracking_enabled: boolean;
}

export interface TrackedChannelsResponse {
  status: string;
  count: number;
  channels: TrackedChannel[];
}

/**
 * Track a YouTube channel for analytics
 */
export async function trackChannel(
  channelUrl: string,
  userId: string = 'default'
): Promise<ChannelTrackResponse> {
  const response = await fetch(`${API_BASE_URL}/api/channel/track`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel_url: channelUrl,
      user_id: userId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to track channel');
  }

  return response.json();
}

/**
 * Generate AI-powered video ideas based on channel analytics
 */
export async function generateVideoIdeas(
  channelId: string,
  userId: string = 'default'
): Promise<VideoIdea> {
  const response = await fetch(`${API_BASE_URL}/api/channel/video-ideas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel_id: channelId,
      user_id: userId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate video ideas');
  }

  return response.json();
}

/**
 * Get all tracked channels for a user
 */
export async function getTrackedChannels(
  userId: string = 'default'
): Promise<TrackedChannelsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/channel/tracked?user_id=${userId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch tracked channels');
  }

  return response.json();
}

/**
 * Refresh analytics for a specific channel
 */
export async function refreshChannelAnalytics(
  channelId: string,
  userId: string = 'default'
): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/api/channel/refresh-analytics/${channelId}?user_id=${userId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to refresh analytics');
  }

  return response.json();
}

/**
 * Combined flow: Track channel and generate video ideas
 */
export async function trackAndGenerateIdeas(
  channelUrl: string,
  userId: string = 'default'
): Promise<{ tracking: ChannelTrackResponse; ideas: VideoIdea }> {
  // First track the channel
  const tracking = await trackChannel(channelUrl, userId);

  // Then generate video ideas
  const ideas = await generateVideoIdeas(tracking.channel_id, userId);

  return { tracking, ideas };
}

// ============================================
// UNIFIED ANALYTICS-AWARE AGENT ENDPOINTS
// ============================================

export interface UnifiedResponse {
  success: boolean;
  result: string;
  error?: string;
  analytics_used: boolean;
  channel_info?: {
    channel_title: string;
    channel_id: string;
    subscribers: number;
    video_count: number;
    has_analytics: boolean;
    avg_views?: number;
    avg_engagement?: number;
    last_updated?: string;
  };
}

export interface AnalyticsStatus {
  has_analytics: boolean;
  tracked_channels: number;
  most_recent_channel?: {
    title: string;
    channel_id: string;
    subscribers: number;
  };
  message: string;
}

/**
 * Check if user has analytics available
 */
export async function getAnalyticsStatus(
  userId: string = 'default'
): Promise<AnalyticsStatus> {
  const response = await fetch(
    `${API_BASE_URL}/api/unified/analytics-status?user_id=${userId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get analytics status');
  }

  return response.json();
}

/**
 * Generate script with analytics
 */
export async function generateScriptWithAnalytics(
  topic: string,
  options: {
    total_words?: number;
    tone?: string;
    key_points?: string[];
    use_analytics?: boolean;
    user_id?: string;
  } = {}
): Promise<UnifiedResponse> {
  const response = await fetch(`${API_BASE_URL}/api/unified/generate-script`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      total_words: options.total_words || 1500,
      tone: options.tone || 'conversational',
      key_points: options.key_points,
      use_analytics: options.use_analytics !== false,
      user_id: options.user_id || 'default',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate script');
  }

  return response.json();
}

/**
 * Generate video ideas with analytics
 */
export async function generateIdeasWithAnalytics(
  options: {
    niche?: string;
    video_count?: number;
    style?: string;
    use_analytics?: boolean;
    user_id?: string;
  } = {}
): Promise<UnifiedResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/unified/generate-video-ideas`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        niche: options.niche,
        video_count: options.video_count || 5,
        style: options.style || 'viral',
        use_analytics: options.use_analytics !== false,
        user_id: options.user_id || 'default',
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate video ideas');
  }

  return response.json();
}

/**
 * Generate titles with analytics
 */
export async function generateTitlesWithAnalytics(
  videoDescription: string,
  options: {
    keywords?: string[];
    title_count?: number;
    use_analytics?: boolean;
    user_id?: string;
  } = {}
): Promise<UnifiedResponse> {
  const response = await fetch(`${API_BASE_URL}/api/unified/generate-titles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      video_description: videoDescription,
      keywords: options.keywords,
      title_count: options.title_count || 5,
      use_analytics: options.use_analytics !== false,
      user_id: options.user_id || 'default',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate titles');
  }

  return response.json();
}

/**
 * Generate content roadmap with analytics
 */
export async function generateRoadmapWithAnalytics(
  options: {
    video_count?: number;
    timeframe_days?: number;
    focus_area?: string;
    use_analytics?: boolean;
    user_id?: string;
  } = {}
): Promise<UnifiedResponse> {
  const response = await fetch(`${API_BASE_URL}/api/unified/generate-roadmap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      video_count: options.video_count || 30,
      timeframe_days: options.timeframe_days || 90,
      focus_area: options.focus_area,
      use_analytics: options.use_analytics !== false,
      user_id: options.user_id || 'default',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate roadmap');
  }

  return response.json();
}
