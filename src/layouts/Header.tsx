'use client';
import React, { useState, useEffect } from 'react';
import { useStoryStore } from '@/store/storyStore';
import { formatDate } from '@/utils/exportUtils';
import { Zap, Clock, Activity } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  tabNumber?: number;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, tabNumber, actions }: HeaderProps) {
  const lastModified = useStoryStore((s) => s.project_meta.lastModified);
  const version = useStoryStore((s) => s.project_meta.version);
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    setFormattedDate(formatDate(lastModified));
  }, [lastModified]);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 flex-shrink-0">
      <div className="flex items-center gap-4">
        {tabNumber && (
          <div className="flex items-center justify-center w-8 h-8 rounded border border-primary/30 bg-primary/10 flex-shrink-0">
            <span className="font-mono-data text-xs text-primary font-semibold">
              T{tabNumber}
            </span>
          </div>
        )}
        <div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-1.5 text-muted-foreground">
          <Clock size={11} />
          <span className="font-mono-data text-[11px]">{formattedDate}</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-muted-foreground">
          <Activity size={11} />
          <span className="font-mono-data text-[11px]">v{version}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10 border border-primary/20">
          <Zap size={10} className="text-primary" />
          <span className="text-[10px] font-semibold text-primary tracking-wider">LIVE</span>
        </div>
        {actions}
      </div>
    </header>
  );
}