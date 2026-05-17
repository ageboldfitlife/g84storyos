'use client';
import React from 'react';
import { LayoutGrid, Lock } from 'lucide-react';

export default function BeatMapPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] relative overflow-hidden placeholder-screen-bg px-6">
      {/* Ambient scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="scan-line absolute inset-x-0 h-32" style={{ top: '-128px' }} />
      </div>
      {/* Film strip decoration */}
      <div className="absolute top-0 left-0 right-0 flex overflow-hidden opacity-10">
        {Array.from({ length: 24 })?.map((_, i) => (
          <div
            key={`strip-top-${i}`}
            className="flex-shrink-0 w-8 h-5 border border-foreground/30 mx-0.5 mt-1"
          />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex overflow-hidden opacity-10">
        {Array.from({ length: 24 })?.map((_, i) => (
          <div
            key={`strip-bottom-${i}`}
            className="flex-shrink-0 w-8 h-5 border border-foreground/30 mx-0.5 mb-1"
          />
        ))}
      </div>
      {/* Grid structure visual */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Content */}
      <div className="relative z-10 text-center max-w-lg">
        {/* Icon cluster */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="aperture-ring absolute inset-0" />
          <div className="aperture-ring absolute inset-3" style={{ animationDelay: '1s' }} />
          <div className="flex items-center justify-center h-full">
            <LayoutGrid size={28} className="text-primary" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="font-mono-data text-[10px] text-muted-foreground tracking-widest">MODULE</span>
          <span className="font-mono-data text-[10px] text-primary tracking-widest">03</span>
        </div>

        <h2 className="text-2xl font-semibold text-foreground mb-2 tracking-tight">
          Beat Map
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Bản đồ cấu trúc ba hồi trực quan. Đặt 12 beat câu chuyện, theo dõi mục tiêu trang, khóa chuỗi và quan sát kiến trúc tự sự của bạn trong một cái nhìn.
        </p>

        {/* Feature teaser list */}
        <div className="text-left bg-card/60 border border-border rounded p-4 mb-6 space-y-2">
          {[
            'Beat sheet Blake Snyder — 12 beat được lập bản đồ sẵn',
            'Kéo thả để sắp xếp lại beat giữa các hồi',
            'Máy tính mục tiêu trang với điểm nhịp độ',
            'Liên kết beat-to-scene cho tính liên tục của Screenplay',
          ]?.map((feat, i) => (
            <div key={`beat-feat-${i}`} className="flex items-start gap-2">
              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5" />
              <span className="text-xs text-muted-foreground">{feat}</span>
            </div>
          ))}
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