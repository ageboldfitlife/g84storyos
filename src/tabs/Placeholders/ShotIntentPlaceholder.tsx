'use client';
import React from 'react';
import { Camera, Lock } from 'lucide-react';

export default function ShotIntentPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] relative overflow-hidden placeholder-screen-bg px-6">
      {/* Scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="scan-line absolute inset-x-0 h-32" style={{ top: '-128px', animationDelay: '4s' }} />
      </div>
      {/* Camera crosshair decoration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
        <div className="relative w-64 h-40 border border-foreground">
          {/* Corner marks */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
          {/* Center cross */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-px bg-foreground" />
            <div className="absolute w-px h-6 bg-foreground" />
            <div className="absolute w-3 h-3 rounded-full border border-foreground" />
          </div>
        </div>
      </div>
      <div className="relative z-10 text-center max-w-lg">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="aperture-ring absolute inset-0" />
          <div className="aperture-ring absolute inset-3" style={{ animationDelay: '1.5s' }} />
          <div className="flex items-center justify-center h-full">
            <Camera size={28} className="text-primary" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="font-mono-data text-[10px] text-muted-foreground tracking-widest">MODULE</span>
          <span className="font-mono-data text-[10px] text-primary tracking-widest">05</span>
        </div>

        <h2 className="text-2xl font-semibold text-foreground mb-2 tracking-tight">
          Shot Intent Mapper
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Chuyển hóa cảnh Screenplay thành tầm nhìn đạo diễn. Xác định loại cảnh quay, lựa chọn ống kính, chuyển động máy quay và mục tiêu cảm xúc — từng cảnh một, trước khi bấm máy.
        </p>

        <div className="text-left bg-card/60 border border-border rounded p-4 mb-6 space-y-2">
          {[
            'Thư viện loại cảnh: wide, medium, close, insert, POV',
            'Ghi chú ống kính và khuyến nghị tiêu cự theo từng cảnh',
            'Mục tiêu cảm xúc mỗi shot — khán giả phải cảm gì',
            'Từ vựng chuyển động máy: dolly, handheld, tĩnh, crane',
          ]?.map((feat, i) => (
            <div key={`shot-feat-${i}`} className="flex items-start gap-2">
              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5" />
              <span className="text-xs text-muted-foreground">{feat}</span>
            </div>
          ))}
        </div>

        {/* Shot intent example rows */}
        <div className="text-left bg-card/40 border border-border/50 rounded overflow-hidden mb-6 opacity-40">
          <div className="grid grid-cols-3 gap-0 divide-x divide-border border-b border-border">
            {['Cảnh Quay', 'Ống Kính', 'Cảm Xúc']?.map((h) => (
              <div key={`shot-header-${h}`} className="px-2 py-1.5">
                <span className="panel-header text-[9px]">{h}</span>
              </div>
            ))}
          </div>
          {[
            ['ECU — Elena\'s hands', '85mm', 'Dread'],
            ['Wide — Archive hall', '24mm', 'Isolation'],
            ['POV — Map surface', '50mm', 'Discovery'],
          ]?.map((row, ri) => (
            <div key={`shot-row-${ri}`} className="grid grid-cols-3 gap-0 divide-x divide-border border-b border-border last:border-b-0">
              {row?.map((cell, ci) => (
                <div key={`shot-cell-${ri}-${ci}`} className="px-2 py-1.5">
                  <span className="text-[10px] text-foreground/60">{cell}</span>
                </div>
              ))}
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