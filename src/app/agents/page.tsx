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
  Check,
  Link
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

  // Redirect logic - DISABLED for easier development access
  // To enable: uncomment the redirect check below
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if entered via splash
    const fromSplash = (() => {
      try { 
        const flag = sessionStorage.getItem('enteredViaSplash');
        console.log('🔍 Checking enteredViaSplash flag:', flag);
        return flag === '1';
      } catch { 
        console.error('❌ Failed to read sessionStorage');
        return false; 
      }
    })();
    
    if (fromSplash) {
      console.log('✅ Valid navigation from splash page - allowing access');
      try { sessionStorage.removeItem('enteredViaSplash'); } catch {}
      return; // valid navigation via Start
    }

    // REDIRECT DISABLED - Remove comment below to enable strict redirect
    console.log('⚠️ Redirect check DISABLED - allowing direct access to /agents');
    
    /* UNCOMMENT TO ENABLE REDIRECT:
    // Check if this is a reload or direct access
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const nav = navEntries && navEntries[0];
    const isReload = (nav && nav.type === 'reload') || (performance as any)?.navigation?.type === 1;
    
    // Only check referrer if it's not from same origin
    let isDirectOpen = false;
    try {
      if (document.referrer === '') {
        isDirectOpen = true;
      } else {
        const referrerOrigin = new URL(document.referrer).origin;
        isDirectOpen = referrerOrigin !== window.location.origin;
      }
    } catch {
      isDirectOpen = document.referrer === '';
    }
    
    console.log('Navigation check:', { isReload, isDirectOpen, referrer: document.referrer });
    
    if (isReload || isDirectOpen) {
      console.log('🔄 Redirecting to splash page');
      router.replace('/');
    }
    */
  }, [router]);

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
      name: 'Video AUDITOR',
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
    {
      id: 7,
      name: '50 VIDEOS FETCHER',
      codename: 'AGENT-007',
      icon: Link,
      description: 'Fetch latest 50 video links from any YouTube channel',
      status: 'READY',
      color: 'text-military-green'
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-military-darker via-military-gray to-military-dark text-military-text overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-80 mix-blend-lighten">
        <div className="absolute -inset-20 animate-smoke bg-[radial-gradient(circle_at_top,_rgba(92,154,111,0.12)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 animate-smoke [animation-delay:8s] bg-[radial-gradient(circle_at_bottom,_rgba(63,111,83,0.1)_0%,_transparent_55%)]" />
      </div>
      {/* Header */}
      <header className="border-b border-military-border/60 bg-military-dark/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-9 h-9 text-military-green" />
              <div>
                <h1 className="text-2xl font-semibold tracking-wide text-military-text">
                  <span className="text-military-orange">YOUTUBE</span>{' '}
                  <span className="text-military-green">OPS COMMAND</span>
                </h1>
                <p className="text-xs text-military-muted font-mono uppercase">
                  Tactical Content Warfare System v1.0
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* API Status */}
              <div className="flex items-center gap-2 text-sm font-mono text-military-muted">
                <span
                  className={`inline-flex h-2.5 w-2.5 rounded-full ${
                    apiStatus === 'online' ? 'bg-military-green' :
                    apiStatus === 'checking' ? 'bg-military-orange' : 'bg-military-red'
                  }`}
                />
                <span>
                  API: {apiStatus.toUpperCase()}
                </span>
              </div>
              
              {/* Mission Time */}
              <div className="font-mono text-sm text-military-muted">
                <span className="text-military-orange tracking-wide">MISSION TIME:</span>{' '}
                {missionTime}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-10">
        {/* Mission Briefing */}
        <div className="border border-military-border bg-military-dark/70 p-6 rounded-lg shadow-lg">
          <div className="flex items-start gap-4">
            <Terminal className="w-6 h-6 text-military-orange mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-military-orange mb-2 tracking-wide uppercase">
                Mission Briefing
              </h2>
              <p className="text-military-muted leading-relaxed">
                Deploy six coordinated AI units for comprehensive YouTube intelligence and operational planning.
                Select an asset to initiate reconnaissance, analytics, or strategic execution.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
          {/* Agent Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {agents.map((agent) => {
              const Icon = agent.icon;
              const isActive = activeAgent === agent.id;

              return (
                <div
                  key={agent.id}
                  onClick={() => setActiveAgent(isActive ? null : agent.id)}
                  className={`
                    border transition-colors duration-200 cursor-pointer
                    rounded-lg p-6 h-full flex flex-col justify-between
                    ${
                      isActive
                        ? 'border-military-green bg-military-gray/40'
                        : 'border-military-border bg-military-dark/70 hover:border-military-green'
                    }
                  `}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-md border ${
                          isActive
                            ? 'border-military-green bg-military-green/10'
                            : 'border-military-border bg-military-gray'
                        }`}>
                          <Icon className="w-6 h-6 text-military-green" />
                        </div>
                        <div>
                          <h3 className="text-xs font-mono tracking-wide text-military-orange uppercase">
                            {agent.codename}
                          </h3>
                          <p className="text-lg font-semibold text-military-text">
                            {agent.name}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-military-muted border border-military-border rounded px-2 py-1 uppercase">
                        {agent.status}
                      </span>
                    </div>

                    <p className="text-sm text-military-muted leading-relaxed">
                      {agent.description}
                    </p>

                    <button
                      className={`
                        w-full py-2 px-4 rounded font-mono text-sm font-semibold
                        transition-colors duration-200
                        ${
                          isActive
                            ? 'bg-military-green text-military-dark border border-military-green'
                            : 'bg-transparent border border-military-border text-military-muted hover:border-military-green hover:text-military-text'
                        }
                      `}
                    >
                      {isActive ? 'Active' : 'Deploy'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Saved Responses Sidebar */}
          <aside className="border border-military-border bg-military-dark/70 rounded-lg shadow-lg p-5 flex flex-col">
            <header className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wide text-military-orange">Saved Responses</h3>
                <p className="text-xs text-military-muted">Bookmark agent intel for later reuse.</p>
                {savedResponseStatus === 'error' && savedResponseMessage && (
                  <p className="text-xs text-red-400 mt-1">{savedResponseMessage}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => refreshSavedResponses()}
                className="inline-flex items-center gap-2 px-3 py-2 border border-military-border rounded-md text-xs font-mono uppercase tracking-wide text-military-text hover:border-military-green hover:text-military-green transition-colors"
              >
                <Loader2 className={`h-3 w-3 ${savedResponseStatus === 'loading' ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </header>

            <div className="flex-1 flex flex-col gap-4 min-h-0">
              <div className="flex-1 border border-military-border rounded-md bg-military-dark/60 p-3 overflow-y-auto space-y-2 max-h-[calc(100vh-400px)]">
                {savedResponses.length > 0 ? (
                  savedResponses.map((response) => {
                    return (
                      <button
                        key={response.id}
                        type="button"
                        onClick={() => handleSelectSavedResponse(response.id)}
                        className="w-full text-left px-3 py-2 rounded-md border text-sm font-mono transition-colors border-military-border text-military-muted hover:border-military-green hover:text-military-text"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate">{response.title}</span>
                          <BookmarkCheck className="h-3 w-3 text-military-orange" />
                        </div>
                        <p className="mt-1 text-[10px] text-military-muted/80">
                          {response.updated_at ? new Date(response.updated_at).toLocaleString() : 'Never updated'}
                        </p>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-military-muted px-2 py-4 text-center border border-dashed border-military-border rounded-md">
                    Saved responses will appear here once you save an agent output.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* Response View Modal */}
        {isResponseViewModalOpen && selectedSavedResponse && (
          <div className="fixed inset-0 z-50 bg-military-darker/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-military-dark border border-military-border rounded-lg shadow-lg flex flex-col max-h-[85vh]">
              {/* Modal Header */}
              <div className="border-b border-military-border p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-mono uppercase tracking-wide text-military-orange">{selectedSavedResponse.title}</h3>
                  <p className="text-xs text-military-muted mt-1">
                    {selectedSavedResponse.agent_name} • {selectedSavedResponse.updated_at ? new Date(selectedSavedResponse.updated_at).toLocaleString() : 'Not updated'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResponseViewModalOpen(false)}
                  className="text-military-muted hover:text-military-orange transition-colors font-mono text-xs px-4 py-2 border border-military-border hover:border-military-orange rounded uppercase tracking-wide"
                >
                  Close
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="text-sm font-mono text-military-text whitespace-pre-wrap break-words border border-military-border rounded-md bg-military-dark/70 p-4">
                  {selectedSavedResponse.content}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="border-t border-military-border p-4">
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <button
                    type="button"
                    onClick={() => handleCopyResponse(selectedSavedResponse.content, selectedSavedResponse.id)}
                    className="inline-flex items-center gap-1 px-3 py-2 border border-military-border rounded-md text-xs font-mono uppercase tracking-wide text-military-muted hover:border-military-green hover:text-military-green transition-colors"
                  >
                    {copiedResponseId === selectedSavedResponse.id ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadPDF(
                      selectedSavedResponse.title,
                      selectedSavedResponse.content,
                      selectedSavedResponse.agent_name,
                      selectedSavedResponse.created_at ?? undefined
                    )}
                    className="inline-flex items-center gap-1 px-3 py-2 border border-military-border rounded-md text-xs font-mono uppercase tracking-wide text-military-muted hover:border-military-green hover:text-military-green transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRenameValue(selectedSavedResponse.title);
                      setIsRenameModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 border border-military-border rounded-md text-xs font-mono uppercase tracking-wide text-military-muted hover:border-military-green hover:text-military-green transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-2 border border-military-border rounded-md text-xs font-mono uppercase tracking-wide text-red-400 hover:border-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedSavedResponse && (
          <div className="fixed inset-0 z-50 bg-military-darker/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-military-dark border border-red-500/50 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-red-400 tracking-wide uppercase mb-4">
                Delete Saved Response
              </h3>
              <p className="text-military-text text-sm mb-2">
                Are you sure you want to delete <span className="text-military-orange font-semibold">"{selectedSavedResponse.title}"</span>?
              </p>
              <p className="text-military-muted text-xs mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-military-dark border border-military-border hover:border-military-green text-military-muted hover:text-military-green rounded-md font-mono text-sm transition-colors uppercase"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSavedResponse}
                  disabled={savedResponseStatus === 'saving'}
                  className="px-4 py-2 bg-red-500/20 border border-red-500 hover:bg-red-500 hover:text-white text-red-400 rounded-md font-mono text-sm font-semibold transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savedResponseStatus === 'saving' ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rename Modal */}
        {isRenameModalOpen && selectedSavedResponse && (
          <div className="fixed inset-0 z-50 bg-military-darker/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-military-dark border border-military-border rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-military-orange tracking-wide uppercase mb-4">
                Rename File
              </h3>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateSavedResponse(renameValue);
                    setIsRenameModalOpen(false);
                  }
                }}
                className="w-full bg-military-dark/60 border border-military-border rounded-md px-4 py-3 text-military-text placeholder-military-muted focus:outline-none focus:border-military-green font-mono text-sm mb-4"
                placeholder="Enter new name"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsRenameModalOpen(false)}
                  className="px-4 py-2 bg-military-dark border border-military-border hover:border-military-orange text-military-muted hover:text-military-orange rounded-md font-mono text-sm transition-colors uppercase"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateSavedResponse(renameValue);
                    setIsRenameModalOpen(false);
                  }}
                  className="px-4 py-2 bg-military-green/20 border border-military-green hover:bg-military-green hover:text-military-dark text-military-text rounded-md font-mono text-sm font-semibold transition-colors uppercase"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Agent Chat Interface */}
        {activeAgent && (
          <ChatInterface
            agentId={activeAgent}
            agentName={agents.find(a => a.id === activeAgent)?.name || ''}
            agentCodename={agents.find(a => a.id === activeAgent)?.codename || ''}
            onClose={() => setActiveAgent(null)}
            onSubmit={async (userInput, formData) => {
              return await handleAgentMessage(activeAgent, userInput, formData);
            }}
            onSaveResponse={handleSaveChatResponse}
          />
        )}

        {/* System Info Footer */}
        <div className="border-t border-military-border pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-mono text-military-muted">
            <div className="uppercase tracking-wide">
              <span className="text-military-orange">System:</span> Operational
            </div>
            <div className="uppercase tracking-wide">
              <span className="text-military-orange">Agents:</span> 6/6 Ready
            </div>
            <div className="uppercase tracking-wide">
              <span className="text-military-orange">Clearance:</span> Top Secret
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
