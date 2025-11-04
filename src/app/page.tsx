'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  healthCheck,
  listSavedResponses,
  createSavedResponse,
  getSavedResponse,
  updateSavedResponse,
  deleteSavedResponse,
  SavedResponseSummary,
  SavedResponseDetail
} from '@/lib/api';
import { handleAgentMessage } from '@/lib/agentHandlers';
import ChatInterface from '@/components/ChatInterface';
import {
  Target,
  FileSearch,
  FileText,
  Camera,
  Lightbulb,
  Map,
  Terminal,
  Shield,
  Loader2,
  Bookmark,
  BookmarkCheck,
  Pencil,
  Trash2,
  Copy,
  Download,
  Check
} from 'lucide-react';

export default function CommandCenter() {
  const router = useRouter();
  const [activeAgent, setActiveAgent] = useState<number | null>(null);
  const [missionTime, setMissionTime] = useState<string>(new Date().toLocaleTimeString());
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [savedResponses, setSavedResponses] = useState<SavedResponseSummary[]>([]);
  const [selectedSavedResponseId, setSelectedSavedResponseId] = useState<string | null>(null);
  const [selectedSavedResponse, setSelectedSavedResponse] = useState<SavedResponseDetail | null>(null);
  const [savedResponseStatus, setSavedResponseStatus] = useState<'idle' | 'loading' | 'saving' | 'error'>('idle');
  const [savedResponseMessage, setSavedResponseMessage] = useState<string | null>(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [copiedResponseId, setCopiedResponseId] = useState<string | null>(null);
  const [isResponseViewModalOpen, setIsResponseViewModalOpen] = useState(false);

  // Check API health on mount
  useEffect(() => {
    const checkApiHealth = async () => {
      const health = await healthCheck();
      setApiStatus(health.status === 'offline' || health.error ? 'offline' : 'online');
    };

    checkApiHealth();

    const interval = setInterval(checkApiHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setMissionTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchSavedResponses = async () => {
      try {
        setSavedResponseStatus('loading');
        const responses = await listSavedResponses();
        setSavedResponses(responses);
        setSavedResponseStatus('idle');
      } catch (error) {
        console.error('Failed to load saved responses', error);
        setSavedResponseStatus('error');
        setSavedResponseMessage(error instanceof Error ? error.message : 'Unable to load saved responses');
      }
    };

    fetchSavedResponses();
  }, []);

  const refreshSavedResponses = async (keepSelection: boolean = false) => {
    try {
      const responses = await listSavedResponses();
      setSavedResponses(responses);
      if (keepSelection && selectedSavedResponseId) {
        await handleSelectSavedResponse(selectedSavedResponseId);
      }
      setSavedResponseStatus('idle');
    } catch (error) {
      console.error('Failed to refresh saved responses', error);
      setSavedResponseStatus('error');
      setSavedResponseMessage(error instanceof Error ? error.message : 'Unable to refresh saved responses');
    }
  };

  const handleSelectSavedResponse = async (responseId: string) => {
    try {
      setSavedResponseStatus('loading');
      const detail = await getSavedResponse(responseId);
      setSelectedSavedResponseId(responseId);
      setSelectedSavedResponse(detail);
      setIsResponseViewModalOpen(true);
      setSavedResponseStatus('idle');
      setSavedResponseMessage(null);
    } catch (error) {
      console.error('Failed to load saved response', error);
      setSavedResponseStatus('error');
      setSavedResponseMessage(error instanceof Error ? error.message : 'Unable to load saved response');
    }
  };

  const handleSaveChatResponse = async (payload: { content: string; agentId: number; agentName: string; agentCodename: string }) => {
    try {
      setSavedResponseStatus('saving');
      await createSavedResponse({
        title: `${payload.agentCodename} Response`,
        content: payload.content,
        agent_id: payload.agentId,
        agent_name: payload.agentName,
        agent_codename: payload.agentCodename
      });
      await refreshSavedResponses(false);
      setSavedResponseStatus('idle');
    } catch (error) {
      console.error('Failed to save response', error);
      setSavedResponseStatus('error');
      setSavedResponseMessage(error instanceof Error ? error.message : 'Unable to save response');
      throw error;
    }
  };

  const handleUpdateSavedResponse = async (title?: string, content?: string) => {
    if (!selectedSavedResponseId) return;
    try {
      setSavedResponseStatus('saving');
      const updated = await updateSavedResponse(selectedSavedResponseId, { title, content });
      setSelectedSavedResponse(updated);
      await refreshSavedResponses(true);
      setSavedResponseStatus('idle');
    } catch (error) {
      console.error('Failed to update response', error);
      setSavedResponseStatus('error');
      setSavedResponseMessage(error instanceof Error ? error.message : 'Unable to update response');
    }
  };

  const handleDeleteSavedResponse = async () => {
    if (!selectedSavedResponseId) return;
    try {
      setSavedResponseStatus('saving');
      await deleteSavedResponse(selectedSavedResponseId);
      setSelectedSavedResponseId(null);
      setSelectedSavedResponse(null);
      setIsResponseViewModalOpen(false);
      setIsDeleteModalOpen(false);
      await refreshSavedResponses(false);
      setSavedResponseStatus('idle');
    } catch (error) {
      console.error('Failed to delete response', error);
      setSavedResponseStatus('error');
      setSavedResponseMessage(error instanceof Error ? error.message : 'Unable to delete response');
      setIsDeleteModalOpen(false);
    }
  };

  const handleCopyResponse = async (content: string, responseId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedResponseId(responseId);
      setTimeout(() => setCopiedResponseId(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard', error);
    }
  };

  const handleDownloadPDF = (title: string, content: string, agentName: string, createdAt?: string) => {
    // Create a simple HTML document for PDF-like download
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background: #1a1a1a;
      color: #e0e0e0;
    }
    .header {
      border-bottom: 2px solid #5c9a6f;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      color: #f4a261;
      font-size: 24px;
      margin: 0 0 10px 0;
    }
    .meta {
      color: #888;
      font-size: 12px;
    }
    .content {
      white-space: pre-wrap;
      line-height: 1.6;
      font-size: 14px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #333;
      text-align: center;
      color: #666;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="meta">
      <p>Agent: ${agentName}</p>
      <p>Created: ${createdAt ? new Date(createdAt).toLocaleString() : 'Unknown'}</p>
    </div>
  </div>
  <div class="content">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  <div class="footer">
    <p>Generated by YouTube Ops Command Center</p>
  </div>
</body>
</html>`;

    // Create a Blob and download it
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const agents = [
    {
      id: 1,
      name: 'CHANNEL AUDITOR',
      codename: 'AGENT-001',
      icon: Target,
      description: 'Deep channel reconnaissance to identify high-value targets',
      status: 'READY',
      color: 'text-military-green'
    },
    {
      id: 2,
      name: 'TITLE AUDITOR',
      codename: 'AGENT-002',
      icon: FileSearch,
      description: 'Pattern analysis: titles, thumbnails, keywords, hooks',
      status: 'READY',
      color: 'text-military-green'
    },
    {
      id: 3,
      name: 'SCRIPT WRITER',
      codename: 'AGENT-003',
      icon: FileText,
      description: 'Generate tactical content scripts from intelligence data',
      status: 'READY',
      color: 'text-military-green'
    },
    {
      id: 4,
      name: 'SCENE DIRECTOR',
      codename: 'AGENT-004',
      icon: Camera,
      description: 'Script-to-scene conversion with cinematic precision',
      status: 'READY',
      color: 'text-military-green'
    },
    {
      id: 5,
      name: 'IDEAS GENERATOR',
      codename: 'AGENT-005',
      icon: Lightbulb,
      description: 'Generate 3 winning titles + thumbnail battle plans',
      status: 'READY',
      color: 'text-military-green'
    },
    {
      id: 6,
      name: 'ROADMAP STRATEGIST',
      codename: 'AGENT-006',
      icon: Map,
      description: '30-video tactical roadmap with title/thumbnail variants',
      status: 'READY',
      color: 'text-military-green'
    },
  ];

  return (
    <div className="relative min-h-screen grid place-items-center grid-bg text-military-text overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="scan-line" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 p-8">
        <div className="relative flex items-center justify-center w-40 h-40 rounded-full border-4 border-military-green/60 bg-military-dark shadow-[0_0_40px_rgba(0,255,65,0.15)]">
          <div className="absolute inset-2 rounded-full border-2 border-military-green/40" />
          <Shield className="w-16 h-16 text-military-green" />
        </div>

        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-widest">
            <span className="text-military-orange">YOUTUBE</span> OPS COMMAND
          </h1>
          <p className="mt-2 text-military-muted font-mono uppercase text-xs tracking-wide">
            Tactical Content Warfare System v1.0
          </p>
        </div>

        <button
          onClick={() => {
            try { sessionStorage.setItem('enteredViaSplash', '1'); } catch {}
            router.push('/agents');
          }}
          className="group inline-flex items-center gap-3 px-8 py-3 rounded-md border border-military-green text-military-dark bg-military-green hover:bg-military-green/90 transition-colors font-mono uppercase tracking-wide text-sm shadow-[0_0_20px_rgba(0,255,65,0.15)]"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-military-dark group-hover:scale-110 transition-transform" />
          Start
        </button>
      </div>
    </div>
  );
}
