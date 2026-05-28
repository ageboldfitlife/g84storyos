'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { Lightbulb, BookOpen, LayoutGrid, FileText, Camera, Package, ChevronLeft, ChevronRight, Download, Settings,  } from 'lucide-react';
import { useStoryStore } from '@/store/storyStore';
import { exportProjectAsJSON } from '@/utils/exportUtils';
import Icon from '@/components/ui/AppIcon';


const NAV_ITEMS = [
  {
    id: 'nav-idea-lab',
    label: 'Phòng Ý Tưởng',
    shortLabel: 'Ý Tưởng',
    href: '/',
    icon: Lightbulb,
    tabNumber: 1,
    status: 'active' as const,
  },
  {
    id: 'nav-idea-bible',
    label: 'Hồ Sơ Thế Giới',
    shortLabel: 'Hồ Sơ',
    href: '/idea-bible',
    icon: BookOpen,
    tabNumber: 2,
    status: 'active' as const,
  },
  {
    id: 'nav-beat-map',
    label: 'Bản Đồ Nhịp',
    shortLabel: 'Nhịp',
    href: '/beat-map',
    icon: LayoutGrid,
    tabNumber: 3,
    status: 'active' as const,
  },
  {
    id: 'nav-screenplay',
    label: 'Kịch Bản',
    shortLabel: 'Kịch Bản',
    href: '/screenplay',
    icon: FileText,
    tabNumber: 4,
    status: 'placeholder' as const,
  },
  {
    id: 'nav-shot-intent',
    label: 'Ý Đồ Shot',
    shortLabel: 'Shot',
    href: '/shot-intent',
    icon: Camera,
    tabNumber: 5,
    status: 'placeholder' as const,
  },
  {
    id: 'nav-export-hub',
    label: 'Trạm Xuất',
    shortLabel: 'Xuất',
    href: '/export-hub',
    icon: Package,
    tabNumber: 6,
    status: 'placeholder' as const,
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const storeState = useStoryStore();
  const completionScore = useStoryStore((s) => s.getCompletionScore());
  const projectTitle = useStoryStore((s) => s.project_meta.title);
  const projectStatus = useStoryStore((s) => s.project_meta.status);

  const [clientScore, setClientScore] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setClientScore(completionScore);
    setMounted(true);
  }, [completionScore]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href;
  };

  const statusColors: Record<string, string> = {
    seed: '#8A8480',
    developing: '#D4A853',
    structured: '#6BA8E8',
    draft: '#82C882',
    locked: '#B882D8',
  };

  return (
    <aside
      className="relative flex flex-col h-full border-r border-border bg-card"
      style={{
        width: collapsed ? '64px' : '240px',
        minWidth: collapsed ? '64px' : '240px',
        transition: 'width 300ms ease, min-width 300ms ease',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-4 border-b border-border overflow-hidden">
        <div className="flex-shrink-0">
          <AppLogo size={32} />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0 fade-in-up">
            <span className="text-xs font-mono-data text-primary tracking-widest uppercase">
              G84
            </span>
            <span className="text-[11px] text-muted-foreground tracking-wide leading-none mt-0.5">
              Story OS
            </span>
          </div>
        )}
      </div>

      {/* Project Meta */}
      {!collapsed && (
        <div className="px-3 py-3 border-b border-border fade-in-up">
          <div className="bg-muted rounded px-3 py-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="panel-header">Dự Án Đang Hoạt Động</span>
              <span
                className="cinema-badge text-[9px]"
                style={{
                  backgroundColor: `${statusColors[projectStatus]}20`,
                  color: statusColors[projectStatus],
                  border: `1px solid ${statusColors[projectStatus]}40`,
                }}
              >
                {projectStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-foreground font-medium leading-tight truncate">
              {projectTitle}
            </p>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">Tiến Độ</span>
                <span className="font-mono-data text-[10px] text-primary">{mounted ? clientScore : 0}%</span>
              </div>
              <div className="concept-strength-bar">
                <div
                  className="concept-strength-fill"
                  style={{
                    width: `${mounted ? clientScore : 0}%`,
                    background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <p className="panel-header px-2 pb-2">Mô-đun</p>
        )}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href) || (item.href === '/cinematic-placeholder-screens' && pathname === '/cinematic-placeholder-screens');
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`sidebar-nav-item group relative ${active ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex-shrink-0 relative">
                <Icon
                  size={16}
                  className="nav-icon"
                  style={{ opacity: item.status === 'placeholder' ? 0.5 : 1 }}
                />
                {item.status === 'placeholder' && (
                  <div
                    className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: '#6B6560' }}
                  />
                )}
              </div>
              {!collapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span
                    className="truncate"
                    style={{ opacity: item.status === 'placeholder' ? 0.5 : 1 }}
                  >
                    {item.label}
                  </span>
                  <span className="font-mono-data text-[10px] text-muted-foreground ml-2 flex-shrink-0">
                    T{item.tabNumber}
                  </span>
                </div>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-card border border-border rounded text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-lg">
                  {item.label}
                  {item.status === 'placeholder' && (
                    <span className="ml-1 text-muted-foreground">(Sắp Ra Mắt)</span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-2 py-3 border-t border-border space-y-0.5">
        {!collapsed && (
          <p className="panel-header px-2 pb-2">Hệ Thống</p>
        )}
        <button
          onClick={() => exportProjectAsJSON(storeState)}
          className="sidebar-nav-item w-full group relative"
          title={collapsed ? 'Xuất JSON' : undefined}
        >
          <Download size={16} className="flex-shrink-0" />
          {!collapsed && <span className="truncate">Xuất JSON</span>}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-card border border-border rounded text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-lg">
              Xuất JSON
            </div>
          )}
        </button>
        <button
          className="sidebar-nav-item w-full group relative"
          title={collapsed ? 'Cài Đặt' : undefined}
        >
          <Settings size={16} className="flex-shrink-0" />
          {!collapsed && <span className="truncate">Cài Đặt</span>}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-card border border-border rounded text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-lg">
              Cài Đặt
            </div>
          )}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-all duration-150 z-10"
        aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
