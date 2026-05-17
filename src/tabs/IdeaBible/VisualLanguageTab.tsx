'use client';
import React from 'react';
import { useStoryStore } from '@/store/storyStore';
import { Film, Camera, User, Quote } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';



const REF_ICONS = {
  Film: Film,
  Photograph: Camera,
  Painting: Quote,
  Music: Quote,
  Book: Quote,
  Director: User,
};

export default function VisualLanguageTab() {
  const visualReferences = useStoryStore((s) => s?.idea_bible?.visualReferences);
  const moodColors = useStoryStore((s) => s?.idea_bible?.moodColors);
  const cinematicStatement = useStoryStore((s) => s?.idea_bible?.cinematicStatement);

  return (
    <div className="space-y-6">
      {/* Cinematic Statement */}
      <div className="rounded border border-primary/20 bg-primary/5 p-4">
        <span className="panel-header block mb-2">Tuyên Ngôn Điện Ảnh</span>
        <blockquote className="text-sm text-foreground/90 leading-relaxed italic font-medium">
          "{cinematicStatement}"
        </blockquote>
      </div>
      {/* Mood Color Palette */}
      <div>
        <span className="panel-header block mb-3">Bảng Màu Cảm Xúc</span>
        <div className="flex gap-2">
          {moodColors?.map((color, i) => (
            <div key={`mood-color-${i}`} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className="w-full h-12 rounded border border-border/50"
                style={{ backgroundColor: color }}
                title={color}
              />
              <span className="font-mono-data text-[9px] text-muted-foreground">{color}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Visual References */}
      <div>
        <span className="panel-header block mb-3">Tham Chiếu Hình Ảnh</span>
        <div className="space-y-3">
          {visualReferences?.map((ref) => {
            const Icon = REF_ICONS?.[ref?.type] ?? Film;
            return (
              <div key={`vref-${ref?.id}`} className="rounded border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Icon size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{ref?.title}</span>
                      <span className="cinema-badge status-seed" style={{ fontSize: '9px' }}>{ref?.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{ref?.description}</p>

                    {/* Color Swatches */}
                    {ref?.colorPalette?.length > 0 && (
                      <div className="flex gap-1.5 mb-2">
                        {ref?.colorPalette?.map((c, ci) => (
                          <div
                            key={`vref-swatch-${ref?.id}-${ci}`}
                            className="w-5 h-5 rounded"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                        {ref?.tags?.map((tag) => (
                          <span
                            key={`vref-tag-${ref?.id}-${tag}`}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {visualReferences?.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border rounded">
          <Camera size={28} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Chưa có tham chiếu hình ảnh nào</p>
          <p className="text-xs text-muted-foreground mt-1">Thêm phim, nhiếp ảnh gia và đạo diễn định hình ngôn ngữ hình ảnh</p>
        </div>
      )}
    </div>
  );
}