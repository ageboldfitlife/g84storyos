'use client';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { BeatPoint } from '@/types';

interface BeatCoverageChartProps {
  beats: BeatPoint[];
}

const statusToValue: Record<string, number> = {
  locked: 100,
  sketched: 50,
  empty: 0,
};

const statusToColor: Record<string, string> = {
  locked: '#82C882',
  sketched: '#D4A853',
  empty: '#2A2A2E',
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: BeatPoint & { value: number } }> }) => {
  if (active && payload && payload.length) {
    const beat = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded px-3 py-2 shadow-lg max-w-[180px]">
        <p className="text-xs text-primary font-semibold">Act {beat.act}</p>
        <p className="text-xs text-foreground font-medium">{beat.label}</p>
        <p className="font-mono-data text-[10px] text-muted-foreground mt-1">p.{beat.pageTarget} · {beat.status}</p>
      </div>
    );
  }
  return null;
};

export default function BeatCoverageChart({ beats }: BeatCoverageChartProps) {
  const chartData = beats.map((b) => ({
    ...b,
    value: statusToValue[b.status],
    shortLabel: b.label.split(' ').slice(-1)[0],
  }));

  return (
    <ResponsiveContainer width="100%" height={80}>
      <BarChart data={chartData} barCategoryGap="20%">
        <XAxis
          dataKey="shortLabel"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide domain={[0, 100]} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(212, 168, 83, 0.05)' }} />
        <Bar dataKey="value" radius={[2, 2, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={`beat-cell-${entry.id}`} fill={statusToColor[entry.status]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}