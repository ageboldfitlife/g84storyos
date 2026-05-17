'use client';
import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface ConceptStrengthChartProps {
  data: {
    originality: number;
    clarity: number;
    emotionalHook: number;
    commercialViability: number;
    thematicDepth: number;
  };
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { subject: string; value: number } }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{payload[0].payload.subject}</p>
        <p className="font-mono-data text-sm text-primary font-semibold">{payload[0].payload.value}</p>
      </div>
    );
  }
  return null;
};

export default function ConceptStrengthChart({ data }: ConceptStrengthChartProps) {
  const chartData = [
    { subject: 'Originality', value: data.originality, fullMark: 100 },
    { subject: 'Clarity', value: data.clarity, fullMark: 100 },
    { subject: 'Emotional Hook', value: data.emotionalHook, fullMark: 100 },
    { subject: 'Commercial', value: data.commercialViability, fullMark: 100 },
    { subject: 'Thematic Depth', value: data.thematicDepth, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
        />
        <Radar
          name="Concept"
          dataKey="value"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.15}
          strokeWidth={1.5}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}