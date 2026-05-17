'use client';
import React, { useState } from 'react';
import { useStoryStore } from '@/store/storyStore';
import { Film, BookOpen, Camera, Music, User } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';



const TYPE_ICONS = {
  Film: Film,
  Book: BookOpen,
  Photograph: Camera,
  Music: Music,
  Director: User,
};

const TYPE_COLORS: Record<string, string> = {
  Film: '#6BA8E8',
  Book: '#82C882',
  Photograph: '#E8A87C',
  Music: '#B882D8',
  Director: '#D4A853',
};

export default function InfluenceBoard() {
  const influences = useStoryStore((s) => s.idea_core.influences);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="panel-header">Nguồn Cảm Hứng Điện Ảnh</span>
        <span className="font-mono-data text-[10px] text-muted-foreground">
          {influences.length} tham chiếu
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {influences.map((inf) => {
          const Icon = TYPE_ICONS[inf.type] ?? Film;
          const color = TYPE_COLORS[inf.type] ?? '#D4A853';
          const isExp = expanded === inf.id;

          return (
            <div
              key={`inf-card-${inf.id}`}
              className="influence-card-hover rounded border border-border bg-muted/30 overflow-hidden"
              onClick={() => setExpanded(isExp ? null : inf.id)}
            >
              <div className="flex items-start gap-3 px-3 py-2.5">
                <div
                  className="flex-shrink-0 w-7 h-7 rounded flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
                >
                  <Icon size={13} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{inf.title}</span>
                    <span
                      className="cinema-badge flex-shrink-0"
                      style={{
                        backgroundColor: `${color}15`,
                        color,
                        border: `1px solid ${color}30`,
                        fontSize: '9px',
                      }}
                    >
                      {inf.type}
                    </span>
                  </div>
                  {inf.director && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {inf.director}{inf.year ? ` · ${inf.year}` : ''}
                    </p>
                  )}
                  {isExp && (
                    <div className="mt-2 fade-in-up">
                      <p className="text-xs text-foreground/80 leading-relaxed">{inf.note}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {inf.tags.map((tag) => (
                          <span
                            key={`inf-tag-${inf.id}-${tag}`}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {influences.length === 0 && (
        <div className="text-center py-8 border border-dashed border-border rounded">
          <Film size={24} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Chưa có nguồn cảm hứng nào</p>
          <p className="text-xs text-muted-foreground mt-1">Thêm phim, sách và đạo diễn định hình dự án này</p>
        </div>
      )}
    </div>
  );
}