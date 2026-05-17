'use client';
import React from 'react';
import { Package, Lock, FileJson, FileText, BookOpen } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const EXPORT_TYPES = [
  { icon: FileJson, label: 'Story JSON', desc: 'Xuất toàn bộ trạng thái dự án', status: 'Có sẵn ngay' },
  { icon: FileText, label: 'PDF Lookbook', desc: 'Tài liệu Story Bible định dạng sẵn', status: 'Phase 2' },
  { icon: FileText, label: 'FDX Screenplay', desc: 'File tương thích Final Draft', status: 'Phase 2' },
  { icon: BookOpen, label: 'Production Bible', desc: 'Gói tài liệu đầy đủ của đạo diễn', status: 'Phase 2' },
];

export default function ExportHubPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] relative overflow-hidden placeholder-screen-bg px-6">
      {/* Scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="scan-line absolute inset-x-0 h-32" style={{ top: '-128px', animationDelay: '6s' }} />
      </div>
      {/* Package grid decoration */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 opacity-[0.04] hidden xl:grid grid-cols-2 gap-2">
        {Array.from({ length: 8 })?.map((_, i) => (
          <div key={`pkg-deco-${i}`} className="w-12 h-12 border border-foreground rounded" />
        ))}
      </div>
      <div className="relative z-10 text-center max-w-lg">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="aperture-ring absolute inset-0" />
          <div className="aperture-ring absolute inset-3" style={{ animationDelay: '2s' }} />
          <div className="flex items-center justify-center h-full">
            <Package size={28} className="text-primary" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="font-mono-data text-[10px] text-muted-foreground tracking-widest">MODULE</span>
          <span className="font-mono-data text-[10px] text-primary tracking-widest">06</span>
        </div>

        <h2 className="text-2xl font-semibold text-foreground mb-2 tracking-tight">
          Export Hub
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Đóng gói toàn bộ quá trình phát triển câu chuyện thành các tài liệu sẵn sàng sản xuất — PDF định dạng, file Screenplay chuẩn công nghiệp và gói tài liệu đạo diễn có thể chia sẻ.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {EXPORT_TYPES?.map((type) => {
            const Icon = type?.icon;
            const isAvailable = type?.status === 'Có sẵn ngay';
            return (
              <div
                key={`export-type-${type?.label}`}
                className="text-left rounded border p-3"
                style={{
                  borderColor: isAvailable ? 'rgba(212, 168, 83, 0.3)' : 'var(--border)',
                  backgroundColor: isAvailable ? 'rgba(212, 168, 83, 0.05)' : 'rgba(17, 17, 19, 0.5)',
                }}
              >
                <Icon
                  size={16}
                  className="mb-2"
                  style={{ color: isAvailable ? 'var(--primary)' : 'var(--muted-foreground)' }}
                />
                <p className="text-xs font-semibold text-foreground mb-0.5">{type?.label}</p>
                <p className="text-[10px] text-muted-foreground mb-1.5">{type?.desc}</p>
                <span
                  className="cinema-badge"
                  style={{
                    fontSize: '9px',
                    backgroundColor: isAvailable ? 'rgba(130, 200, 130, 0.15)' : 'var(--muted)',
                    color: isAvailable ? '#82C882' : 'var(--muted-foreground)',
                    border: isAvailable ? '1px solid rgba(130, 200, 130, 0.3)' : '1px solid transparent',
                  }}
                >
                  {type?.status}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded border border-border bg-muted/30">
          <Lock size={12} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-mono-data tracking-wide">
            XUẤT ĐẦY ĐỦ — PHASE 2
          </span>
        </div>
      </div>
    </div>
  );
}