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
        return <CheckCircle className="w-5 h-5 text-military-green" />;
      case 'partially_operational':
        return <AlertCircle className="w-5 h-5 text-military-orange" />;
      default:
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (connected: boolean, type: 'stm' | 'ltm' | 'rl') => {
    const colors = {
      stm: connected ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      ltm: connected ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      rl: connected ? 'bg-military-green/20 text-military-green border-military-green/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-mono border ${colors[type]}`}>
        {connected ? '● ACTIVE' : '○ OFFLINE'}
      </span>
    );
  };

  if (loading && !systemStatus) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-military-green" />
        <span className="ml-3 text-military-muted font-mono">Loading RL System...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Overview Header */}
      <div className="bg-military-darker border border-military-green/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-military-green" />
            <div>
              <h2 className="text-2xl font-bold text-military-green font-mono">
                RL SYSTEM DASHBOARD
              </h2>
              <p className="text-sm text-military-muted">
                Reinforcement Learning Memory Architecture
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              loadSystemStatus();
              loadCentralInsights();
            }}
            className="p-2 hover:bg-military-green/10 rounded transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-military-green" />
          </button>
        </div>

        {systemStatus && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-military-dark/50 border border-military-green/20 rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                {getHealthIcon(systemStatus.system_health)}
                <span className="text-sm text-military-muted font-mono">SYSTEM</span>
              </div>
              <p className="text-2xl font-bold text-military-green">
                {systemStatus.system_health.replace('_', ' ').toUpperCase()}
              </p>
            </div>

            <div className="bg-military-dark/50 border border-blue-500/20 rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-military-muted font-mono">AGENTS</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">
                {systemStatus.operational_agents} / {systemStatus.total_agents}
              </p>
            </div>

            <div className="bg-military-dark/50 border border-purple-500/20 rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-military-muted font-mono">CENTRAL MEMORY</span>
              </div>
              <p className="text-2xl font-bold text-purple-400">
                {systemStatus.central_memory_connected ? 'CONNECTED' : 'OFFLINE'}
              </p>
            </div>

            <div className="bg-military-dark/50 border border-military-orange/20 rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-military-orange" />
                <span className="text-sm text-military-muted font-mono">INSIGHTS</span>
              </div>
              <p className="text-2xl font-bold text-military-orange">
                {centralInsights?.total_global_insights || 0}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Agents List */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-military-green font-mono uppercase">
          Agent Memory Systems
        </h3>
        
        {systemStatus?.agents.map((agent) => (
          <div
            key={agent.agent_name}
            className="bg-military-darker border border-military-green/20 rounded-lg overflow-hidden"
          >
            {/* Agent Header */}
            <button
              onClick={() => toggleAgentExpand(agent.agent_name)}
              className="w-full p-4 flex items-center justify-between hover:bg-military-dark/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Brain className="w-6 h-6 text-military-green" />
                <div className="text-left">
                  <h4 className="font-mono font-bold text-military-green">
                    {agent.agent_name.toUpperCase()}
                  </h4>
                  <p className="text-xs text-military-muted">
                    {agent.agent_type} • {agent.capabilities.length} capabilities
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {getStatusBadge(agent.stm_status.connected, 'stm')}
                {getStatusBadge(agent.ltm_status.connected, 'ltm')}
                {getStatusBadge(agent.rl_engine_status.active, 'rl')}
                
                {expandedAgents.has(agent.agent_name) ? (
                  <ChevronUp className="w-5 h-5 text-military-muted" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-military-muted" />
                )}
              </div>
            </button>

            {/* Agent Details (Expanded) */}
            {expandedAgents.has(agent.agent_name) && (
              <div className="border-t border-military-green/20 p-4 bg-military-dark/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* STM Status */}
                  <div className="bg-military-darker/50 border border-blue-500/20 rounded p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-blue-400" />
                      <h5 className="font-mono font-bold text-blue-400 text-sm">
                        STM (Short-Term)
                      </h5>
                    </div>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-military-muted">Storage:</span>
                        <span className="text-blue-400">
                          {agent.stm_status.storage_type.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-military-muted">Key Prefix:</span>
                        <span className="text-blue-400 truncate ml-2">
                          {agent.stm_status.key_prefix}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* LTM Status */}
                  <div className="bg-military-darker/50 border border-purple-500/20 rounded p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Database className="w-5 h-5 text-purple-400" />
                      <h5 className="font-mono font-bold text-purple-400 text-sm">
                        LTM (Long-Term)
                      </h5>
                    </div>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-military-muted">Database:</span>
                        <span className="text-purple-400">{agent.ltm_status.database}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-military-muted">Collections:</span>
                        <span className="text-purple-400">
                          {agent.ltm_status.collections.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RL Engine Status */}
                  <div className="bg-military-darker/50 border border-military-green/20 rounded p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-military-green" />
                      <h5 className="font-mono font-bold text-military-green text-sm">
                        RL Engine
                      </h5>
                    </div>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-military-muted">Learning Rate:</span>
                        <span className="text-military-green">
                          {agent.rl_engine_status.learning_rate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-military-muted">Epsilon:</span>
                        <span className="text-military-green">
                          {agent.rl_engine_status.epsilon}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-military-muted">Avg Reward:</span>
                        <span className="text-military-green">
                          {agent.rl_engine_status.avg_reward.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="mt-4 pt-4 border-t border-military-green/10">
                  <h6 className="text-xs font-mono text-military-muted mb-2">CAPABILITIES:</h6>
                  <div className="flex flex-wrap gap-2">
                    {agent.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="px-2 py-1 bg-military-green/10 border border-military-green/20 rounded text-xs font-mono text-military-green"
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
        <div className="bg-military-darker border border-purple-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-bold text-purple-400 font-mono">
              CENTRAL MEMORY INSIGHTS
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Insights */}
            <div className="bg-military-dark/30 border border-purple-500/20 rounded p-4">
              <h4 className="text-sm font-mono text-purple-400 mb-3">TOP INSIGHTS</h4>
              <div className="space-y-2">
                {centralInsights.top_insights.slice(0, 3).map((insight, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-military-muted">{insight.insight_type}</span>
                    <span className="text-purple-400">
                      {(insight.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Leaderboard */}
            <div className="bg-military-dark/30 border border-military-orange/20 rounded p-4">
              <h4 className="text-sm font-mono text-military-orange mb-3">
                PERFORMANCE LEADERBOARD
              </h4>
              <div className="space-y-2">
                {centralInsights.performance_leaderboard.slice(0, 3).map((entry) => (
                  <div
                    key={entry.agent_id}
                    className="flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-military-muted">
                      #{entry.rank} {entry.agent_id}
                    </span>
                    <span className="text-military-orange">
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
