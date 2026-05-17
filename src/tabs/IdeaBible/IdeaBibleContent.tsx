'use client';
import React, { useState } from 'react';
import Header from '@/layouts/Header';
import CharactersTab from './CharactersTab';
import WorldBuildingTab from './WorldBuildingTab';
import ThematicPillarsTab from './ThematicPillarsTab';
import VisualLanguageTab from './VisualLanguageTab';
import { useStoryStore } from '@/store/storyStore';
import { Users, Globe, Layers, Eye } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const BIBLE_TABS = [
  { id: 'characters', label: 'Nhân Vật', icon: Users },
  { id: 'world', label: 'Xây Dựng Thế Giới', icon: Globe },
  { id: 'themes', label: 'Trụ Cột Chủ Đề', icon: Layers },
  { id: 'visual', label: 'Ngôn Ngữ Hình Ảnh', icon: Eye },
] as const;

type BibleTabId = typeof BIBLE_TABS[number]['id'];

export default function IdeaBibleContent() {
  const [activeTab, setActiveTab] = useState<BibleTabId>('characters');
  const characters = useStoryStore((s) => s.idea_bible.characters);
  const worldElements = useStoryStore((s) => s.idea_bible.worldElements);
  const thematicPillars = useStoryStore((s) => s.idea_bible.thematicPillars);
  const visualReferences = useStoryStore((s) => s.idea_bible.visualReferences);
  const projectTitle = useStoryStore((s) => s.project_meta.title);

  const badgeCounts: Record<BibleTabId, number> = {
    characters: characters.length,
    world: worldElements.length,
    themes: thematicPillars.length,
    visual: visualReferences.length,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Idea Bible"
        subtitle={`Bách khoa thế giới câu chuyện — ${projectTitle}`}
        tabNumber={2}
      />

      {/* Tab Bar */}
      <div className="flex items-center gap-0 px-6 border-b border-border bg-card/30 flex-shrink-0 overflow-x-auto">
        {BIBLE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={`bible-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-150 border-b-2 whitespace-nowrap relative"
              style={{
                color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                borderBottomColor: isActive ? 'var(--primary)' : 'transparent',
                backgroundColor: isActive ? 'rgba(212, 168, 83, 0.05)' : 'transparent',
              }}
            >
              <Icon size={14} />
              {tab.label}
              <span
                className="font-mono-data text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: isActive ? 'rgba(212, 168, 83, 0.15)' : 'var(--muted)',
                  color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                }}
              >
                {badgeCounts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 xl:px-8 py-6">
          <div className="fade-in-up">
            {activeTab === 'characters' && <CharactersTab />}
            {activeTab === 'world' && <WorldBuildingTab />}
            {activeTab === 'themes' && <ThematicPillarsTab />}
            {activeTab === 'visual' && <VisualLanguageTab />}
          </div>
        </div>
      </div>
    </div>
  );
}