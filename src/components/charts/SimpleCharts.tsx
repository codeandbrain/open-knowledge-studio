/**
 * Zero-dependency SVG charting components.
 * Bar chart, line chart, and area chart — all pure SVG, no library.
 * @license SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface LineChartData {
  label: string;
  values: { x: string; y: number }[];
  color?: string;
}

/* ─── Bar Chart ─── */
export const BarChart: React.FC<{
  data: BarChartData[];
  width?: number;
  height?: number;
  barColor?: string;
  title?: string;
}> = ({ data, width = 400, height = 250, barColor = '#4f46e5', title }) => {
  const padding = { top: 30, right: 20, bottom: 40, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barW = Math.min(40, (chartW / data.length) * 0.7);
  const gap = chartW / data.length;

  return (
    <svg width={width} height={height} className="w-full h-auto">
      {title && <text x={width / 2} y={18} textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="bold">{title}</text>}
      {/* Y-axis grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = padding.top + chartH * (1 - pct);
        const val = Math.round(maxVal * pct);
        return (
          <g key={pct}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#3a3a3a" strokeWidth="0.5" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="#888" fontSize="10">{val}</text>
          </g>
        );
      })}
      {/* Bars */}
      {data.map((d, i) => {
        const x = padding.left + i * gap + (gap - barW) / 2;
        const barH = (d.value / maxVal) * chartH;
        const y = padding.top + chartH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="3" fill={d.color || barColor} opacity="0.85" />
            <text x={x + barW / 2} y={height - padding.bottom + 16} textAnchor="middle" fill="#888" fontSize="9">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
};

/* ─── Line Chart ─── */
export const LineChart: React.FC<{
  data: LineChartData[];
  width?: number;
  height?: number;
  title?: string;
}> = ({ data, width = 400, height = 250, title }) => {
  const padding = { top: 30, right: 20, bottom: 40, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  if (data.length === 0 || data[0].values.length === 0) {
    return <svg width={width} height={height}><text x={width / 2} y={height / 2} textAnchor="middle" fill="#666" fontSize="13">No data</text></svg>;
  }

  const allValues = data.flatMap((d) => d.values.map((v) => v.y));
  const maxVal = Math.max(...allValues, 1);
  const labels = data[0].values.map((v) => v.x);
  const step = chartW / Math.max(labels.length - 1, 1);

  return (
    <svg width={width} height={height} className="w-full h-auto">
      {title && <text x={width / 2} y={18} textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="bold">{title}</text>}
      {/* Y-axis */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = padding.top + chartH * (1 - pct);
        const val = Math.round(maxVal * pct);
        return (
          <g key={pct}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#3a3a3a" strokeWidth="0.5" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="#888" fontSize="10">{val}</text>
          </g>
        );
      })}
      {/* X-axis labels */}
      {labels.map((label, i) => (
        <text key={i} x={padding.left + i * step} y={height - padding.bottom + 16} textAnchor="middle" fill="#888" fontSize="9">{label}</text>
      ))}
      {/* Lines */}
      {data.map((series, si) => {
        const color = series.color || `hsl(${(si * 120) % 360}, 70%, 60%)`;
        const points = series.values.map((v, i) => {
          const x = padding.left + i * step;
          const y = padding.top + chartH * (1 - v.y / maxVal);
          return `${x},${y}`;
        }).join(' ');
        const areaPoints = `${padding.left},${padding.top + chartH} ${points} ${padding.left + (series.values.length - 1) * step},${padding.top + chartH}`;
        return (
          <g key={si}>
            <polygon points={areaPoints} fill={color} opacity="0.1" />
            <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
            {series.values.map((v, i) => {
              const x = padding.left + i * step;
              const y = padding.top + chartH * (1 - v.y / maxVal);
              return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
            })}
          </g>
        );
      })}
    </svg>
  );
};

/* ─── Mini Stat Card ─── */
export const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}> = ({ label, value, icon, color = '#4f46e5' }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e]">
    {icon && <div style={{ color }}>{icon}</div>}
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-lg font-bold" style={{ color }}>{value}</div>
    </div>
  </div>
);
