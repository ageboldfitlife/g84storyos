'use client';
import React from 'react';
import { useStoryStore } from '@/store/storyStore';
import { getConceptStrengthColor } from '@/utils/exportUtils';
import { AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';

const ConceptStrengthChart = dynamic(() => import('@/components/ConceptStrengthChart'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-muted rounded h-[200px] w-full" />,
});

const STATUS_STEPS = ['seed', 'developing', 'structured', 'draft', 'locked'] as const;

export default function IdeaStatusPanel() {
  const conceptStrength = useStoryStore((s) => s.idea_core.conceptStrength);
  const status = useStoryStore((s) => s.idea_core.status);
  const setStatus = useStoryStore((s) => s.setProjectStatus);

  const avgScore = Math.round(
    Object.values(conceptStrength).reduce((a, b) => a + b, 0) / Object.values(conceptStrength).length
  );

  const weakest = Object.entries(conceptStrength).sort(([, a], [, b]) => a - b)[0];
  const weakestLabel = weakest[0].replace(/([A-Z])/g, ' $1').trim();

  return (
    <div className="space-y-4">
      {/* Concept Strength Radar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="panel-header">Sức Mạnh Concept</span>
          <span
            className="font-mono-data text-sm font-bold"
            style={{ color: getConceptStrengthColor(avgScore) }}
          >
            {avgScore}
          </span>
        </div>
        <ConceptStrengthChart data={conceptStrength} />
      </div>

      {/* Individual Scores */}
      <div className="space-y-2">
        {Object.entries(conceptStrength).map(([key, val]) => {
          const label = key.replace(/([A-Z])/g, ' $1').trim();
          const color = getConceptStrengthColor(val);
          return (
            <div key={`cs-${key}`} className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground w-28 flex-shrink-0 capitalize">
                {label}
              </span>
              <div className="flex-1 concept-strength-bar">
                <div
                  className="concept-strength-fill"
                  style={{ width: `${val}%`, backgroundColor: color }}
                />
              </div>
              <span
                className="font-mono-data text-[11px] w-7 text-right"
                style={{ color }}
              >
                {val}
              </span>
            </div>
          );
        })}
      </div>

      {/* Alert: weakest dimension */}
      {weakest[1] < 60 && (
        <div className="flex items-start gap-2 px-3 py-2 rounded border border-amber-500/20 bg-amber-500/5">
          <AlertTriangle size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-300">
            <span className="font-semibold">{weakestLabel}</span> còn yếu ({weakest[1]}). Hãy củng cố chiều này trước khi tiến lên giai đoạn tiếp theo.
          </p>
        </div>
      )}

      {/* Development Status */}
      <div>
        <span className="panel-header block mb-2">Giai Đoạn Phát Triển</span>
        <div className="flex gap-1">
          {STATUS_STEPS.map((step, i) => {
            const currentIdx = STATUS_STEPS.indexOf(status);
            const isPast = i <= currentIdx;
            return (
              <button
                key={`status-step-${step}`}
                onClick={() => setStatus(step)}
                className="flex-1 py-1.5 rounded text-[10px] font-semibold tracking-wide transition-all duration-150 active:scale-95"
                style={{
                  backgroundColor: isPast ? 'rgba(212, 168, 83, 0.15)' : 'var(--muted)',
                  color: isPast ? 'var(--primary)' : 'var(--muted-foreground)',
                  border: step === status ? '1px solid var(--primary)' : '1px solid transparent',
                }}
                title={step}
              >
                {step.charAt(0).toUpperCase()}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 capitalize">
          Hiện tại: <span className="text-primary font-semibold">{status}</span>
        </p>
      </div>
    </div>
  );
}