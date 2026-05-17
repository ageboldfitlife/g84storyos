'use client';
import React, { useState } from 'react';
import Header from '@/layouts/Header';
import BeatMapPlaceholder from './BeatMapPlaceholder';
import ScreenplayPlaceholder from './ScreenplayPlaceholder';
import ShotIntentPlaceholder from './ShotIntentPlaceholder';
import ExportHubPlaceholder from './ExportHubPlaceholder';
import { LayoutGrid, FileText, Camera, Package } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const PLACEHOLDER_TABS = [
  { id: 'beat-map', label: 'Beat Map', icon: LayoutGrid, tabNumber: 3 },
  { id: 'screenplay', label: 'Screenplay', icon: FileText, tabNumber: 4 },
  { id: 'shot-intent', label: 'Shot Intent', icon: Camera, tabNumber: 5 },
  { id: 'export-hub', label: 'Export Hub', icon: Package, tabNumber: 6 },
] as const;

type PlaceholderTabId = typeof PLACEHOLDER_TABS[number]['id'];

export default function CinematicPlaceholderContent() {
  const [activeTab, setActiveTab] = useState<PlaceholderTabId>('beat-map');

  const currentTab = PLACEHOLDER_TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title={currentTab.label}
        subtitle="Module Phase 2 — đường ống phát triển điện ảnh"
        tabNumber={currentTab.tabNumber}
      />

      {/* Tab Bar */}
      <div className="flex items-center gap-0 px-6 border-b border-border bg-card/30 flex-shrink-0 overflow-x-auto">
        {PLACEHOLDER_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={`ph-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-150 border-b-2 whitespace-nowrap"
              style={{
                color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                borderBottomColor: isActive ? 'var(--primary)' : 'transparent',
                backgroundColor: isActive ? 'rgba(212, 168, 83, 0.05)' : 'transparent',
              }}
            >
              <Icon size={14} />
              {tab.label}
              <span className="font-mono-data text-[10px] text-muted-foreground">T{tab.tabNumber}</span>
            </button>
          );
        })}
      </div>

      {/* Placeholder Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="fade-in-up h-full">
          {activeTab === 'beat-map' && <BeatMapPlaceholder />}
          {activeTab === 'screenplay' && <ScreenplayPlaceholder />}
          {activeTab === 'shot-intent' && <ShotIntentPlaceholder />}
          {activeTab === 'export-hub' && <ExportHubPlaceholder />}
        </div>
      </div>
    </div>
  );
}