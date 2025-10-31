// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API Response Type
export interface AgentResponse {
  success: boolean;
  result: string;
  error?: string;
}

// Agent 1: Channel Audit
export interface ChannelAuditRequest {
  channel_urls: string[];
  user_query?: string;
}

export async function auditChannel(data: ChannelAuditRequest): Promise<AgentResponse> {
  const response = await fetch(`${API_BASE}/api/agent1/audit-channel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Agent 2: Title Audit
export interface TitleAuditRequest {
  video_urls: string[];
  user_query?: string;
}

export async function auditTitles(data: TitleAuditRequest): Promise<AgentResponse> {
  const response = await fetch(`${API_BASE}/api/agent2/audit-titles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Agent 3: Script Generation
export interface ScriptGenerationRequest {
  title_audit_data: string;
  topic: string;
  user_query?: string;
}

export async function generateScript(data: ScriptGenerationRequest): Promise<AgentResponse> {
  const response = await fetch(`${API_BASE}/api/agent3/generate-script`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Agent 4: Script to Prompts
export interface ScriptToPromptsRequest {
  script: string;
  user_query?: string;
}

export async function scriptToPrompts(data: ScriptToPromptsRequest): Promise<AgentResponse> {
  const response = await fetch(`${API_BASE}/api/agent4/script-to-prompts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Agent 5: Ideas Generation
export interface IdeasGenerationRequest {
  winning_videos_data: string;
  user_query?: string;
}

export async function generateIdeas(data: IdeasGenerationRequest): Promise<AgentResponse> {
  const response = await fetch(`${API_BASE}/api/agent5/generate-ideas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Agent 6: Roadmap Generation
export interface RoadmapGenerationRequest {
  niche: string;
  winning_data?: string;
  user_query?: string;
}

export async function generateRoadmap(data: RoadmapGenerationRequest): Promise<AgentResponse> {
  const response = await fetch(`${API_BASE}/api/agent6/generate-roadmap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Health Check
export async function healthCheck(): Promise<{ status: string; service: string }> {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}
