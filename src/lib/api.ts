// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://automation-agent-backend.vercel.app';

// API Response Type
export interface AgentResponse {
  success: boolean;
  result: string;
  error?: string;
}

// Notepad Types
export interface NotepadHistoryEntry {
  content: string;
  updated_at?: string | null;
}

export interface NoteSummary {
  id: string;
  name: string;
  updated_at?: string | null;
  created_at?: string | null;
}

export interface NoteDetail extends NoteSummary {
  content: string;
  history: NotepadHistoryEntry[];
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
  title_audit_data: string;
  topic: string;
  user_query?: string;
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
  niche: string;
  winning_data?: string;
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

// Health Check
export async function healthCheck(): Promise<{ status: string; service?: string; message?: string; version?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return {
      status: 'offline',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Notepad API Helpers
export async function listNotes(): Promise<NoteSummary[]> {
  const response = await fetch(`${API_BASE}/api/notepad`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

export async function createNote(name: string, content = ''): Promise<NoteDetail> {
  const response = await fetch(`${API_BASE}/api/notepad`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, content }),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API Error: ${response.status}`);
  }
  return await response.json();
}

export async function getNote(noteId: string): Promise<NoteDetail> {
  const response = await fetch(`${API_BASE}/api/notepad/${noteId}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

export async function updateNote(noteId: string, data: { name?: string; content?: string }): Promise<NoteDetail> {
  const response = await fetch(`${API_BASE}/api/notepad/${noteId}`, {
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

export async function deleteNote(noteId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/notepad/${noteId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API Error: ${response.status}`);
  }
}

export function getNoteDownloadUrl(noteId: string): string {
  return `${API_BASE}/api/notepad/${noteId}/download`;
}
