'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Bot, AlertCircle, Copy, Check, Bookmark, BookmarkCheck, Download } from 'lucide-react';
import { formatAgentOutput } from '@/lib/formatters';
import MarkdownRenderer from './MarkdownRenderer';
import ScriptGeneratorForm, { ScriptFormData } from './ScriptGeneratorForm';
import SceneViewer from './SceneViewer';

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
      3: '', // No initial message for Agent 3 - form only
      4: `${agentName} active! I convert scripts to visual scene prompts. Paste a script or discuss video production strategies with me.`,
      5: `${agentName} initialized! I generate winning title and thumbnail ideas. Tell me your niche or ask about viral content strategies.`,
      6: `${agentName} ready! I create 30-video content roadmaps. Share your niche or let's discuss content planning strategies.`,
      7: `${agentName} deployed! 🔗 I fetch the latest 50 video links from any channel. Give me:

✅ Channel ID (UCxxxxxxxxx)
✅ Channel URL (@channelname or /channel/)
✅ Any video URL (I'll find the channel)
✅ Channel handle (@username)

I'll return a clean list of 50 video links with titles. What channel do you need videos from?`
    };
    // Return message directly without fallback for Agent 3
    if (agentId === 3) return '';
    return messages[agentId] || `${agentName} ready for deployment.`;
  };

  const initialMessage = getInitialMessage(agentId, agentName);
  const [messages, setMessages] = useState<Message[]>(
    initialMessage ? [{
      role: 'system' as const,
      content: initialMessage,
      timestamp: new Date()
    }] : []
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<Record<number, 'saving' | 'saved' | 'error'>>({});
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Only focus input for agents that have text input (not Agent 3)
    if (agentId !== 3) {
      inputRef.current?.focus();
    }
  }, [agentId]);

  useEffect(() => {
    if (copiedIndex === null) return;
    const timeout = setTimeout(() => setCopiedIndex(null), 2000);
    return () => clearTimeout(timeout);
  }, [copiedIndex]);

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

  const handleCopy = async (content: string, index: number) => {
    try {
      const cleanText = stripMarkdown(content);
      await navigator.clipboard.writeText(cleanText);
      setCopiedIndex(index);
    } catch (error) {
      console.error('Failed to copy', error);
    }
  };

  const handleDownloadPDF = async (content: string, index: number) => {
    try {
      setDownloadingIndex(index);
      
      // Dynamically import jsPDF to reduce bundle size
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;
      
      // Add header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(agentName, margin, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(new Date().toLocaleString(), margin, yPosition);
      yPosition += 15;
      
      // Clean markdown content
      const cleanContent = stripMarkdown(content);
      
      // Content
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      
      // Split content into lines and render
      const lines = doc.splitTextToSize(cleanContent, maxWidth);
      
      for (const line of lines) {
        // Check if we need a new page
        if (yPosition + 7 > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.text(line, margin, yPosition);
        yPosition += 7;
      }
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `${agentCodename}_${timestamp}.pdf`;
      
      // Download the PDF
      doc.save(filename);
      
    } catch (error) {
      console.error('Failed to generate PDF', error);
    } finally {
      setDownloadingIndex(null);
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
      // Keep 'saved' status permanently, don't clear it
      setSaveStatus(prev => ({ ...prev, [index]: 'saved' }));
    } catch (error) {
      console.error('Save response failed', error);
      setSaveStatus(prev => ({ ...prev, [index]: 'error' }));
      // Only clear error status after 2 seconds
      scheduleSaveStatusClear(index);
    }
  };

  const handleFormSubmit = async (formData: ScriptFormData) => {
    setIsLoading(true);
    
    // Create detailed user message showing all parameters
    const paramsSummary = [
      `📝 **Topic:** ${formData.topic}`,
      `📊 **Words:** ${formData.total_words}`,
      `🎭 **Tone:** ${formData.tone}`,
      `👥 **Audience:** ${formData.target_audience}`,
      formData.video_duration ? `⏱️ **Duration:** ${formData.video_duration} min` : '',
      `📋 **Structure:** ${formData.script_structure}`,
      formData.key_points.length > 0 ? `🔑 **Key Points:** ${formData.key_points.join(', ')}` : '',
      formData.additional_instructions ? `💡 **Notes:** ${formData.additional_instructions}` : ''
    ].filter(Boolean).join('\n');
    
    const userMessage: Message = {
      role: 'user',
      content: `**Script Generation Request**\n\n${paramsSummary}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await onSubmit('', formData);
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
    <>
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {agentName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {agentCodename}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-4 py-2 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg font-medium"
        >
          Close
        </button>
      </div>

      {/* Messages Area - includes form for Agent 3 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
          {/* Script Generator Form for Agent 3 */}
          {agentId === 3 && (
            <div className="mb-6">
              <ScriptGeneratorForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </div>
          )}

          {/* Chat Messages */}
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
                    ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                    : 'bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800'
                }`}>
                  {message.role === 'agent' ? (
                    <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  )}
                </div>
              )}

              <div
                className={`relative max-w-[70%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.role === 'agent'
                    ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                }`}
              >
                {message.role === 'agent' ? (
                  agentId === 4 ? (
                    <SceneViewer content={message.content} />
                  ) : (
                    <MarkdownRenderer content={message.content} />
                  )
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className={`text-xs ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(message.content, index)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                        message.role === 'user'
                          ? 'bg-blue-700 hover:bg-blue-800 text-white border border-blue-500'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                      }`}
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
                        disabled={saveStatus[index] === 'saving' || saveStatus[index] === 'saved'}
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                          saveStatus[index] === 'saved'
                            ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400'
                            : saveStatus[index] === 'error'
                            ? 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400'
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
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

                    {message.role === 'agent' && (
                      <button
                        type="button"
                        onClick={() => handleDownloadPDF(message.content, index)}
                        disabled={downloadingIndex === index}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Download PDF"
                      >
                        {downloadingIndex === index ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            PDF
                          </>
                        ) : (
                          <>
                            <Download className="h-3 w-3" />
                            PDF
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Processing...
                  </p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Hidden for Agent 3 (form-based) */}
        {agentId !== 3 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about YouTube, share URLs, or request analysis... (Shift+Enter for new line)"
                disabled={isLoading}
                rows={3}
                className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send
                  </>
                )}
              </button>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        )}
    </>
  );
}
