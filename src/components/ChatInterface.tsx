'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Bot, AlertCircle, Copy, Check, Bookmark, BookmarkCheck } from 'lucide-react';

interface Message {
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
}

interface SaveResponsePayload {
  content: string;
  agentId: number;
  agentName: string;
  agentCodename: string;
}

interface ChatInterfaceProps {
  agentId: number;
  agentName: string;
  agentCodename: string;
  onClose: () => void;
  onSubmit: (userInput: string, formData?: any) => Promise<{ success: boolean; result: string; error?: string }>;
  onSaveResponse?: (payload: SaveResponsePayload) => Promise<void>;
}

export default function ChatInterface({
  agentId,
  agentName,
  agentCodename,
  onClose,
  onSubmit,
  onSaveResponse
}: ChatInterfaceProps) {
  const getInitialMessage = (agentId: number, agentName: string): string => {
    const messages: { [key: number]: string } = {
      1: `${agentName} ready! 🎯 I'm smart enough to handle:

✅ Video URLs (I'll find the channel)
✅ Channel URLs (@username or full links)
✅ Channel handles or names
✅ General YouTube questions

Just tell me what you need - I'll figure it out! What would you like to know about YouTube?`,
      2: `${agentName} online! I analyze titles, thumbnails, and hooks. Share video URLs or ask me about what makes titles and thumbnails work.`,
      3: `${agentName} deployed! I write YouTube scripts. Tell me your topic or ask me about scriptwriting techniques.`,
      4: `${agentName} active! I convert scripts to visual scene prompts. Paste a script or discuss video production strategies with me.`,
      5: `${agentName} initialized! I generate winning title and thumbnail ideas. Tell me your niche or ask about viral content strategies.`,
      6: `${agentName} ready! I create 30-video content roadmaps. Share your niche or let's discuss content planning strategies.`
    };
    return messages[agentId] || `${agentName} ready for deployment.`;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: getInitialMessage(agentId, agentName),
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<Record<number, 'saving' | 'saved' | 'error'>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (copiedIndex === null) return;
    const timeout = setTimeout(() => setCopiedIndex(null), 2000);
    return () => clearTimeout(timeout);
  }, [copiedIndex]);

  const handleCopy = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
    } catch (error) {
      console.error('Clipboard copy failed', error);
    }
  };

  const scheduleSaveStatusClear = (index: number) => {
    setTimeout(() => {
      setSaveStatus(prev => {
        const { [index]: _removed, ...rest } = prev;
        return rest;
      });
    }, 2000);
  };

  const handleSave = async (content: string, index: number) => {
    if (!onSaveResponse) return;
    setSaveStatus(prev => ({ ...prev, [index]: 'saving' }));
    try {
      await onSaveResponse({
        content,
        agentId,
        agentName,
        agentCodename
      });
      setSaveStatus(prev => ({ ...prev, [index]: 'saved' }));
      scheduleSaveStatusClear(index);
    } catch (error) {
      console.error('Save response failed', error);
      setSaveStatus(prev => ({ ...prev, [index]: 'error' }));
      scheduleSaveStatusClear(index);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await onSubmit(input.trim());
      
      const agentMessage: Message = {
        role: response.success ? 'agent' : 'system',
        content: response.success ? response.result : (response.error || 'An error occurred'),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'system',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-military-darker/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[80vh] bg-military-dark border border-military-border rounded-lg flex flex-col shadow-lg">
        {/* Header */}
        <div className="border-b border-military-border p-4 flex items-center justify-between bg-military-darker/70">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-military-green" />
            <div>
              <h3 className="text-lg font-semibold text-military-orange tracking-wide uppercase">
                {agentCodename}
              </h3>
              <p className="text-xs text-military-muted font-mono">
                {agentName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-military-muted hover:text-military-orange transition-colors font-mono text-xs px-4 py-2 border border-military-border hover:border-military-orange rounded uppercase tracking-wide"
          >
            Close
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-military-dark/40">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role !== 'user' && (
                <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${
                  message.role === 'agent' 
                    ? 'bg-military-gray border border-military-border'
                    : 'bg-military-orange/20 border border-military-orange/40'
                }`}>
                  {message.role === 'agent' ? (
                    <Bot className="w-5 h-5 text-military-green" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-military-orange" />
                  )}
                </div>
              )}

              <div
                className={`relative max-w-[70%] rounded-md p-4 ${
                  message.role === 'user'
                    ? 'bg-military-gray border border-military-border'
                    : message.role === 'agent'
                    ? 'bg-military-dark/60 border border-military-border'
                    : 'bg-military-orange/10 border border-military-orange/30'
                }`}
              >
                <div className="absolute -top-3 right-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(message.content, index)}
                    className="inline-flex items-center gap-1 rounded bg-military-dark/70 border border-military-border px-2 py-1 text-[10px] font-mono uppercase tracking-wide text-military-muted hover:text-military-orange transition-colors"
                    aria-label="Copy message"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>

                  {message.role === 'agent' && onSaveResponse && (
                    <button
                      type="button"
                      onClick={() => handleSave(message.content, index)}
                      disabled={saveStatus[index] === 'saving'}
                      className={`inline-flex items-center gap-1 rounded bg-military-dark/70 border px-2 py-1 text-[10px] font-mono uppercase tracking-wide transition-colors ${
                        saveStatus[index] === 'saved'
                          ? 'border-military-green text-military-green'
                          : saveStatus[index] === 'error'
                          ? 'border-red-500 text-red-400 hover:text-red-300'
                          : 'border-military-border text-military-muted hover:text-military-green'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                      aria-label="Save response"
                    >
                      {saveStatus[index] === 'saving' ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Saving
                        </>
                      ) : saveStatus[index] === 'saved' ? (
                        <>
                          <BookmarkCheck className="h-3 w-3" />
                          Saved
                        </>
                      ) : saveStatus[index] === 'error' ? (
                        <>
                          <AlertCircle className="h-3 w-3" />
                          Retry
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-3 w-3" />
                          Save
                        </>
                      )}
                    </button>
                  )}
                </div>

                <p className="text-military-text text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <p className="text-xs text-military-muted mt-2 font-mono">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-military-gray border border-military-border flex items-center justify-center">
                  <User className="w-5 h-5 text-military-text" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-military-gray border border-military-border flex items-center justify-center">
                <Bot className="w-5 h-5 text-military-green" />
              </div>
              <div className="bg-military-dark/60 border border-military-border rounded-md p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-military-green animate-spin" />
                  <p className="text-military-muted text-sm font-mono">
                    Processing...
                  </p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-military-border p-4 bg-military-darker/70">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about YouTube, share URLs, or request analysis... (Shift+Enter for new line)"
              disabled={isLoading}
              rows={3}
              className="flex-1 bg-military-dark/60 border border-military-border rounded-md px-4 py-3 text-military-text placeholder-military-muted focus:outline-none focus:border-military-green resize-none font-mono text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-5 py-3 bg-military-green/20 border border-military-green hover:bg-military-green hover:text-military-dark text-military-text rounded-md font-mono text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-military-green/20 disabled:hover:text-military-text flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  SEND
                </>
              )}
            </button>
          </form>
          <p className="text-xs text-military-muted mt-2 font-mono">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(90, 135, 108, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(90, 135, 108, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(90, 135, 108, 0.5);
        }
      `}</style>
    </div>
  );
}
