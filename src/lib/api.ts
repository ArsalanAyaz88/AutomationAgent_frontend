// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://automation-agent-backend.vercel.app';

// API Response Type
export interface AgentResponse {
  success: boolean;
  result: string;
  error?: string;
}

export interface SavedResponseSummary {
  id: string;
  title: string;
  agent_id: number;
  agent_name: string;
  agent_codename: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SavedResponseDetail extends SavedResponseSummary {
  content: string;
}

// Agent 1: Channel Audit
export interface ChannelAuditRequest {
  channel_urls: string[];
  user_query?: string;
}

export async function auditChannel(data: ChannelAuditRequest): Promise<AgentResponse> {
  try {
    const endpoint = `${API_BASE}/api/agent1/audit-channel`;
    
    console.log('🚀 API Call to:', endpoint);
    console.log('📦 Request data:', JSON.stringify(data, null, 2));
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    console.log('📡 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response body:', errorText);
      
      // Try to parse error as JSON for better messages
      try {
        const errorJson = JSON.parse(errorText);
        return {
          success: false,
          result: '',
          error: errorJson.detail || errorJson.message || `API Error: ${response.status}`
        };
      } catch {
        return {
          success: false,
          result: '',
          error: `API Error ${response.status}: ${errorText || response.statusText}`
        };
      }
    }
    
    const result = await response.json();
    console.log('✅ Success response:', result);
    return result;
  } catch (error) {
    console.error('💥 Exception:', error);
    return {
      success: false,
      result: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Agent 2: Title Audit
export interface TitleAuditRequest {
  video_urls: string[];
  user_query?: string;
}

export async function auditTitles(data: TitleAuditRequest): Promise<AgentResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/agent2/audit-titles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    return {
      success: false,
      result: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Agent 3: Script Generation
export interface ScriptGenerationRequest {
  topic: string;
  total_words?: number;
  tone?: string;
  target_audience?: string;
  video_duration?: number;
  include_hook?: boolean;
  include_cta?: boolean;
  script_structure?: string;
  key_points?: string[];
  additional_instructions?: string;
}

export async function generateScript(data: ScriptGenerationRequest): Promise<AgentResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/agent3/generate-script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    return {
      success: false,
      result: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Agent 4: Script to Prompts
export interface ScriptToPromptsRequest {
  script: string;
  user_query?: string;
}

export async function scriptToPrompts(data: ScriptToPromptsRequest): Promise<AgentResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/agent4/script-to-prompts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    return {
      success: false,
      result: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Agent 5: Ideas Generation
export interface IdeasGenerationRequest {
  winning_videos_data: string;
  user_query?: string;
}

export async function generateIdeas(data: IdeasGenerationRequest): Promise<AgentResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/agent5/generate-ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    return {
      success: false,
      result: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Agent 6: Roadmap Generation
export interface RoadmapGenerationRequest {
  niche?: string;
  winning_data?: string;
  channel_input?: string;
  user_query?: string;
}

export async function generateRoadmap(data: RoadmapGenerationRequest): Promise<AgentResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/agent6/generate-roadmap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    return {
      success: false,
      result: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// 50 Videos Fetcher
export interface FiftyVideosRequest {
  input: string;
  user_query?: string;
}

export async function fetchFiftyVideos(data: FiftyVideosRequest): Promise<AgentResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/fifty-videos/fetch-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    return {
      success: false,
      result: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Health Check
export interface HealthStatus {
  status: string;
  service?: string;
  message?: string;
  version?: string;
  error?: string;
}

export async function healthCheck(): Promise<HealthStatus> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    return {
      status: 'offline',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function listSavedResponses(): Promise<SavedResponseSummary[]> {
  const response = await fetch(`${API_BASE}/api/saved-responses`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

export async function createSavedResponse(data: {
  title: string;
  content: string;
  agent_id: number;
  agent_name: string;
  agent_codename: string;
}): Promise<SavedResponseDetail> {
  const response = await fetch(`${API_BASE}/api/saved-responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API Error: ${response.status}`);
  }
  return await response.json();
}

export async function getSavedResponse(responseId: string): Promise<SavedResponseDetail> {
  const response = await fetch(`${API_BASE}/api/saved-responses/${responseId}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

export async function updateSavedResponse(
  responseId: string,
  data: { title?: string; content?: string }
): Promise<SavedResponseDetail> {
  const response = await fetch(`${API_BASE}/api/saved-responses/${responseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API Error: ${response.status}`);
  }
  return await response.json();
}

export async function deleteSavedResponse(responseId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/saved-responses/${responseId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API Error: ${response.status}`);
  }
}

// ========================
// RL SYSTEM API
// ========================

export interface RLAgentStatus {
  agent_name: string;
  agent_type: string;
  capabilities: string[];
  stm_status: {
    connected: boolean;
    key_prefix: string;
    storage_type: 'redis' | 'memory';
  };
  ltm_status: {
    connected: boolean;
    collections: string[];
    database: string;
  };
  rl_engine_status: {
    active: boolean;
    learning_rate: number;
    discount_factor: number;
    epsilon: number;
    total_actions: number;
    avg_reward: number;
  };
  last_updated: string;
}

export interface RLSystemStatus {
  total_agents: number;
  operational_agents: number;
  central_memory_connected: boolean;
  agents: RLAgentStatus[];
  system_health: 'fully_operational' | 'partially_operational' | 'offline';
}

export interface AgentLearningStats {
  agent_name: string;
  stm_experiences: number;
  ltm_experiences: number;
  recent_rewards: number[];
  best_actions: Array<{
    action_type: string;
    q_value: number;
    confidence: number;
  }>;
  learning_progress: {
    exploration_rate: number;
    exploitation_rate: number;
    avg_q_value: number;
  };
}

export interface CentralMemoryInsights {
  total_global_insights: number;
  top_insights: Array<{
    insight_type: string;
    confidence: number;
    applicable_agents: string;
  }>;
  cross_agent_patterns: number;
  performance_leaderboard: Array<{
    agent_id: string;
    overall_score: number;
    rank: number;
  }>;
}

export async function getRLSystemStatus(): Promise<RLSystemStatus> {
  try {
    const response = await fetch(`${API_BASE}/api/rl/system-status`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch RL system status:', error);
    return {
      total_agents: 0,
      operational_agents: 0,
      central_memory_connected: false,
      agents: [],
      system_health: 'offline'
    };
  }
}

export async function getAgentLearningStats(agentName: string): Promise<AgentLearningStats | null> {
  try {
    const response = await fetch(`${API_BASE}/api/rl/agent/${agentName}/stats`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch stats for ${agentName}:`, error);
    return null;
  }
}

export async function getCentralMemoryInsights(): Promise<CentralMemoryInsights | null> {
  try {
    const response = await fetch(`${API_BASE}/api/rl/central-memory/insights`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch central memory insights:', error);
    return null;
  }
}
