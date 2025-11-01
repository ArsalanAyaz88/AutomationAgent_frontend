'use client';

import { useState, useEffect } from 'react';
import { healthCheck } from '@/lib/api';
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
  Shield
} from 'lucide-react';

export default function CommandCenter() {
  const [activeAgent, setActiveAgent] = useState<number | null>(null);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // Check API health on mount
  useEffect(() => {
    const checkApiHealth = async () => {
      const health = await healthCheck();
      setApiStatus(health.status === 'offline' || health.error ? 'offline' : 'online');
    };
    
    checkApiHealth();
    
    // Check every 30 seconds
    const interval = setInterval(checkApiHealth, 30000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-military-darker grid-bg relative">
      {/* Header */}
      <header className="border-b-2 border-military-green/30 bg-military-dark/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-10 h-10 text-military-green animate-pulse-glow" />
              <div>
                <h1 className="text-2xl font-bold tracking-wider">
                  <span className="text-military-orange">YOUTUBE</span>{' '}
                  <span className="text-military-green">OPS COMMAND</span>
                </h1>
                <p className="text-xs text-military-green/60 font-mono">
                  TACTICAL CONTENT WARFARE SYSTEM v1.0
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* API Status */}
              <div className="flex items-center gap-2">
                <Activity className={`w-5 h-5 ${
                  apiStatus === 'online' ? 'text-military-green animate-pulse' : 
                  apiStatus === 'checking' ? 'text-military-orange animate-pulse' : 
                  'text-red-500'
                }`} />
                <span className="text-sm font-mono">
                  API: {apiStatus.toUpperCase()}
                </span>
              </div>
              
              {/* Mission Time */}
              <div className="font-mono text-sm text-military-green/80">
                <span className="text-military-orange">MISSION TIME:</span>{' '}
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Mission Briefing */}
        <div className="mb-8 border border-military-green/30 bg-military-dark/50 p-6 rounded-lg">
          <div className="flex items-start gap-4">
            <Terminal className="w-6 h-6 text-military-orange mt-1" />
            <div>
              <h2 className="text-xl font-bold text-military-orange mb-2">
                [ MISSION BRIEFING ]
              </h2>
              <p className="text-military-green/80 leading-relaxed">
                6 AI AGENTS DEPLOYED FOR YOUTUBE AUTOMATION WARFARE.
                SELECT AN AGENT TO DEPLOY TACTICAL OPERATIONS.
                ALL SYSTEMS OPERATIONAL. AWAITING COMMAND INPUT.
              </p>
            </div>
          </div>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const isActive = activeAgent === agent.id;
            
            return (
              <div
                key={agent.id}
                onClick={() => setActiveAgent(isActive ? null : agent.id)}
                className={`
                  border-2 transition-all duration-300 cursor-pointer
                  rounded-lg p-6 relative overflow-hidden group
                  ${
                    isActive
                      ? 'border-military-green bg-military-green/10 shadow-[0_0_30px_rgba(0,255,65,0.3)]'
                      : 'border-military-green/30 bg-military-dark/50 hover:border-military-green/60 hover:bg-military-green/5'
                  }
                `}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="w-full h-full" style={{
                    backgroundImage: `radial-gradient(circle, rgba(0,255,65,0.3) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                  }} />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg border ${
                        isActive
                          ? 'border-military-green bg-military-green/20'
                          : 'border-military-green/40 bg-military-green/10'
                      }`}>
                        <Icon className="w-6 h-6 text-military-green" />
                      </div>
                      <div>
                        <h3 className="text-sm font-mono text-military-orange">
                          {agent.codename}
                        </h3>
                        <p className="text-lg font-bold text-military-green">
                          {agent.name}
                        </p>
                      </div>
                    </div>
                    <div className={`
                      text-xs font-mono px-2 py-1 rounded border
                      ${agent.status === 'READY'
                        ? 'border-military-green/50 text-military-green bg-military-green/10'
                        : 'border-military-orange/50 text-military-orange bg-military-orange/10'
                      }
                    `}>
                      {agent.status}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-military-green/70 leading-relaxed mb-4">
                    {agent.description}
                  </p>

                  {/* Action Button */}
                  <button
                    className={`
                      w-full py-2 px-4 rounded font-mono text-sm font-bold
                      transition-all duration-200
                      ${
                        isActive
                          ? 'bg-military-green text-military-dark border-2 border-military-green'
                          : 'bg-military-dark border-2 border-military-green/50 text-military-green hover:bg-military-green/10'
                      }
                    `}
                  >
                    {isActive ? '[ ACTIVE ]' : '[ DEPLOY ]'}
                  </button>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-military-green rounded-full animate-ping" />
                    <div className="w-3 h-3 bg-military-green rounded-full absolute top-0" />
                  </div>
                )}
              </div>
            );
          })}
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
        <div className="mt-12 border-t-2 border-military-green/20 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-mono text-military-green/60">
            <div>
              <span className="text-military-orange">SYSTEM:</span> OPERATIONAL
            </div>
            <div>
              <span className="text-military-orange">AGENTS:</span> 6/6 READY
            </div>
            <div>
              <span className="text-military-orange">CLEARANCE:</span> TOP SECRET
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
