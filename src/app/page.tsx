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
  Terminal,
  Shield
} from 'lucide-react';

export default function CommandCenter() {
  const [activeAgent, setActiveAgent] = useState<number | null>(null);
  const [missionTime, setMissionTime] = useState<string>(new Date().toLocaleTimeString());
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');

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

        {/* Operations Protocol */}
        <section className="border border-military-border bg-military-dark/70 p-6 rounded-lg shadow-lg">
          <div className="flex items-start gap-4">
            <Terminal className="w-6 h-6 text-military-orange mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-military-orange uppercase tracking-wide mb-2">Operations Protocol</h3>
              <p className="text-sm text-military-muted leading-relaxed">
                Deploy agents as needed, monitor API status, and coordinate mission timelines. Maintain communication
                discipline when multiple agents are active to prevent conflicting directives.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-military-muted/90 list-disc pl-5">
                <li>Confirm the API is online before initiating multi-agent operations.</li>
                <li>Use the mission briefing to align team priorities ahead of deployment.</li>
                <li>Document actionable insights in external systems for long-term tracking.</li>
              </ul>
            </div>
          </div>
        </section>

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
