'use client';

import { useState, useEffect } from 'react';
import {
  getRLSystemStatus,
  getAgentLearningStats,
  getCentralMemoryInsights,
  RLSystemStatus,
  AgentLearningStats,
  CentralMemoryInsights,
} from '@/lib/api';
import {
  Brain,
  Database,
  Zap,
  TrendingUp,
  Activity,
  Award,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function RLDashboard() {
  const [systemStatus, setSystemStatus] = useState<RLSystemStatus | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agentStats, setAgentStats] = useState<AgentLearningStats | null>(null);
  const [centralInsights, setCentralInsights] = useState<CentralMemoryInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

  const loadSystemStatus = async () => {
    setLoading(true);
    const status = await getRLSystemStatus();
    setSystemStatus(status);
    setLoading(false);
  };

  const loadAgentStats = async (agentName: string) => {
    const stats = await getAgentLearningStats(agentName);
    setAgentStats(stats);
    setSelectedAgent(agentName);
  };

  const loadCentralInsights = async () => {
    const insights = await getCentralMemoryInsights();
    setCentralInsights(insights);
  };

  useEffect(() => {
    loadSystemStatus();
    loadCentralInsights();
    
    const interval = setInterval(() => {
      loadSystemStatus();
      loadCentralInsights();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const toggleAgentExpand = (agentName: string) => {
    const newExpanded = new Set(expandedAgents);
    if (newExpanded.has(agentName)) {
      newExpanded.delete(agentName);
    } else {
      newExpanded.add(agentName);
      loadAgentStats(agentName);
    }
    setExpandedAgents(newExpanded);
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'fully_operational':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'partially_operational':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default:
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (connected: boolean, type: 'stm' | 'ltm' | 'rl') => {
    const colors = {
      stm: connected ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      ltm: connected ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      rl: connected ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${colors[type]}`}>
        {connected ? '● ACTIVE' : '○ OFFLINE'}
      </span>
    );
  };

  if (loading && !systemStatus) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-sm text-gray-500">Loading RL System...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Overview Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                RL System Dashboard
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Reinforcement learning memory architecture status
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              loadSystemStatus();
              loadCentralInsights();
            }}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-300"
            aria-label="Refresh RL system data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {systemStatus && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/70 p-4">
              <div className="flex items-center gap-2 mb-3">
                {getHealthIcon(systemStatus.system_health)}
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">System</span>
              </div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {systemStatus.system_health.replace('_', ' ').toUpperCase()}
              </p>
            </div>

            <div className="rounded-xl border border-blue-200/60 dark:border-blue-500/40 bg-blue-50/60 dark:bg-blue-500/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600/80 dark:text-blue-300">Agents</span>
              </div>
              <p className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                {systemStatus.operational_agents} / {systemStatus.total_agents}
              </p>
            </div>

            <div className="rounded-xl border border-purple-200/60 dark:border-purple-500/40 bg-purple-50/60 dark:bg-purple-500/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold uppercase tracking-wide text-purple-600/80 dark:text-purple-300">Central Memory</span>
              </div>
              <p className="text-xl font-semibold text-purple-700 dark:text-purple-300">
                {systemStatus.central_memory_connected ? 'CONNECTED' : 'OFFLINE'}
              </p>
            </div>

            <div className="rounded-xl border border-amber-200/60 dark:border-amber-500/40 bg-amber-50/60 dark:bg-amber-500/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wide text-amber-600/80 dark:text-amber-300">Insights</span>
              </div>
              <p className="text-xl font-semibold text-amber-600 dark:text-amber-300">
                {centralInsights?.total_global_insights || 0}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Agents List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Agent Memory Systems
        </h3>
        
        {systemStatus?.agents.map((agent) => (
          <div
            key={agent.agent_name}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-md"
          >
            {/* Agent Header */}
            <button
              onClick={() => toggleAgentExpand(agent.agent_name)}
              className="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-4 text-left">
                <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div className="text-left">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                    {agent.agent_name.toUpperCase()}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {agent.agent_type} • {agent.capabilities.length} capabilities
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {getStatusBadge(agent.stm_status.connected, 'stm')}
                {getStatusBadge(agent.ltm_status.connected, 'ltm')}
                {getStatusBadge(agent.rl_engine_status.active, 'rl')}
                
                {expandedAgents.has(agent.agent_name) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Agent Details (Expanded) */}
            {expandedAgents.has(agent.agent_name) && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-5 bg-gray-50 dark:bg-gray-900/60">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* STM Status */}
                  <div className="rounded-xl border border-blue-200/60 dark:border-blue-500/30 bg-white dark:bg-gray-900 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h5 className="text-sm font-semibold text-blue-600 dark:text-blue-300">
                        STM (Short-Term)
                      </h5>
                    </div>
                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                      <div className="flex justify-between">
                        <span>Storage:</span>
                        <span className="text-blue-600 dark:text-blue-300 font-medium">
                          {agent.stm_status.storage_type.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Key Prefix:</span>
                        <span className="text-blue-600 dark:text-blue-300 truncate ml-2 font-medium">
                          {agent.stm_status.key_prefix}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* LTM Status */}
                  <div className="rounded-xl border border-purple-200/60 dark:border-purple-500/30 bg-white dark:bg-gray-900 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h5 className="text-sm font-semibold text-purple-600 dark:text-purple-300">
                        LTM (Long-Term)
                      </h5>
                    </div>
                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                      <div className="flex justify-between">
                        <span>Database:</span>
                        <span className="text-purple-600 dark:text-purple-300 font-medium">{agent.ltm_status.database}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Collections:</span>
                        <span className="text-purple-600 dark:text-purple-300 font-medium">
                          {agent.ltm_status.collections.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RL Engine Status */}
                  <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-500/30 bg-white dark:bg-gray-900 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <h5 className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                        RL Engine
                      </h5>
                    </div>
                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                      <div className="flex justify-between">
                        <span>Learning Rate:</span>
                        <span className="text-emerald-600 dark:text-emerald-300 font-medium">
                          {agent.rl_engine_status.learning_rate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Epsilon:</span>
                        <span className="text-emerald-600 dark:text-emerald-300 font-medium">
                          {agent.rl_engine_status.epsilon}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Reward:</span>
                        <span className="text-emerald-600 dark:text-emerald-300 font-medium">
                          {agent.rl_engine_status.avg_reward.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <h6 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Capabilities</h6>
                  <div className="flex flex-wrap gap-2">
                    {agent.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-600 dark:text-emerald-300"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Central Memory Insights */}
      {centralInsights && centralInsights.total_global_insights > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-purple-200/60 dark:border-purple-500/30 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
              Central Memory Insights
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Insights */}
            <div className="rounded-xl border border-purple-200/60 dark:border-purple-500/30 bg-purple-50/60 dark:bg-purple-500/10 p-4">
              <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3 uppercase tracking-wide">Top Insights</h4>
              <div className="space-y-2 text-xs text-purple-800 dark:text-purple-200">
                {centralInsights.top_insights.slice(0, 3).map((insight, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between"
                  >
                    <span className="text-purple-700/80 dark:text-purple-200/80">{insight.insight_type}</span>
                    <span className="font-semibold">
                      {(insight.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Leaderboard */}
            <div className="rounded-xl border border-amber-200/60 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/10 p-4">
              <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-3 uppercase tracking-wide">
                Performance Leaderboard
              </h4>
              <div className="space-y-2 text-xs text-amber-900 dark:text-amber-200">
                {centralInsights.performance_leaderboard.slice(0, 3).map((entry) => (
                  <div
                    key={entry.agent_id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-amber-700/80 dark:text-amber-200/80">
                      #{entry.rank} {entry.agent_id}
                    </span>
                    <span className="font-semibold">
                      {(entry.overall_score * 100).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
