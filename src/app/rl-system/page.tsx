'use client';

import { useState } from 'react';
import RLDashboard from '@/components/RLDashboard';
import { Brain, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RLSystemPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen grid-bg text-military-text">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/agents')}
            className="flex items-center gap-2 text-military-muted hover:text-military-green transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono text-sm">Back to Command Center</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-military-green/10 border border-military-green/30 rounded-lg">
              <Brain className="w-8 h-8 text-military-green" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-military-green font-mono">
                RL SYSTEM MONITOR
              </h1>
              <p className="text-military-muted font-mono text-sm mt-1">
                Real-time Reinforcement Learning Architecture • STM • LTM • Central Memory
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <RLDashboard />

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-military-darker border border-blue-500/20 rounded-lg p-4">
            <h3 className="font-mono font-bold text-blue-400 mb-2 text-sm">
              STM (Short-Term Memory)
            </h3>
            <p className="text-xs text-military-muted leading-relaxed">
              Fast Redis-based storage for recent experiences. Auto-expires after 24 hours.
              Each agent has isolated key prefix.
            </p>
          </div>

          <div className="bg-military-darker border border-purple-500/20 rounded-lg p-4">
            <h3 className="font-mono font-bold text-purple-400 mb-2 text-sm">
              LTM (Long-Term Memory)
            </h3>
            <p className="text-xs text-military-muted leading-relaxed">
              Persistent MongoDB storage for high-value experiences (Q ≥ 0.8).
              Separate collections per agent.
            </p>
          </div>

          <div className="bg-military-darker border border-military-orange/20 rounded-lg p-4">
            <h3 className="font-mono font-bold text-military-orange mb-2 text-sm">
              Central Memory
            </h3>
            <p className="text-xs text-military-muted leading-relaxed">
              Shared MongoDB database for collective intelligence. Global insights
              distributed across all agents.
            </p>
          </div>
        </div>

        {/* Architecture Diagram */}
        <div className="mt-8 bg-military-darker border border-military-green/20 rounded-lg p-6">
          <h3 className="font-mono font-bold text-military-green mb-4">
            ARCHITECTURE OVERVIEW
          </h3>
          <pre className="text-xs font-mono text-military-muted leading-relaxed overflow-x-auto">
{`
┌─────────────────────────────────────────────────────────────┐
│                      7 YOUTUBE AGENTS                        │
├─────────────────────────────────────────────────────────────┤
│  Agent 1    Agent 2    Agent 3    Agent 4    Agent 5    ... │
└─────────────────────────────────────────────────────────────┘
           ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │   STM    │   │   LTM    │   │ RL Engine│
    │  Redis   │   │ MongoDB  │   │ Q-Learning│
    │ Isolated │   │ Isolated │   │ Isolated │
    └──────────┘   └──────────┘   └──────────┘
           ▼              ▼              ▼
    ┌─────────────────────────────────────────┐
    │      Central Memory (Shared)            │
    │  • Global Insights                      │
    │  • Cross-Agent Patterns                 │
    │  • Performance Leaderboard              │
    │  • Collective Strategies                │
    └─────────────────────────────────────────┘

HYBRID ARCHITECTURE:
✓ Individual Learning (STM/LTM/RL per agent)
✓ Collective Intelligence (Central Memory shared)
✓ Works WITHOUT databases (RL uses in-memory Q-tables)
`}
          </pre>
        </div>
      </div>
    </div>
  );
}
