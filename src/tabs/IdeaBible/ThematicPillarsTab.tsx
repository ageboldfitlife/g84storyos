'use client';
import React from 'react';
import { useStoryStore } from '@/store/storyStore';
import { Layers, LinkIcon, TrendingUp } from 'lucide-react';

export default function ThematicPillarsTab() {
  const pillars = useStoryStore((s) => s.idea_bible.thematicPillars);
  const characters = useStoryStore((s) => s.idea_bible.characters);

  const getCharacterName = (id: string) => {
    return characters.find((c) => c.id === id)?.name ?? id;
  };

  const avgAlignment = pillars.length > 0
    ? Math.round(pillars.reduce((a, p) => a + p.alignmentScore, 0) / pillars.length)
    : 0;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/50 rounded border border-border px-3 py-2">
          <p className="panel-header">Trụ Cột Đã Định</p>
          <p className="font-mono-data text-2xl font-bold text-primary mt-1">{pillars.length}</p>
        </div>
        <div className="bg-muted/50 rounded border border-border px-3 py-2">
          <p className="panel-header">Độ Nhất Quán TB</p>
          <p className="font-mono-data text-2xl font-bold mt-1" style={{ color: avgAlignment >= 80 ? '#82C882' : '#D4A853' }}>
            {avgAlignment}
          </p>
        </div>
        <div className="bg-muted/50 rounded border border-border px-3 py-2">
          <p className="panel-header">Nhân Vật Liên Kết</p>
          <p className="font-mono-data text-2xl font-bold text-blue-400 mt-1">
            {new Set(pillars.flatMap((p) => p.linkedCharacters)).size}
          </p>
        </div>
      </div>

      {/* Pillars */}
      <div className="space-y-4">
        {pillars.map((pillar, idx) => (
          <div
            key={`pillar-${pillar.id}`}
            className="rounded border border-border bg-card overflow-hidden"
          >
            {/* Alignment Bar */}
            <div
              className="h-0.5"
              style={{
                background: `linear-gradient(90deg, var(--primary) ${pillar.alignmentScore}%, var(--muted) ${pillar.alignmentScore}%)`,
              }}
            />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono-data text-[10px] text-muted-foreground">TRỤ CỘT {idx + 1}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={11} style={{ color: pillar.alignmentScore >= 80 ? '#82C882' : '#D4A853' }} />
                  <span
                    className="font-mono-data text-sm font-bold"
                    style={{ color: pillar.alignmentScore >= 80 ? '#82C882' : '#D4A853' }}
                  >
                    {pillar.alignmentScore}%
                  </span>
                  <span className="text-[10px] text-muted-foreground">nhất quán</span>
                </div>
              </div>

              {/* Statement */}
              <blockquote className="text-sm font-medium text-foreground leading-relaxed border-l-2 border-primary pl-3 mb-3 italic">
                "{pillar.statement}"
              </blockquote>

              {/* Question */}
              <div className="bg-muted/30 rounded px-3 py-2 mb-3">
                <span className="panel-header block mb-1">Câu Hỏi Trung Tâm</span>
                <p className="text-xs text-foreground/80 italic">{pillar.question}</p>
              </div>

              {/* Linked Characters */}
              {pillar.linkedCharacters.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <LinkIcon size={10} className="text-muted-foreground" />
                    <span className="panel-header">Nhân Vật Liên Kết</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pillar.linkedCharacters.map((cid) => (
                      <span
                        key={`pillar-link-${pillar.id}-${cid}`}
                        className="px-2 py-0.5 rounded text-[11px] bg-primary/10 text-primary border border-primary/20"
                      >
                        {getCharacterName(cid)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {pillar.notes && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{pillar.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {pillars.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded">
          <Layers size={28} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Chưa có trụ cột chủ đề nào</p>
          <p className="text-xs text-muted-foreground mt-1">
            Xác định điều câu chuyện của bạn thực sự muốn nói
          </p>
        </div>
      )}
    </div>
  );
}