'use client';

import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { jsPDF } from 'jspdf';
import { Copy, Download, Check, Tv, BarChart3, Lightbulb, Hash, Map, ArrowLeft, MessageSquare, Film, Trash2, Book } from 'lucide-react';
import { useRouter } from 'next/navigation';
import VideoAnalyticsDisplay from '@/components/VideoAnalyticsDisplay';
import SelectModal from '@/components/SelectModal';
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

// API Base URL for backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://automation-agent-backend.vercel.app' 
    : 'http://localhost:8000');

type TabType = 'overview' | 'channels' | 'ideas' | 'titles' | 'roadmap' | 'scene-writer' | 'story-writer' | 'scriptwriter';

export default function AnalyticsDashboard() {
  const router = useRouter();
  // State management
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== 'undefined') {
      // Restore saved tab from localStorage, default to 'channels' for first visit
      const savedTab = window.localStorage.getItem('activeTab');
      if (savedTab && ['overview', 'channels', 'ideas', 'titles', 'roadmap', 'scene-writer', 'story-writer', 'scriptwriter'].includes(savedTab)) {
        return savedTab as TabType;
      }
    }
    return 'channels';
  });
  const [channelUrl, setChannelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Analytics state
  const [analyticsStatus, setAnalyticsStatus] = useState<AnalyticsStatus | null>(null);
  const [trackedChannels, setTrackedChannels] = useState<TrackedChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<TrackedChannel | null>(null);
  
  // Agent responses
  const [scriptResponse, setScriptResponse] = useState<UnifiedResponse | null>(null);
  const [ideasResponse, setIdeasResponse] = useState<UnifiedResponse | null>(null);
  const [titlesResponse, setTitlesResponse] = useState<UnifiedResponse | null>(null);
  const [roadmapResponse, setRoadmapResponse] = useState<UnifiedResponse | null>(null);
  // Story writer state
  const [storyTopic, setStoryTopic] = useState('');
  const [storyWords, setStoryWords] = useState(1000);
  const [storyLanguage, setStoryLanguage] = useState('english');
  const [storyPlan, setStoryPlan] = useState<string>('');
  const [storyOutline, setStoryOutline] = useState<string>('');
  const [finalStory, setFinalStory] = useState<string>('');
  const [copiedStory, setCopiedStory] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingStory, setLoadingStory] = useState(false);
  
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

  // Scriptwriter chatbot state
  const [scriptwriterInput, setScriptwriterInput] = useState('');
  const [scriptwriterMessages, setScriptwriterMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [scriptwriterSessionId, setScriptwriterSessionId] = useState<string | null>(null);

  // Scene Writer chatbot state
  const [sceneWriterInput, setSceneWriterInput] = useState('');
  const [sceneWriterMessages, setSceneWriterMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [sceneWriterSessionId, setSceneWriterSessionId] = useState<string | null>(null);
  const [sceneLoading, setSceneLoading] = useState(false);

  type ChatSession = { session_id: string; last_activity?: string; preview?: string };
  const [scriptwriterSessions, setScriptwriterSessions] = useState<ChatSession[]>([]);
  const [sceneWriterSessions, setSceneWriterSessions] = useState<ChatSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  type CombinedSession = { session_id: string; agent: 'scriptwriter' | 'scene-writer'; last_activity?: string; preview?: string };
  const combinedSessions = useMemo<CombinedSession[]>(() => {
    const sw = scriptwriterSessions.map(s => ({ session_id: s.session_id, agent: 'scriptwriter' as const, last_activity: s.last_activity, preview: s.preview }));
    const sc = sceneWriterSessions.map(s => ({ session_id: s.session_id, agent: 'scene-writer' as const, last_activity: s.last_activity, preview: s.preview }));
    const all = [...sw, ...sc];
    all.sort((a, b) => {
      const ta = a.last_activity ? new Date(a.last_activity).getTime() : 0;
      const tb = b.last_activity ? new Date(b.last_activity).getTime() : 0;
      return tb - ta;
    });
    return all;
  }, [scriptwriterSessions, sceneWriterSessions]);

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

  const formatJsonIfPossible = (text: string): string | null => {
    try {
      const raw = text.trim();
      const firstBrace = raw.indexOf('{');
      const lastBrace = raw.lastIndexOf('}');
      if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
      const candidate = raw.slice(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(candidate);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return null;
    }
  };

  const sceneWriterSystemInstructions = `You are a filmmaker converting a provided story or script into production-ready visual scenes suitable for Veo-style video generation.
Follow these rules:
- First read and understand the full story from beginning to end.
- Break the story into a sequence of short cinematic scenes that, when played in order, retell the entire story.
- Prefer roughly one important sentence, line, or beat of the story per scene.
- Keep each scene focused on one clear visual moment that could be used as a Veo prompt.
- Always keep content safe-for-work (no graphic violence, no sexual content).

OUTPUT FORMAT (VERY IMPORTANT):
- Respond with EXACTLY ONE valid JSON object and nothing else.
- Do NOT use Markdown, headings, bullet points, or backticks.
- The JSON must have this overall structure:
  {
    "project_metadata": {
      "title": "Short, catchy title summarizing the story",
      "total_scenes": <number of scenes>,
      "resolution": "Ultra 8K",
      "aspect_ratio": "16:9",
      "global_modifiers": "Cinematic lighting, photorealistic, sharp focus, Unreal Engine 5 style, highly detailed textures, motion blur where appropriate"
    },
    "scenes": [
      {
        "scene_id": 1,
        "category": "Intro",
        "visual_prompt": "Ultra 8K wide shot ..."
      }
    ]
  }

project_metadata RULES:
- title: Short title that matches the story.
- total_scenes: The exact number of scene objects in the scenes array.
- resolution: Always use a cinematic value like "Ultra 8K".
- aspect_ratio: Typically "16:9".
- global_modifiers: Comma-separated cinematic style modifiers (lighting, realism, engine, etc.).

scenes ARRAY RULES:
- Each item must include: scene_id (integer), category (string), visual_prompt (string).
- scene_id must start at 1 and increase by 1 for each scene.
- category is a short label like "Intro", "Escape Begins", "Conflict", "Mountain Road", "Climax", "Resolution".
- visual_prompt is a single, vivid description of what Veo should show for that scene:
  * Include camera angle or framing (wide shot, close up, top down, etc.).
  * Describe key action and motion.
  * Mention important characters and their positioning.
  * Include environment, lighting, and mood.
  * Use English for the visual_prompt even if the input story is in another language.

FINAL CONSTRAINTS:
- Output must be valid JSON that can be parsed with no extra text.
- Do not include comments or trailing commas.
- Do not add explanations before or after the JSON.`;

  // -------- Story Writer helpers --------
  const extractOutlineFromPlan = (plan: string): string => {
    try {
      const lines = plan.split(/\r?\n/);
      const startIdx = lines.findIndex(l => l.trim().toLowerCase().startsWith('## outline'));
      if (startIdx === -1) return '';
      const rest = lines.slice(startIdx + 1);
      const outlineLines: string[] = [];
      for (const l of rest) {
        if (l.trim().startsWith('## ')) break;
        outlineLines.push(l);
      }
      return outlineLines.join('\n').trim();
    } catch {
      return '';
    }
  };

  const handleGenerateStoryPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingPlan(true);
    setError('');
    setSuccess('');
    setStoryPlan('');
    setStoryOutline('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/unified/story/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: storyTopic,
          total_words: storyWords,
          language: storyLanguage,
          channel_id: selectedChannel?.channel_id,
          user_id: 'default',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to generate plan');
      setStoryPlan(data.result || '');
      const outline = extractOutlineFromPlan(data.result || '');
      if (outline) setStoryOutline(outline);
      setSuccess('✅ Story plan generated');
    } catch (err: any) {
      setError(err.message || 'Failed to generate plan');
    } finally {
      setLoading(false);
      setLoadingPlan(false);
    }
  };

  const handleGenerateFullStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStory(true);
    setError('');
    setSuccess('');
    setFinalStory('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/unified/story/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: storyTopic,
          total_words: storyWords,
          outline: storyOutline,
          language: storyLanguage,
          channel_id: selectedChannel?.channel_id,
          user_id: 'default',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to generate story');
      setFinalStory(data.result || '');
      setSuccess('✅ Story generated');
    } catch (err: any) {
      setError(err.message || 'Failed to generate story');
    } finally {
      setLoading(false);
      setLoadingStory(false);
    }
  };

  const streamAgentRun = async (
    body: { agent_key: string; prompt: string; agent_name?: string; instructions?: string },
    onDelta: (text: string) => void,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: string) => void
  ) => {
    const res = await fetch(`${API_BASE_URL}/api/stream/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      const msg = `HTTP ${res.status}`;
      onError?.(msg);
      throw new Error(msg);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buf = '';

    onStart?.();

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split('\n\n');
        buf = parts.pop() || '';
        for (const chunk of parts) {
          const lines = chunk.split('\n');
          let eventType: string | null = null;
          let data = '';
          for (const line of lines) {
            if (line.startsWith('event:')) eventType = line.slice(6).trim();
            else if (line.startsWith('data:')) data += line.slice(5);
          }
          if (eventType === 'error') {
            onError?.(data);
          } else if (eventType === 'start') {
            // no-op
          } else if (eventType === 'end') {
            onEnd?.();
          } else {
            onDelta(data);
          }
        }
      }
    } finally {
      onEnd?.();
      reader.releaseLock();
    }
  };

  const loadChatSessions = async () => {
    try {
      setLoadingSessions(true);
      const [swRes, scRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/unified/list-scriptwriter-sessions?user_id=default`).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/unified/list-scene-writer-sessions?user_id=default`).then(r => r.json()),
      ]);
      if (swRes && swRes.success) setScriptwriterSessions(swRes.sessions || []);
      if (scRes && scRes.success) setSceneWriterSessions(scRes.sessions || []);
    } catch (e) {
      console.error('Failed to load chat sessions', e);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchScriptwriterChat = async (sessionId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/unified/get-scriptwriter-chat/${sessionId}?user_id=default`);
      const data = await res.json();
      if (data && data.success) {
        const msgs = (data.messages || []).map((m: any) => ({ role: m.role === 'user' ? 'user' as const : 'assistant' as const, content: m.content }));
        setScriptwriterMessages(msgs);
        setScriptwriterSessionId(data.session_id || sessionId);
      }
    } catch (e) {
      console.error('Failed to fetch scriptwriter chat', e);
    }
  };

  const fetchSceneWriterChat = async (sessionId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/unified/get-scene-writer-chat/${sessionId}?user_id=default`);
      const data = await res.json();
      if (data && data.success) {
        const msgs = (data.messages || []).map((m: any) => ({ role: m.role === 'user' ? 'user' as const : 'assistant' as const, content: m.content }));
        setSceneWriterMessages(msgs);
        setSceneWriterSessionId(data.session_id || sessionId);
      }
    } catch (e) {
      console.error('Failed to fetch scene-writer chat', e);
    }
  };

  const openScriptwriterSession = async (sessionId: string) => {
    setActiveTab('scriptwriter');
    await fetchScriptwriterChat(sessionId);
  };

  const openSceneWriterSession = async (sessionId: string) => {
    setActiveTab('scene-writer');
    await fetchSceneWriterChat(sessionId);
  };

  const openSession = async (agent: 'scriptwriter' | 'scene-writer', sessionId: string) => {
    if (agent === 'scriptwriter') return openScriptwriterSession(sessionId);
    return openSceneWriterSession(sessionId);
  };

  // Delete a chat session (both frontend state and backend)
  const deleteChatSession = async (agent: 'scriptwriter' | 'scene-writer', sessionId: string) => {
    try {
      const confirmed = typeof window !== 'undefined' ? window.confirm('Delete this chat permanently?') : true;
      if (!confirmed) return;
      const url = agent === 'scriptwriter'
        ? `${API_BASE_URL}/api/unified/clear-scriptwriter-chat/${sessionId}?user_id=default`
        : `${API_BASE_URL}/api/unified/clear-scene-writer-chat/${sessionId}?user_id=default`;
      await fetch(url, { method: 'DELETE' });
      // Clear currently open chat if it matches
      if (agent === 'scriptwriter' && scriptwriterSessionId === sessionId) {
        setScriptwriterMessages([]);
        setScriptwriterSessionId(null);
      }
      if (agent === 'scene-writer' && sceneWriterSessionId === sessionId) {
        setSceneWriterMessages([]);
        setSceneWriterSessionId(null);
      }
      await loadChatSessions();
      setSuccess('✅ Chat deleted');
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      setError('Failed to delete chat');
    }
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

  useEffect(() => {
    loadChatSessions();
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
        channel_id: selectedChannel?.channel_id,
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
        channel_id: selectedChannel?.channel_id,
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
        channel_id: selectedChannel?.channel_id,
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
        channel_id: selectedChannel?.channel_id,
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

  // Scriptwriter Chatbot handlers
  const sendScriptwriterMessage = async () => {
    if (!scriptwriterInput.trim()) return;
    
    const userMessage = scriptwriterInput.trim();
    setScriptwriterInput('');
    
    // Add user message to UI
    setScriptwriterMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setError('');
    setScriptwriterMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    const onDelta = (delta: string) => {
      setScriptwriterMessages(prev => {
        const next = [...prev];
        const idx = next.length - 1;
        next[idx] = { role: 'assistant', content: next[idx].content + delta } as any;
        return next;
      });
    };
    const onEnd = () => {
      setLoading(false);
    };
    const onError = (err: string) => {
      setError(err || 'Stream error');
      setLoading(false);
    };
    try {
      await streamAgentRun(
        {
          agent_key: 'scriptwriter_chat',
          prompt: userMessage,
          agent_name: 'Scriptwriter Chatbot',
          instructions: undefined,
        },
        onDelta,
        undefined,
        onEnd,
        onError
      );
    } catch (e: any) {
      setError(e?.message || 'Failed to stream');
      setSceneLoading(false);
    }
  };
  
  const clearScriptwriterChat = async () => {
    if (!scriptwriterSessionId) {
      setScriptwriterMessages([]);
      return;
    }
    
    try {
      await fetch(`${API_BASE_URL}/api/unified/clear-scriptwriter-chat/${scriptwriterSessionId}?user_id=default`, {
        method: 'DELETE'
      });
      
      setScriptwriterMessages([]);
      setScriptwriterSessionId(null);
      setSuccess('Chat cleared!');
      loadChatSessions();
    } catch (err: any) {
      setError('Failed to clear chat');
    }
  };
  
  // Scene Writer Chatbot handlers
  const sendSceneWriterMessage = async () => {
    if (!sceneWriterInput.trim()) return;
    
    const userMessage = sceneWriterInput.trim();
    const convertPrompt = `Convert the following story or script into a JSON object with project_metadata and scenes as described in your system instructions. Return ONLY the JSON object and nothing else.\n\nSTORY:\n${userMessage}`;
    setSceneWriterInput('');
    
    // Add user message to UI
    setSceneWriterMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setSceneLoading(true);
    setError('');
    setSceneWriterMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    const onDelta = (delta: string) => {
      setSceneWriterMessages(prev => {
        const next = [...prev];
        const idx = next.length - 1;
        next[idx] = { role: 'assistant', content: next[idx].content + delta } as any;
        return next;
      });
    };
    const onEnd = () => {
      setSceneLoading(false);
    };
    const onError = (err: string) => {
      setError(err || 'Stream error');
      setSceneLoading(false);
    };
    try {
      await streamAgentRun(
        {
          agent_key: 'scene_writer_chat',
          prompt: convertPrompt,
          agent_name: 'Scene Writer Chatbot',
          instructions: sceneWriterSystemInstructions,
        },
        onDelta,
        undefined,
        onEnd,
        onError
      );
    } catch (e: any) {
      setError(e?.message || 'Failed to stream');
      setLoading(false);
    }
  };
  
  const clearSceneWriterChat = async () => {
    if (!sceneWriterSessionId) {
      setSceneWriterMessages([]);
      return;
    }
    
    try {
      await fetch(`${API_BASE_URL}/api/unified/clear-scene-writer-chat/${sceneWriterSessionId}?user_id=default`, {
        method: 'DELETE'
      });
      
      setSceneWriterMessages([]);
      setSceneWriterSessionId(null);
      setSuccess('Chat cleared!');
      loadChatSessions();
    } catch (err: any) {
      setError('Failed to clear chat');
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col sticky top-0 h-screen overflow-y-auto">
        {/* Logo/Title */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">Y</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              YouTube AI
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-2">
          <div className="space-y-1">
            {[
              { id: 'channels', icon: Tv, label: 'Channels' },
              { id: 'overview', icon: BarChart3, label: 'Overview' },
              { id: 'ideas', icon: Lightbulb, label: 'Video Ideas' },
              { id: 'titles', icon: Hash, label: 'Title Generator' },
              { id: 'roadmap', icon: Map, label: 'Content Roadmap' },
              { id: 'story-writer', icon: Book, label: 'Story Writer' },
              { id: 'scene-writer', icon: Film, label: 'Scene Writer' },
              
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = mounted && activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    if (typeof window !== 'undefined') {
                      window.localStorage.setItem('activeTab', tab.id as string);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-sm ${
                    isActive
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Chat History Section */}
        <div className="flex-1 px-3 py-2 overflow-y-auto">
          <div className="mb-3">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Chats
            </h3>
            <div className="space-y-1">
              {loadingSessions && (
                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">Loading…</div>
              )}
              {!loadingSessions && combinedSessions.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-400">No recent chats</div>
              )}
              {combinedSessions.map((s) => {
                const Icon = s.agent === 'scriptwriter' ? MessageSquare : Film;
                return (
                  <button
                    key={`${s.agent}-${s.session_id}`}
                    onClick={() => openSession(s.agent, s.session_id)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="w-4 h-4 flex-shrink-0 text-gray-400" />
                      <div className="min-w-0">
                        <div className="truncate">{s.preview || s.session_id}</div>
                        {s.last_activity && (
                          <div className="text-[10px] text-gray-400">{new Date(s.last_activity).toLocaleString()}</div>
                        )}
                      </div>
                      <span
                        title="Delete chat"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteChatSession(s.agent, s.session_id); }}
                        className="ml-auto p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">

          {/* <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/agents')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Agents</span>
            </button>
          </div> */}
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

        {/* Main Content */}
        {analyticsStatus?.has_analytics && (
          <>
            {/* Tab Content */}
            <div className="bg-transparent dark:bg-transparent rounded-none shadow-none p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">📊 Channel Overview</h2>
                  
                  {selectedChannel ? (
                    <div className="space-y-6">
                      {/* Selected Channel Card */}
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                        <div className="mb-6">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
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

                        {/* Statistics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
                        </div>
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
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
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

              {/* Script to Scene Tab */}
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

                  {/* Channel Analytics Summary (shown when channel_info is available) */}
                  {ideasResponse?.channel_info && (
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border-2 border-purple-300 dark:border-purple-700 shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-2xl">📊</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Channel Analytics Summary
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Real-time data powering your AI recommendations
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">📺</span>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Channel</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white truncate" title={ideasResponse.channel_info.channel_title}>
                            {ideasResponse.channel_info.channel_title}
                          </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">👥</span>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Subscribers</span>
                          </div>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {ideasResponse.channel_info.subscribers.toLocaleString()}
                          </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">📹</span>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Total Videos</span>
                          </div>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            {ideasResponse.channel_info.video_count.toLocaleString()}
                          </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">👁️</span>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Avg Views</span>
                          </div>
                          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            {ideasResponse.channel_info.avg_views ? Math.round(ideasResponse.channel_info.avg_views).toLocaleString() : 'N/A'}
                          </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">💎</span>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Avg Engagement</span>
                          </div>
                          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {ideasResponse.channel_info.avg_engagement ? (ideasResponse.channel_info.avg_engagement * 100).toFixed(2) + '%' : 'N/A'}
                          </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">🔄</span>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Last Updated</span>
                          </div>
                          <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                            {ideasResponse.channel_info.last_updated 
                              ? new Date(ideasResponse.channel_info.last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : 'Just now'}
                          </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">✨</span>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">AI Status</span>
                          </div>
                          <p className="text-sm font-bold text-green-600 dark:text-green-400">
                            {ideasResponse.analytics_used ? '✓ Analytics Active' : '○ Generic Mode'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <p className="text-xs text-purple-800 dark:text-purple-200">
                          <strong>💡 How This Helps:</strong> AI analyzes your channel's performance metrics to generate personalized video ideas that match your proven success patterns. The more data available, the better the recommendations!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Video Analytics Display - AI Data Source */}
                  {ideasResponse?.video_analytics && ideasResponse?.channel_info && (
                    <VideoAnalyticsDisplay
                      videoAnalytics={ideasResponse.video_analytics}
                      channelTitle={ideasResponse.channel_info.channel_title}
                    />
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
                      <SelectModal
                        label="Style"
                        value={ideasStyle}
                        onChange={setIdeasStyle}
                        options={[
                          { value: 'viral', label: 'Viral' },
                          { value: 'educational', label: 'Educational' },
                          { value: 'entertaining', label: 'Entertaining' },
                        ]}
                      />
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

                  {/* Video Analytics Display - AI Data Source */}
                  {titlesResponse?.video_analytics && titlesResponse?.channel_info && (
                    <VideoAnalyticsDisplay
                      videoAnalytics={titlesResponse.video_analytics}
                      channelTitle={titlesResponse.channel_info.channel_title}
                    />
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

              {/* Story Writer Tab */}
              {activeTab === 'story-writer' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">📖 Story Writer</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Provide topic and word count. First generate characters, their shapes, and an outline. Edit the outline, then generate the full story.
                  </p>

                  {/* Selected Channel Info (optional analytics influence) */}
                  {selectedChannel && (
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border-2 border-indigo-300 dark:border-indigo-700">
                      <div className="flex items-center gap-4">
                        <img
                          src={selectedChannel.thumbnail}
                          alt={selectedChannel.channel_title}
                          className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-800 shadow-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-lg">{selectedChannel.channel_title}</h4>
                            <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs font-bold rounded-full">
                              ✓ ACTIVE
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Story tone may align with this channel's style
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

                  {/* Step 1: Inputs and Plan Generation */}
                  <form onSubmit={handleGenerateStoryPlan} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Story Topic</label>
                        <input
                          type="text"
                          value={storyTopic}
                          onChange={(e) => setStoryTopic(e.target.value)}
                          placeholder="e.g., In a school, a teacher and students studying anaconda discover a mysterious egg..."
                          className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Total Words</label>
                        <input
                          type="number"
                          value={storyWords}
                          onChange={(e) => setStoryWords(Number(e.target.value))}
                          min={300}
                          max={5000}
                          className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <SelectModal
                        label="Language"
                        value={storyLanguage}
                        onChange={setStoryLanguage}
                        options={[
                          { value: 'english', label: 'English' },
                          { value: 'spanish', label: 'Spanish' },
                          { value: 'russian', label: 'Russian' },
                        ]}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loadingPlan || loadingStory || !storyTopic.trim()}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
                    >
                      {loadingPlan ? '⏳ Generating...' : '🧭 Generate Characters & Outline'}
                    </button>
                  </form>

                  {/* Plan Display */}
                  {storyPlan && (
                    <div className="mt-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <h3 className="font-semibold mb-2">Plan</h3>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {storyPlan}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Editable Outline */}
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 text-sm flex flex-wrap gap-4">
                      <div><span className="font-semibold">Topic:</span> {storyTopic || '-'}</div>
                      <div><span className="font-semibold">Words:</span> {storyWords}</div>
                      <div><span className="font-semibold">Language:</span> {storyLanguage}</div>
                    </div>
                    <label className="block text-sm font-medium">Edit Outline (optional)</label>
                    <textarea
                      rows={8}
                      value={storyOutline}
                      onChange={(e) => setStoryOutline(e.target.value)}
                      placeholder={`1. ...\n2. ...\n3. ...`}
                      className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700"
                    />
                  </div>

                  <button
                    onClick={handleGenerateFullStory}
                    disabled={loadingStory || loadingPlan || !storyOutline.trim() || !storyTopic.trim()}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 disabled:opacity-50"
                  >
                    {loadingStory ? '⏳ Generating...' : '✍️ Write Full Story'}
                  </button>

                  {/* Final Story */}
                  {finalStory && (
                    <div className="mt-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Final Story</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(finalStory, setCopiedStory)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            {copiedStory ? <Check size={16} /> : <Copy size={16} />}
                            {copiedStory ? 'Copied!' : 'Copy'}
                          </button>
                          <button
                            onClick={() => downloadAsPDF(finalStory, `Story-${storyTopic || 'untitled'}`)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            <Download size={16} />
                            Download PDF
                          </button>
                        </div>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                        {finalStory}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Scriptwriter Chat Tab */}
              {activeTab === 'scriptwriter' && (
                <div className="h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b-0">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scriptwriter</h1>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        AI-powered YouTube script generation
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={clearScriptwriterChat} 
                        className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                      {scriptwriterMessages.length === 0 && (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-2xl">✍️</span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Start Writing</h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-4">Ask for tips or say "Write a script about..."</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            <button 
                              onClick={() => {
                                setScriptwriterInput("Write a script about AI technology");
                                sendScriptwriterMessage();
                              }}
                              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              AI Script
                            </button>
                            <button 
                              onClick={() => {
                                setScriptwriterInput("How do I create engaging video hooks?");
                                sendScriptwriterMessage();
                              }}
                              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              Hook Tips
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {scriptwriterMessages.map((m, idx) => (
                        <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] ${
                            m.role === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
                          } rounded-2xl px-4 py-3 shadow-sm`}>
                            {m.role === 'assistant' ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {m.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                {m.content}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {sceneLoading && (
                    <div className="px-6">
                      <div className="max-w-4xl mx-auto mb-2">
                        <div className="w-full py-2 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 text-center text-sm font-medium">
                          ⏳ Generating...
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Input Area */}
                  <div className="pt-4">
                    <div className="max-w-4xl mx-auto">
                      <div className="relative">
                        <div className="flex items-end gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 shadow-sm">
                          <div className="flex-1">
                            <textarea
                              value={scriptwriterInput}
                              rows={1}
                              onChange={(e) => {
                                setScriptwriterInput(e.target.value);
                                e.currentTarget.style.height = 'auto';
                                e.currentTarget.style.height = Math.min(e.currentTarget.scrollHeight, 200) + 'px';
                              }}
                              onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                                const el = e.currentTarget;
                                el.style.height = 'auto';
                                el.style.height = Math.min(el.scrollHeight, 200) + 'px';
                              }}
                              onKeyDown={(e) => { 
                                if (e.key === 'Enter' && !e.shiftKey) { 
                                  e.preventDefault(); 
                                  sendScriptwriterMessage(); 
                                } 
                              }}
                              placeholder="Ask anything about scriptwriting..."
                              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none overflow-hidden leading-6 max-h-48"
                              style={{ minHeight: '44px' }}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                              <span className="text-lg">📎</span>
                            </button>
                            <button
                              onClick={sendScriptwriterMessage}
                              disabled={loading || !scriptwriterInput.trim()}
                              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {loading ? (
                                <span className="animate-spin text-sm">⏳</span>
                              ) : (
                                <span className="text-sm">➤</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scene Writer Chat Tab */}
              {activeTab === 'scene-writer' && (
                <div className="h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b-0">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scene Writer</h1>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Convert scripts to cinematic scenes
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Session: {sceneWriterSessionId ? 'Active' : 'New'}
                      </span>
                      <button 
                        onClick={clearSceneWriterChat} 
                        className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                      {sceneWriterMessages.length === 0 && (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-2xl">🎬</span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Start Creating</h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-4">Ask about cinematography or convert scripts to scenes</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            <button 
                              onClick={() => {
                                setSceneWriterInput("Explain different camera shot types");
                                sendSceneWriterMessage();
                              }}
                              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              Shot Types
                            </button>
                            <button 
                              onClick={() => {
                                setSceneWriterInput("Convert to scenes: A tech reviewer unboxes the latest smartphone");
                                sendSceneWriterMessage();
                              }}
                              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              Scene Example
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {sceneWriterMessages.map((m, idx) => (
                        <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] ${
                            m.role === 'user' 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
                          } rounded-2xl px-4 py-3 shadow-sm`}>
                            {m.role === 'assistant' ? (
                              (() => {
                                const prettyJson = formatJsonIfPossible(m.content);
                                if (prettyJson) {
                                  return (
                                    <pre className="text-xs md:text-sm bg-gray-900 text-green-200 rounded-lg p-3 overflow-auto max-h-[480px] whitespace-pre">
                                      <code>{prettyJson}</code>
                                    </pre>
                                  );
                                }
                                return (
                                  <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {m.content}
                                    </ReactMarkdown>
                                  </div>
                                );
                              })()
                            ) : (
                              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                {m.content}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="pt-6">
                    <div className="max-w-4xl mx-auto">
                      <div className="relative">
                        <div className="flex items-end gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 shadow-sm">
                          <div className="flex-1">
                            <textarea
                              value={sceneWriterInput}
                              rows={6}
                              onChange={(e) => setSceneWriterInput(e.target.value)}
                              onKeyDown={(e) => { 
                                if (e.key === 'Enter' && !e.shiftKey) { 
                                  e.preventDefault(); 
                                  sendSceneWriterMessage(); 
                                } 
                              }}
                              placeholder="Paste script to convert or ask about cinematography..."
                              className="w-full bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none h-32 overflow-y-auto leading-6"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={sendSceneWriterMessage}
                              disabled={sceneLoading || !sceneWriterInput.trim()}
                              className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {sceneLoading ? (
                                <span className="animate-spin text-sm">⏳</span>
                              ) : (
                                <span className="text-sm">➤</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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

                  {/* Video Analytics Display - AI Data Source */}
                  {roadmapResponse?.video_analytics && roadmapResponse?.channel_info && (
                    <VideoAnalyticsDisplay
                      videoAnalytics={roadmapResponse.video_analytics}
                      channelTitle={roadmapResponse.channel_info.channel_title}
                    />
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
    </div>
  );
}
