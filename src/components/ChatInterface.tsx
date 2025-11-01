'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Bot, AlertCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  agentId: number;
  agentName: string;
  agentCodename: string;
  onClose: () => void;
  onSubmit: (userInput: string, formData?: any) => Promise<{ success: boolean; result: string; error?: string }>;
}

export default function ChatInterface({ 
  agentId, 
  agentName, 
  agentCodename,
  onClose,
  onSubmit 
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
    <div className="fixed inset-0 z-50 bg-military-darker/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[80vh] bg-military-dark border-2 border-military-green/50 rounded-lg flex flex-col shadow-[0_0_50px_rgba(0,255,65,0.3)]">
        {/* Header */}
        <div className="border-b-2 border-military-green/30 p-4 flex items-center justify-between bg-military-darker/50">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-military-green rounded-full animate-pulse" />
            <div>
              <h3 className="text-lg font-bold text-military-orange">
                {agentCodename}
              </h3>
              <p className="text-sm text-military-green/70 font-mono">
                {agentName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-military-green hover:text-military-orange transition-colors font-mono text-sm px-4 py-2 border border-military-green/50 hover:border-military-orange rounded"
          >
            [ CLOSE ]
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role !== 'user' && (
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                  message.role === 'agent' 
                    ? 'bg-military-green/20 border border-military-green/50'
                    : 'bg-military-orange/20 border border-military-orange/50'
                }`}>
                  {message.role === 'agent' ? (
                    <Bot className="w-5 h-5 text-military-green" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-military-orange" />
                  )}
                </div>
              )}

              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-military-green/10 border border-military-green/30'
                    : message.role === 'agent'
                    ? 'bg-military-dark border border-military-green/20'
                    : 'bg-military-orange/10 border border-military-orange/30'
                }`}
              >
                <p className="text-military-green/90 text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <p className="text-xs text-military-green/40 mt-2 font-mono">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-military-green/20 border border-military-green/50 flex items-center justify-center">
                  <User className="w-5 h-5 text-military-green" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-military-green/20 border border-military-green/50 flex items-center justify-center">
                <Bot className="w-5 h-5 text-military-green" />
              </div>
              <div className="bg-military-dark border border-military-green/20 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-military-green animate-spin" />
                  <p className="text-military-green/70 text-sm font-mono">
                    Processing...
                  </p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t-2 border-military-green/30 p-4 bg-military-darker/50">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about YouTube, share URLs, or request analysis... (Shift+Enter for new line)"
              disabled={isLoading}
              rows={3}
              className="flex-1 bg-military-dark border border-military-green/30 rounded-lg px-4 py-3 text-military-green placeholder-military-green/40 focus:outline-none focus:border-military-green/60 resize-none font-mono text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-military-green/20 border-2 border-military-green hover:bg-military-green hover:text-military-dark text-military-green rounded-lg font-mono font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-military-green/20 disabled:hover:text-military-green flex items-center gap-2"
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
          <p className="text-xs text-military-green/40 mt-2 font-mono">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 255, 65, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 65, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 65, 0.5);
        }
      `}</style>
    </div>
  );
}
