'use client';

import RLDashboard from '@/components/RLDashboard';
import { Brain, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RLSystemPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        {/* Header */}
        <div className="space-y-6">
          <button
            onClick={() => router.push('/agents')}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wide uppercase">Back to Command Center</span>
          </button>

          <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <Brain className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
                    RL System Monitor
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    Real-time reinforcement learning architecture · STM · LTM · Central Memory
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-500/30 dark:bg-blue-500/10">
                  <p className="text-xs uppercase tracking-wider text-blue-600/80 dark:text-blue-200/80">Refresh Cycle</p>
                  <p className="text-lg font-semibold text-blue-700 dark:text-white">30s</p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <p className="text-xs uppercase tracking-wider text-emerald-600/80 dark:text-emerald-200/80">Collective Mode</p>
                  <p className="text-lg font-semibold text-emerald-700 dark:text-white">Enabled</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <RLDashboard />

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm dark:border-blue-500/30 dark:bg-blue-500/10">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-200/90">
              STM (Short-Term Memory)
            </h3>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed dark:text-slate-200/80">
              Fast Redis-based storage for recent experiences with automatic expiry after 24 hours.
              Each agent maintains an isolated key prefix.
            </p>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm dark:border-purple-500/30 dark:bg-purple-500/10">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-200/90">
              LTM (Long-Term Memory)
            </h3>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed dark:text-slate-200/80">
              Persistent MongoDB storage capturing high-value actions (Q ≥ 0.8) with dedicated collections
              per agent for deep pattern retention.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm dark:border-amber-400/30 dark:bg-amber-400/10">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-200/90">
              Central Memory
            </h3>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed dark:text-slate-200/80">
              Shared MongoDB layer driving collective intelligence. Global insights and strategies are
              redistributed across the entire agent network.
            </p>
          </div>
        </div>

        {/* Architecture Diagram */}
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-slate-800/80 dark:bg-white/5 dark:backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 tracking-wide uppercase dark:text-white">
                Architecture Overview
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-300">
                Hybrid reinforcement workflow spanning seven specialist agents
              </p>
            </div>
            <div className="rounded-full border border-gray-200 bg-gray-100 px-4 py-2 text-xs uppercase tracking-wider text-gray-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200/80">
              In-memory + Persistent Fusion
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-slate-800/70 dark:bg-slate-950/60">
            <pre className="whitespace-pre-wrap text-xs leading-relaxed text-gray-700 p-6 font-mono dark:text-slate-200/80">
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
    </div>
  );
}
