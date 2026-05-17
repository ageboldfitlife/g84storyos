'use client';
import React from 'react';
import { FileText, Lock } from 'lucide-react';

export default function ScreenplayPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] relative overflow-hidden placeholder-screen-bg px-6">
      {/* Scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="scan-line absolute inset-x-0 h-32" style={{ top: '-128px', animationDelay: '2s' }} />
      </div>
      {/* Screenplay page stack visual */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 hidden xl:block">
        {Array.from({ length: 6 })?.map((_, i) => (
          <div
            key={`page-stack-${i}`}
            className="absolute w-24 h-32 bg-foreground border border-foreground/20 rounded-sm"
            style={{
              transform: `rotate(${(i - 3) * 2}deg) translateX(${i * 3}px)`,
              top: `${i * 2}px`,
            }}
          />
        ))}
      </div>
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px)',
          backgroundSize: '100% 24px',
        }}
      />
      <div className="relative z-10 text-center max-w-lg">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="aperture-ring absolute inset-0" />
          <div className="aperture-ring absolute inset-3" style={{ animationDelay: '0.7s' }} />
          <div className="flex items-center justify-center h-full">
            <FileText size={28} className="text-primary" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="font-mono-data text-[10px] text-muted-foreground tracking-widest">MODULE</span>
          <span className="font-mono-data text-[10px] text-primary tracking-widest">04</span>
        </div>

        <h2 className="text-2xl font-semibold text-foreground mb-2 tracking-tight">
          Screenplay Editor
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Định dạng kịch bản chuẩn công nghiệp được tích hợp trực tiếp vào OS. Scene heading, action line, dialogue — tất cả liên kết ngược về Beat Map và Character Bible của bạn.
        </p>

        <div className="text-left bg-card/60 border border-border rounded p-4 mb-6 space-y-2">
          {[
            'Engine định dạng Screenplay tương thích FDX',
            'Scene card liên kết với các mục Beat Map',
            'Kiểm tra tính nhất quán giọng nói nhân vật',
            'Theo dõi chỉnh sửa cấp scene với lịch sử phiên bản',
          ]?.map((feat, i) => (
            <div key={`screen-feat-${i}`} className="flex items-start gap-2">
              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5" />
              <span className="text-xs text-muted-foreground">{feat}</span>
            </div>
          ))}
        </div>

        {/* Fake screenplay lines */}
        <div className="text-left bg-card/40 border border-border/50 rounded p-4 mb-6 font-mono text-xs space-y-1 opacity-40">
          <p className="text-foreground/60 uppercase tracking-widest text-[10px]">INT. NATIONAL ARCHIVE — SECTOR 7 — NIGHT</p>
          <p className="text-foreground/50 mt-2 leading-relaxed">Fluorescent light hums. ELENA (38) stands over a light table, map spread flat beneath her hands.</p>
          <p className="text-center text-foreground/40 mt-2 tracking-wide">ELENA</p>
          <p className="text-center text-foreground/40 text-[11px]">(quietly)</p>
          <p className="text-center text-foreground/40">This village doesn't exist.</p>
        </div>

        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded border border-border bg-muted/30">
          <Lock size={12} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-mono-data tracking-wide">
            PHASE 2 — ĐANG PHÁT TRIỂN
          </span>
        </div>
      </div>
    </div>
  );
}