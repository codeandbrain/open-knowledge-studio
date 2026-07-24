/**
 * A2AMetricsDashboard — Telemetry and observability dashboard with SVG charts.
 * @license SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { A2AMetric } from '../types';
import { BarChart, LineChart, StatCard } from './charts/SimpleCharts';
import { Activity, Zap, Clock, AlertTriangle } from './icons/lucide-shim';

interface Props {
  metrics: A2AMetric[];
  agents: { id: string; name: string; color: string; avatar: string }[];
}

export const A2AMetricsDashboard: React.FC<Props> = ({ metrics, agents }) => {
  // Calculate stats
  const totalMetrics = metrics.length;
  const avgLatency = totalMetrics > 0 ? Math.round(metrics.reduce((s, m) => s + m.latencyMs, 0) / totalMetrics) : 0;
  const successRate = totalMetrics > 0 ? Math.round((metrics.filter((m) => m.status === 'success').length / totalMetrics) * 100) : 100;
  const totalTokens = metrics.reduce((s, m) => s + m.tokensEstimated, 0);

  // Per-agent latency data
  const agentLatencies = agents.map((agent) => {
    const agentMetrics = metrics.filter((m) => m.agentId === agent.id);
    const avg = agentMetrics.length > 0 ? Math.round(agentMetrics.reduce((s, m) => s + m.latencyMs, 0) / agentMetrics.length) : 0;
    return { label: agent.name.split(' ')[0], value: avg, color: agent.color };
  });

  // Time-series latency
  const timeSeries = metrics.slice(-20).map((m, i) => ({
    x: `#${i + 1}`,
    y: m.latencyMs,
  }));

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      <div className="flex items-center gap-2 mb-2">
        <Activity size={18} className="text-indigo-400" />
        <h2 className="text-sm font-semibold">A2A Observability Dashboard</h2>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatCard label="Total Runs" value={totalMetrics} icon={<Zap size={16} />} color="#4f46e5" />
        <StatCard label="Avg Latency" value={`${avgLatency}ms`} icon={<Clock size={16} />} color="#10b981" />
        <StatCard label="Success Rate" value={`${successRate}%`} icon={<Activity size={16} />} color="#f59e0b" />
        <StatCard label="Est. Tokens" value={totalTokens.toLocaleString()} icon={<AlertTriangle size={16} />} color="#ef4444" />
      </div>

      {/* Agent performance bar chart */}
      {agentLatencies.some((a) => a.value > 0) && (
        <div className="bg-[#1a1a2e] rounded-lg border border-[#2a2a3e] p-4">
          <h3 className="text-xs font-medium mb-2 text-gray-400">Agent Average Latency (ms)</h3>
          <BarChart data={agentLatencies.filter((a) => a.value > 0)} width={400} height={200} />
        </div>
      )}

      {/* Latency timeline */}
      {timeSeries.length > 0 && (
        <div className="bg-[#1a1a2e] rounded-lg border border-[#2a2a3e] p-4">
          <h3 className="text-xs font-medium mb-2 text-gray-400">Recent Latency Timeline</h3>
          <LineChart
            data={[{ label: 'Latency', values: timeSeries, color: '#4f46e5' }]}
            width={500}
            height={200}
          />
        </div>
      )}

      {/* Recent metrics table */}
      <div className="bg-[#1a1a2e] rounded-lg border border-[#2a2a3e] p-4">
        <h3 className="text-xs font-medium mb-2 text-gray-400">Recent Runs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2a2a3e]">
                <th className="text-left py-1 px-2 text-gray-500">Agent</th>
                <th className="text-left py-1 px-2 text-gray-500">Topic</th>
                <th className="text-right py-1 px-2 text-gray-500">Latency</th>
                <th className="text-right py-1 px-2 text-gray-500">Tokens</th>
                <th className="text-center py-1 px-2 text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.slice(-10).reverse().map((m) => (
                <tr key={m.id} className="border-b border-[#2a2a3e]/50">
                  <td className="py-1 px-2">{m.agentName}</td>
                  <td className="py-1 px-2 truncate max-w-[150px]">{m.topic}</td>
                  <td className="py-1 px-2 text-right">{m.latencyMs}ms</td>
                  <td className="py-1 px-2 text-right">{m.tokensEstimated}</td>
                  <td className="py-1 px-2 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${m.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {metrics.length === 0 && <p className="text-xs text-gray-500 py-4 text-center">No metrics recorded yet. Run an A2A debate to populate.</p>}
      </div>
    </div>
  );
};
