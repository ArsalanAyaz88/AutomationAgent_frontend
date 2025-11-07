// 'use client';

// // COMMENTED OUT - Using /dashboard as main page
// /*

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import {
//   healthCheck,
//   listSavedResponses,
//   createSavedResponse,
//   getSavedResponse,
//   updateSavedResponse,
//   deleteSavedResponse,
//   SavedResponseSummary,
//   SavedResponseDetail
// } from '@/lib/api';
// import { handleAgentMessage } from '@/lib/agentHandlers';
// import ChatInterface from '@/components/ChatInterface';
// import {
//   Target,
//   FileSearch,
//   FileText,
//   Camera,
//   Lightbulb,
//   Map,
//   Terminal,
//   Shield,
//   Loader2,
//   Bookmark,
//   BookmarkCheck,
//   Pencil,
//   Trash2,
//   Copy,
//   Download,
//   Check,
//   Link,
//   Brain
// } from 'lucide-react';

// function AgentsPage_DISABLED() {
//   const router = useRouter();
//   const [activeAgent, setActiveAgent] = useState<number | null>(null);
//   const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
//   const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
//   const [savedResponses, setSavedResponses] = useState<SavedResponseSummary[]>([]);
//   const [selectedSavedResponseId, setSelectedSavedResponseId] = useState<string | null>(null);
//   const [selectedSavedResponse, setSelectedSavedResponse] = useState<SavedResponseDetail | null>(null);
//   const [savedResponseStatus, setSavedResponseStatus] = useState<'idle' | 'loading' | 'saving' | 'error'>('idle');
//   const [savedResponseMessage, setSavedResponseMessage] = useState<string | null>(null);
//   const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
//   const [renameValue, setRenameValue] = useState('');
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [copiedResponseId, setCopiedResponseId] = useState<string | null>(null);
//   const [isResponseViewModalOpen, setIsResponseViewModalOpen] = useState(false);

//   // Check API health on mount
//   useEffect(() => {
//     const checkApiHealth = async () => {
//       const health = await healthCheck();
//       setApiStatus(health.status === 'offline' || health.error ? 'offline' : 'online');
//     };

//     checkApiHealth();

//     const interval = setInterval(checkApiHealth, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   // Redirect logic - DISABLED for easier development access
//   // To enable: uncomment the redirect check below
//   useEffect(() => {
//     if (typeof window === 'undefined') return;
    
//     // Check if entered via splash
//     const fromSplash = (() => {
//       try { 
//         const flag = sessionStorage.getItem('enteredViaSplash');
//         console.log('🔍 Checking enteredViaSplash flag:', flag);
//         return flag === '1';
//       } catch { 
//         console.error('❌ Failed to read sessionStorage');
//         return false; 
//       }
//     })();
    
//     if (fromSplash) {
//       console.log('✅ Valid navigation from splash page - allowing access');
//       try { sessionStorage.removeItem('enteredViaSplash'); } catch {}
//       return; // valid navigation via Start
//     }

//     // REDIRECT DISABLED - Remove comment below to enable strict redirect
//     console.log('⚠️ Redirect check DISABLED - allowing direct access to /agents');
    
//     /* UNCOMMENT TO ENABLE REDIRECT:
//     // Check if this is a reload or direct access
//     const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
//     const nav = navEntries && navEntries[0];
//     const isReload = (nav && nav.type === 'reload') || (performance as any)?.navigation?.type === 1;
    
//     // Only check referrer if it's not from same origin
//     let isDirectOpen = false;
//     try {
//       if (document.referrer === '') {
//         isDirectOpen = true;
//       } else {
//         const referrerOrigin = new URL(document.referrer).origin;
//         isDirectOpen = referrerOrigin !== window.location.origin;
//       }
//     } catch {
//       isDirectOpen = document.referrer === '';
//     }
    
//     console.log('Navigation check:', { isReload, isDirectOpen, referrer: document.referrer });
    
//     if (isReload || isDirectOpen) {
//       console.log('🔄 Redirecting to splash page');
//       router.replace('/');
//     }
//     */
//   }, [router]);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date().toLocaleTimeString());
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const fetchSavedResponses = async () => {
//       try {
//         setSavedResponseStatus('loading');
//         const responses = await listSavedResponses();
//         setSavedResponses(responses);
//         setSavedResponseStatus('idle');
//       } catch (error) {
//         console.error('Failed to load saved responses', error);
//         setSavedResponseStatus('error');
//         setSavedResponseMessage(error instanceof Error ? error.message : 'Unable to load saved responses');
//       }
//     };

//     fetchSavedResponses();
//   }, []);

//   const refreshSavedResponses = async (keepSelection: boolean = false) => {
//     try {
//       const responses = await listSavedResponses();
//       setSavedResponses(responses);
//       if (keepSelection && selectedSavedResponseId) {
//         await handleSelectSavedResponse(selectedSavedResponseId);
//       }
//       setSavedResponseStatus('idle');
//     } catch (error) {
//       console.error('Failed to refresh saved responses', error);
//       setSavedResponseStatus('error');
//       setSavedResponseMessage(error instanceof Error ? error.message : 'Unable to refresh saved responses');
//     }
//   };

//   const handleSelectSavedResponse = async (responseId: string) => {
//     try {
//       setSavedResponseStatus('loading');
//       const detail = await getSavedResponse(responseId);
//       setSelectedSavedResponseId(responseId);
//       setSelectedSavedResponse(detail);
//       setIsResponseViewModalOpen(true);
//       setSavedResponseStatus('idle');
//       setSavedResponseMessage(null);
//     } catch (error) {
//       console.error('Failed to load saved response', error);
//       setSavedResponseStatus('error');
//       setSavedResponseMessage(error instanceof Error ? error.message : 'Unable to load saved response');
//     }
//   };

//   const handleSaveChatResponse = async (payload: { content: string; agentId: number; agentName: string; agentCodename: string }) => {
//     try {
//       setSavedResponseStatus('saving');
//       await createSavedResponse({
//         title: `${payload.agentCodename} Response`,
//         content: payload.content,
//         agent_id: payload.agentId,
//         agent_name: payload.agentName,
//         agent_codename: payload.agentCodename
//       });
//       await refreshSavedResponses(false);
//       setSavedResponseStatus('idle');
//     } catch (error) {
//       console.error('Failed to save response', error);
//       setSavedResponseStatus('error');
//       setSavedResponseMessage(error instanceof Error ? error.message : 'Unable to save response');
//       throw error;
//     }
//   };

//   const handleUpdateSavedResponse = async (title?: string, content?: string) => {
//     if (!selectedSavedResponseId) return;
//     try {
//       setSavedResponseStatus('saving');
//       const updated = await updateSavedResponse(selectedSavedResponseId, { title, content });
//       setSelectedSavedResponse(updated);
//       await refreshSavedResponses(true);
//       setSavedResponseStatus('idle');
//     } catch (error) {
//       console.error('Failed to update response', error);
//       setSavedResponseStatus('error');
//       setSavedResponseMessage(error instanceof Error ? error.message : 'Unable to update response');
//     }
//   };

//   const handleDeleteSavedResponse = async () => {
//     if (!selectedSavedResponseId) return;
//     try {
//       setSavedResponseStatus('saving');
//       await deleteSavedResponse(selectedSavedResponseId);
//       setSelectedSavedResponseId(null);
//       setSelectedSavedResponse(null);
//       setIsResponseViewModalOpen(false);
//       setIsDeleteModalOpen(false);
//       await refreshSavedResponses(false);
//       setSavedResponseStatus('idle');
//     } catch (error) {
//       console.error('Failed to delete response', error);
//       setSavedResponseStatus('error');
//       setSavedResponseMessage(error instanceof Error ? error.message : 'Unable to delete response');
//       setIsDeleteModalOpen(false);
//     }
//   };

//   const handleCopyResponse = async (content: string, responseId: string) => {
//     try {
//       await navigator.clipboard.writeText(content);
//       setCopiedResponseId(responseId);
//       setTimeout(() => setCopiedResponseId(null), 2000);
//     } catch (error) {
//       console.error('Failed to copy to clipboard', error);
//     }
//   };

//   const handleDownloadPDF = (title: string, content: string, agentName: string, createdAt?: string) => {
//     // Create a simple HTML document for PDF-like download
//     const htmlContent = `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <title>${title}</title>
//   <style>
//     body {
//       font-family: 'Courier New', monospace;
//       max-width: 800px;
//       margin: 40px auto;
//       padding: 20px;
//       background: #1a1a1a;
//       color: #e0e0e0;
//     }
//     .header {
//       border-bottom: 2px solid #5c9a6f;
//       padding-bottom: 20px;
//       margin-bottom: 30px;
//     }
//     h1 {
//       color: #f4a261;
//       font-size: 24px;
//       margin: 0 0 10px 0;
//     }
//     .meta {
//       color: #888;
//       font-size: 12px;
//     }
//     .content {
//       white-space: pre-wrap;
//       line-height: 1.6;
//       font-size: 14px;
//     }
//     .footer {
//       margin-top: 40px;
//       padding-top: 20px;
//       border-top: 1px solid #333;
//       text-align: center;
//       color: #666;
//       font-size: 11px;
//     }
//   </style>
// </head>
// <body>
//   <div class="header">
//     <h1>${title}</h1>
//     <div class="meta">
//       <p>Agent: ${agentName}</p>
//       <p>Created: ${createdAt ? new Date(createdAt).toLocaleString() : 'Unknown'}</p>
//     </div>
//   </div>
//   <div class="content">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
//   <div class="footer">
//     <p>Generated by YouTube Ops Command Center</p>
//   </div>
// </body>
// </html>`;

//     // Create a Blob and download it
//     const blob = new Blob([htmlContent], { type: 'text/html' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };

//   const agents = [
//     {
//       id: 1,
//       name: 'Channel Auditor',
//       codename: 'Agent 1',
//       icon: Target,
//       description: 'Analyze and audit YouTube channels for insights',
//       status: 'Ready'
//     },
//     {
//       id: 2,
//       name: 'Video Auditor',
//       codename: 'Agent 2',
//       icon: FileSearch,
//       description: 'Analyze video titles, thumbnails, and keywords',
//       status: 'Ready'
//     },
//     {
//       id: 3,
//       name: 'Script Writer',
//       codename: 'Agent 3',
//       icon: FileText,
//       description: 'Generate content scripts based on analytics',
//       status: 'Ready'
//     },
//     {
//       id: 4,
//       name: 'Scene Director',
//       codename: 'Agent 4',
//       icon: Camera,
//       description: 'Convert scripts into detailed scene breakdowns',
//       status: 'Ready'
//     },
//     {
//       id: 5,
//       name: 'Ideas Generator',
//       codename: 'Agent 5',
//       icon: Lightbulb,
//       description: 'Generate video ideas with titles and thumbnails',
//       status: 'Ready'
//     },
//     {
//       id: 6,
//       name: 'Roadmap Strategist',
//       codename: 'Agent 6',
//       icon: Map,
//       description: 'Create content roadmaps with strategic planning',
//       status: 'Ready'
//     },
//     {
//       id: 7,
//       name: 'Video Fetcher',
//       codename: 'Agent 7',
//       icon: Link,
//       description: 'Fetch latest videos from any YouTube channel',
//       status: 'Ready'
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
//       {/* Left Sidebar - Agents & Saved Responses */}
//       <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
//         {/* Logo/Title */}
//         <div className="p-6 border-b border-gray-200 dark:border-gray-700">
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//             AI Agents
//           </h1>
//           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//             Select an agent
//           </p>
//         </div>

//         {/* Navigation - Agents List */}
//         <nav className="p-4 space-y-1">
//           <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Agents</h3>
//           {agents.map((agent) => {
//             const Icon = agent.icon;
//             const isActive = activeAgent === agent.id;
//             return (
//               <button
//                 key={agent.id}
//                 onClick={() => setActiveAgent(isActive ? null : agent.id)}
//                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all font-medium ${
//                   isActive
//                     ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
//                     : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//                 }`}
//               >
//                 <Icon className="w-5 h-5" />
//                 <div className="flex-1 min-w-0">
//                   <span className="block truncate">{agent.name}</span>
//                 </div>
//               </button>
//             );
//           })}
//         </nav>

//         {/* Saved Responses Section */}
//         <div className="flex-1 flex flex-col border-t border-gray-200 dark:border-gray-700 overflow-hidden">
//           <div className="p-4">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Saved Responses</h3>
//               <button
//                 type="button"
//                 onClick={() => refreshSavedResponses()}
//                 className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium"
//               >
//                 <Loader2 className={`h-3 w-3 ${savedResponseStatus === 'loading' ? 'animate-spin' : ''}`} />
//                 Refresh
//               </button>
//             </div>
//             {savedResponseStatus === 'error' && savedResponseMessage && (
//               <p className="text-xs text-red-500 mb-2">{savedResponseMessage}</p>
//             )}
//           </div>

//           <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
//             {savedResponses.length > 0 ? (
//               savedResponses.map((response) => {
//                 return (
//                   <button
//                     key={response.id}
//                     type="button"
//                     onClick={() => handleSelectSavedResponse(response.id)}
//                     className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
//                   >
//                     <div className="flex items-start justify-between gap-2">
//                       <span className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">{response.title}</span>
//                       <BookmarkCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
//                     </div>
//                     <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
//                       {response.updated_at ? new Date(response.updated_at).toLocaleDateString() : 'No date'}
//                     </p>
//                   </button>
//                 );
//               })
//             ) : (
//               <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
//                 <BookmarkCheck className="h-8 w-8 text-gray-400 mx-auto mb-2" />
//                 <p className="text-xs text-gray-500 dark:text-gray-400 px-2">
//                   No saved responses yet
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Footer - Analytics Dashboard Button */}
//         <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
//           <button
//             onClick={() => router.push('/rl-system')}
//             className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg font-medium transition-colors"
//           >
//             <Brain className="w-4 h-4" />
//             <span>RL Dashboard</span>
//           </button>
//           <button
//             onClick={() => router.push('/dashboard')}
//             className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
//           >
//             <Terminal className="w-4 h-4" />
//             <span>Analytics Dashboard</span>
//           </button>
          
//           {/* API Status */}
//           <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
//             <div
//               className={`w-2 h-2 rounded-full ${
//                 apiStatus === 'online'
//                   ? 'bg-green-500'
//                   : apiStatus === 'offline'
//                   ? 'bg-red-500'
//                   : 'bg-yellow-500 animate-pulse'
//               }`}
//             />
//             <span>API: {apiStatus}</span>
//           </div>
//         </div>
//       </div>

//       {/* Main Content Area - Chat Interface */}
//       <div className="flex-1 overflow-hidden flex flex-col">
//         {activeAgent ? (
//           <ChatInterface
//             agentId={activeAgent}
//             agentName={agents.find(a => a.id === activeAgent)?.name || ''}
//             agentCodename={agents.find(a => a.id === activeAgent)?.codename || ''}
//             onClose={() => setActiveAgent(null)}
//             onSubmit={async (userInput, formData) => {
//               return await handleAgentMessage(activeAgent, userInput, formData);
//             }}
//             onSaveResponse={handleSaveChatResponse}
//           />
//         ) : (
//           <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
//             <div className="text-center">
//               <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
//                 YouTube AI Agents
//               </h2>
//               <p className="text-gray-600 dark:text-gray-400">
//                 Select an agent from the sidebar to start
//               </p>
//               <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
//                 {currentTime}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Response View Modal */}
//         {isResponseViewModalOpen && selectedSavedResponse && (
//             <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
//               <div className="w-full max-w-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg flex flex-col max-h-[85vh]">
//                 {/* Modal Header */}
//                 <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
//                   <div>
//                     <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedSavedResponse.title}</h3>
//                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                       {selectedSavedResponse.agent_name} • {selectedSavedResponse.updated_at ? new Date(selectedSavedResponse.updated_at).toLocaleString() : 'Not updated'}
//                     </p>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => setIsResponseViewModalOpen(false)}
//                     className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-4 py-2 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg font-medium"
//                   >
//                     Close
//                   </button>
//                 </div>

//                 {/* Modal Content */}
//                 <div className="flex-1 overflow-y-auto p-4">
//                   <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
//                     {selectedSavedResponse.content}
//                   </div>
//                 </div>

//                 {/* Modal Actions */}
//                 <div className="border-t border-gray-200 dark:border-gray-700 p-4">
//                   <div className="flex items-center gap-2 flex-wrap justify-end">
//                     <button
//                       type="button"
//                       onClick={() => handleCopyResponse(selectedSavedResponse.content, selectedSavedResponse.id)}
//                       className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//                     >
//                       {copiedResponseId === selectedSavedResponse.id ? (
//                         <>
//                           <Check className="h-4 w-4" />
//                           Copied
//                         </>
//                       ) : (
//                         <>
//                           <Copy className="h-4 w-4" />
//                           Copy
//                         </>
//                       )}
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => handleDownloadPDF(
//                         selectedSavedResponse.title,
//                         selectedSavedResponse.content,
//                         selectedSavedResponse.agent_name,
//                         selectedSavedResponse.created_at ?? undefined
//                       )}
//                       className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//                     >
//                       <Download className="h-4 w-4" />
//                       Download
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setRenameValue(selectedSavedResponse.title);
//                         setIsRenameModalOpen(true);
//                       }}
//                       className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//                     >
//                       <Pencil className="h-4 w-4" />
//                       Rename
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setIsDeleteModalOpen(true)}
//                       className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
//                     >
//                       <Trash2 className="h-4 w-4" />
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//         {/* Delete Confirmation Modal */}
//         {isDeleteModalOpen && selectedSavedResponse && (
//             <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
//               <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg shadow-lg p-6">
//                 <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">
//                   Delete Saved Response
//                 </h3>
//                 <p className="text-gray-900 dark:text-gray-100 text-sm mb-2">
//                   Are you sure you want to delete <span className="font-semibold">"{selectedSavedResponse.title}"</span>?
//                 </p>
//                 <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
//                   This action cannot be undone.
//                 </p>
//                 <div className="flex gap-3 justify-end">
//                   <button
//                     type="button"
//                     onClick={() => setIsDeleteModalOpen(false)}
//                     className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="button"
//                     onClick={handleDeleteSavedResponse}
//                     disabled={savedResponseStatus === 'saving'}
//                     className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {savedResponseStatus === 'saving' ? 'Deleting...' : 'Delete'}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//         {/* Rename Modal */}
//         {isRenameModalOpen && selectedSavedResponse && (
//             <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
//               <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6">
//                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
//                   Rename Response
//                 </h3>
//                 <input
//                   type="text"
//                   value={renameValue}
//                   onChange={(e) => setRenameValue(e.target.value)}
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter') {
//                       handleUpdateSavedResponse(renameValue);
//                       setIsRenameModalOpen(false);
//                     }
//                   }}
//                   className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
//                   placeholder="Enter new name"
//                   autoFocus
//                 />
//                 <div className="flex gap-3 justify-end">
//                   <button
//                     type="button"
//                     onClick={() => setIsRenameModalOpen(false)}
//                     className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       handleUpdateSavedResponse(renameValue);
//                       setIsRenameModalOpen(false);
//                     }}
//                     className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
//                   >
//                     OK
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//       </div>
//     </div>
//   );
// }
// */

// // Placeholder - This page is disabled. Use /dashboard instead.
// export default function AgentsPage() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
//       <div className="text-center">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
//           Page Disabled
//         </h1>
//         <p className="text-gray-600 dark:text-gray-400">
//           This page is currently disabled. Please use <a href="/dashboard" className="text-blue-600 hover:underline">/dashboard</a> instead.
//         </p>
//       </div>
//     </div>
//   );
// }
