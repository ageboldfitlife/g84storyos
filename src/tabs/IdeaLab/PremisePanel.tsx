'use client';
import React from 'react';
import { useStoryStore } from '@/store/storyStore';
import { calculatePremiseWordCount } from '@/utils/exportUtils';

export default function PremisePanel() {
  const premise = useStoryStore((s) => s?.idea_core?.premise);
  const wordCountTarget = useStoryStore((s) => s?.idea_core?.wordCountTarget);
  const setPremise = useStoryStore((s) => s?.setPremise);

  const wordCount = calculatePremiseWordCount(premise);
  const targetPages = Math.round(wordCount / 250);
  const progress = Math.min((wordCount / (wordCountTarget * 2)) * 100, 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="panel-header">Premise</span>
        <div className="flex items-center gap-3">
          <span className="font-mono-data text-[10px] text-muted-foreground">
            ~{targetPages} trang
          </span>
          <span className="font-mono-data text-[10px] text-primary">
            {wordCount} từ
          </span>
        </div>
      </div>
      <textarea
        value={premise}
        onChange={(e) => setPremise(e?.target?.value)}
        rows={9}
        className="w-full px-3 py-2.5 text-sm leading-relaxed resize-none rounded border border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
        placeholder="Mở rộng Logline thành một Premise đầy đủ. Giới thiệu thế giới của nhân vật chính, sự kiện khai mào, xung đột trung tâm, và điều câu chuyện thực sự muốn nói về mặt chủ đề..."
        spellCheck={false}
      />
      <div className="concept-strength-bar">
        <div
          className="concept-strength-fill"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--primary), var(--accent))',
          }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        Mục tiêu: {wordCountTarget * 2} từ cho một Premise treatment đầy đủ
      </p>
    </div>
  );
}