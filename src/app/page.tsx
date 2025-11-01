'use client';

import { useState, useEffect } from 'react';
import {
  healthCheck,
  listNotes,
  createNote,
  getNote,
  updateNote,
  deleteNote,
  getNoteDownloadUrl,
  NoteSummary,
  NoteDetail,
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
  Activity,
  Terminal,
  Shield,
  Plus,
  Pencil,
  Trash2,
  Download as DownloadIcon,
  History
} from 'lucide-react';

export default function CommandCenter() {
  const [activeAgent, setActiveAgent] = useState<number | null>(null);
  const [missionTime, setMissionTime] = useState<string>(new Date().toLocaleTimeString());
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<NoteDetail | null>(null);
  const [editorName, setEditorName] = useState<string>('');
  const [editorContent, setEditorContent] = useState<string>('');
  const [noteStatus, setNoteStatus] = useState<'idle' | 'loading' | 'saving' | 'saved' | 'error'>('loading');
  const [noteMessage, setNoteMessage] = useState<string | null>(null);

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
    const initializeNotes = async () => {
      setNoteStatus('loading');
      try {
        const list = await listNotes();
        setNotes(list);
        if (list.length > 0) {
          await loadNote(list[0].id);
        } else {
          setSelectedNoteId(null);
          setSelectedNote(null);
          setEditorName('');
          setEditorContent('');
          setNoteStatus('idle');
        }
      } catch (error) {
        console.error('Failed to load notes', error);
        setNoteStatus('error');
        setNoteMessage(error instanceof Error ? error.message : 'Unable to load notes');
      }
    };

    initializeNotes();
  }, []);

  const loadNote = async (noteId: string) => {
    setNoteStatus('loading');
    try {
      const detail = await getNote(noteId);
      setSelectedNoteId(noteId);
      setSelectedNote(detail);
      setEditorName(detail.name);
      setEditorContent(detail.content);
      setNoteStatus('idle');
      setNoteMessage(null);
    } catch (error) {
      console.error('Failed to load note', error);
      setNoteStatus('error');
      setNoteMessage(error instanceof Error ? error.message : 'Unable to load note');
    }
  };

  const refreshNotes = async (noteId?: string | null) => {
    try {
      const list = await listNotes();
      setNotes(list);
      const targetId = noteId ?? selectedNoteId ?? (list.length > 0 ? list[0].id : null);
      if (targetId) {
        await loadNote(targetId);
      } else {
        setSelectedNoteId(null);
        setSelectedNote(null);
        setEditorName('');
        setEditorContent('');
        setNoteStatus('idle');
      }
    } catch (error) {
      console.error('Failed to refresh notes', error);
      setNoteStatus('error');
      setNoteMessage(error instanceof Error ? error.message : 'Unable to refresh notes');
    }
  };

  const handleSelectNote = async (noteId: string) => {
    if (noteId === selectedNoteId) return;
    await loadNote(noteId);
  };

  const handleCreateNote = async () => {
    const name = window.prompt('Enter note name', 'New Mission Brief');
    if (name === null) return;
    try {
      setNoteStatus('saving');
      const note = await createNote(name, '');
      await refreshNotes(note.id);
      setNoteStatus('saved');
      setTimeout(() => setNoteStatus('idle'), 1500);
    } catch (error) {
      console.error('Failed to create note', error);
      setNoteStatus('error');
      setNoteMessage(error instanceof Error ? error.message : 'Unable to create note');
    }
  };

  const handleRenameNote = async () => {
    if (!selectedNoteId || !selectedNote) return;
    const name = window.prompt('Rename note', editorName || selectedNote.name);
    if (name === null) return;
    try {
      setNoteStatus('saving');
      const updated = await updateNote(selectedNoteId, { name });
      setSelectedNote(updated);
      setEditorName(updated.name);
      await refreshNotes(updated.id);
      setNoteStatus('saved');
      setTimeout(() => setNoteStatus('idle'), 1500);
    } catch (error) {
      console.error('Failed to rename note', error);
      setNoteStatus('error');
      setNoteMessage(error instanceof Error ? error.message : 'Unable to rename note');
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNoteId) return;
    const confirmDelete = window.confirm('Delete this note? This action cannot be undone.');
    if (!confirmDelete) return;
    try {
      setNoteStatus('saving');
      await deleteNote(selectedNoteId);
      const remaining = notes.filter(note => note.id !== selectedNoteId);
      setNotes(remaining);
      const nextId = remaining.length > 0 ? remaining[0].id : null;
      if (nextId) {
        await loadNote(nextId);
      } else {
        setSelectedNoteId(null);
        setSelectedNote(null);
        setEditorName('');
        setEditorContent('');
        setNoteStatus('idle');
      }
    } catch (error) {
      console.error('Failed to delete note', error);
      setNoteStatus('error');
      setNoteMessage(error instanceof Error ? error.message : 'Unable to delete note');
    }
  };

  const handleContentChange = (value: string) => {
    setEditorContent(value);
    setNoteStatus('idle');
  };

  const handleNameChange = (value: string) => {
    setEditorName(value);
    setNoteStatus('idle');
  };

  const handleSaveNote = async () => {
    if (!selectedNoteId) return;
    try {
      setNoteStatus('saving');
      const updated = await updateNote(selectedNoteId, { name: editorName, content: editorContent });
      setSelectedNote(updated);
      setEditorName(updated.name);
      setEditorContent(updated.content);
      await refreshNotes(updated.id);
      setNoteStatus('saved');
      setTimeout(() => setNoteStatus('idle'), 1500);
    } catch (error) {
      console.error('Failed to save note', error);
      setNoteStatus('error');
      setNoteMessage(error instanceof Error ? error.message : 'Unable to save note');
    }
  };

  const handleDownloadNote = () => {
    if (!selectedNoteId) return;
    const url = getNoteDownloadUrl(selectedNoteId);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${editorName || 'note'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                    {/* Header */}
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

                    {/* Description */}
                    <p className="text-sm text-military-muted leading-relaxed">
                      {agent.description}
                    </p>

                    {/* Action Button */}
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

          {/* Command Notes */}
          <aside className="border border-military-border bg-military-dark/70 rounded-lg shadow-lg p-5 flex flex-col">
            <header className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wide text-military-orange">Command Notes</h3>
                <p className="text-xs text-military-muted">Maintain mission briefs, target dossiers, and tactical intel.</p>
                {noteStatus === 'error' && noteMessage && (
                  <p className="text-xs text-red-400 mt-2">{noteMessage}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleCreateNote}
                className="inline-flex items-center gap-2 px-3 py-2 border border-military-border rounded-md text-xs font-mono uppercase tracking-wide text-military-text hover:border-military-green hover:text-military-green transition-colors"
              >
                <Plus className="h-3 w-3" />
                New File
              </button>
            </header>

            <div className="flex flex-col lg:flex-row gap-4 flex-1">
              <div className="lg:w-56 flex-shrink-0">
                <div className="flex items-center justify-between text-xs font-mono text-military-muted uppercase">
                  <span>Files</span>
                  <span>{notes.length}</span>
                </div>
                <div className="mt-2 max-h-72 overflow-y-auto border border-military-border rounded-md bg-military-dark/60 p-2 space-y-2">
                  {notes.length > 0 ? (
                    notes.map((note) => {
                      const isActive = note.id === selectedNoteId;
                      return (
                        <button
                          key={note.id}
                          type="button"
                          onClick={() => handleSelectNote(note.id)}
                          className={`w-full text-left px-3 py-2 rounded-md border text-sm font-mono transition-colors ${
                            isActive
                              ? 'border-military-green bg-military-green/10 text-military-text'
                              : 'border-military-border text-military-muted hover:border-military-green hover:text-military-text'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate">{note.name}</span>
                            <span className="text-[10px] uppercase">#{notes.length - notes.indexOf(note)}</span>
                          </div>
                          <p className="mt-1 text-[10px] text-military-muted/80">
                            {note.updated_at ? new Date(note.updated_at).toLocaleString() : 'No updates'}
                          </p>
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-xs text-military-muted px-2 py-4 text-center border border-dashed border-military-border rounded-md">
                      No files yet. Create your first mission brief.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                {noteStatus === 'loading' && !selectedNoteId ? (
                  <div className="flex-1 flex items-center justify-center text-sm font-mono text-military-muted">
                    Loading note data...
                  </div>
                ) : selectedNoteId && selectedNote ? (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        value={editorName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="File name"
                        className="flex-1 bg-military-dark/60 border border-military-border rounded-md px-3 py-2 text-sm font-mono text-military-text placeholder-military-muted focus:outline-none focus:border-military-green"
                      />
                      <button
                        type="button"
                        onClick={handleRenameNote}
                        className="inline-flex items-center gap-1 px-2 py-2 border border-military-border rounded-md text-xs font-mono uppercase tracking-wide text-military-muted hover:border-military-green hover:text-military-green transition-colors"
                      >
                        <Pencil className="h-3 w-3" />
                        Rename
                      </button>
                    </div>

                    <textarea
                      value={editorContent}
                      onChange={(e) => handleContentChange(e.target.value)}
                      placeholder="Draft mission briefs, target notes, or operational reminders..."
                      className="flex-1 mt-3 bg-military-dark/60 border border-military-border rounded-md px-4 py-3 text-sm font-mono text-military-text placeholder-military-muted focus:outline-none focus:border-military-green resize-none"
                    />

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleSaveNote}
                        disabled={noteStatus === 'saving'}
                        className="inline-flex items-center gap-2 px-3 py-2 border border-military-green rounded-md text-xs font-mono uppercase tracking-wide text-military-text hover:bg-military-green/10 transition-colors disabled:opacity-60"
                      >
                        {noteStatus === 'saving' ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadNote}
                        className="inline-flex items-center gap-2 px-3 py-2 border border-military-border rounded-md text-xs font-mono uppercase tracking-wide text-military-muted hover:border-military-green hover:text-military-green transition-colors"
                      >
                        <DownloadIcon className="h-3 w-3" />
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteNote}
                        className="inline-flex items-center gap-2 px-3 py-2 border border-military-border rounded-md text-xs font-mono uppercase tracking-wide text-red-400 hover:border-red-400 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs font-mono text-military-muted">
                      <span>
                        {noteStatus === 'saved' && 'Saved'}
                        {noteStatus === 'idle' && 'Ready'}
                        {noteStatus === 'saving' && 'Saving...'}
                        {noteStatus === 'loading' && 'Loading...'}
                        {noteStatus === 'error' && 'Error'}
                      </span>
                      {selectedNote.updated_at && (
                        <span>Last update: {new Date(selectedNote.updated_at).toLocaleString()}</span>
                      )}
                    </div>

                    <div className="mt-4 border-t border-military-border pt-3">
                      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-military-muted">
                        <History className="h-3 w-3" />
                        Revision History
                      </div>
                      <div className="mt-2 max-h-36 overflow-y-auto space-y-2">
                        {selectedNote.history.length > 0 ? (
                          selectedNote.history.map((entry, idx) => (
                            <div
                              key={idx}
                              className="border border-military-border rounded-md px-3 py-2 text-xs text-military-muted bg-military-dark/60"
                            >
                              <p className="font-mono text-[11px] text-military-orange/80">
                                {entry.updated_at ? new Date(entry.updated_at).toLocaleString() : 'Unknown time'}
                              </p>
                              <p className="mt-1 whitespace-pre-wrap text-military-text/70">
                                {entry.content ? entry.content.slice(0, 200) + (entry.content.length > 200 ? '…' : '') : '[Empty]'}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-military-muted/70">No revisions yet. Save updates to build history.</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm font-mono text-military-muted text-center border border-dashed border-military-border rounded-md p-6">
                    Create or select a file to begin drafting mission intel.
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* Active Agent Chat Interface */}
        {activeAgent && (
          <ChatInterface
            agentId={activeAgent}
            agentName={agents.find(a => a.id === activeAgent)?.name || ''}
            agentCodename={agents.find(a => a.id === activeAgent)?.codename || ''}
            onClose={() => setActiveAgent(null)}
            onSubmit={async (userInput) => {
              return await handleAgentMessage(activeAgent, userInput);
            }}
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
