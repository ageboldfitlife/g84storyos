'use client';
import React, { useState } from 'react';
import Header from '@/layouts/Header';
import LoglineBuilder from './LoglineBuilder';
import PremisePanel from './PremisePanel';
import GenreToneSelector from './GenreToneSelector';
import ThematicKeywords from './ThematicKeywords';
import InfluenceBoard from './InfluenceBoard';
import IdeaStatusPanel from './IdeaStatusPanel';
import { useStoryStore } from '@/store/storyStore';
import { Save, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';

const BeatCoverageChart = dynamic(() => import('@/components/BeatCoverageChart'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-muted rounded h-[80px] w-full" />,
});

export default function IdeaLabContent() {
  const projectTitle = useStoryStore((s) => s?.project_meta?.title);
  const setProjectTitle = useStoryStore((s) => s?.setProjectTitle);
  const beatMap = useStoryStore((s) => s?.beat_map);
  const resetToMock = useStoryStore((s) => s?.resetToMock);
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(projectTitle);
  const [saved, setSaved] = useState(false);

  const handleTitleSave = () => {
    setProjectTitle(titleValue);
    setTitleEditing(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const lockedBeats = beatMap?.filter((b) => b?.status === 'locked')?.length;
  const sketchedBeats = beatMap?.filter((b) => b?.status === 'sketched')?.length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Idea Lab"
        subtitle="Khai hỏa Concept — Logline, Premise, thể loại, Tone, nguồn cảm hứng"
        tabNumber={1}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={resetToMock}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-all duration-150 active:scale-95"
              title="Khôi phục dữ liệu demo"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Khôi Phục</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all duration-150 active:scale-95"
              style={{
                backgroundColor: saved ? 'rgba(130, 200, 130, 0.15)' : 'rgba(212, 168, 83, 0.15)',
                color: saved ? '#82C882' : 'var(--primary)',
                border: saved ? '1px solid rgba(130, 200, 130, 0.3)' : '1px solid rgba(212, 168, 83, 0.3)',
              }}
            >
              <Save size={12} />
              <span className="hidden sm:inline">{saved ? 'Đã Lưu ✓' : 'Lưu'}</span>
            </button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 xl:px-8 py-6">

          {/* Project Title */}
          <div className="mb-6">
            {titleEditing ? (
              <div className="flex items-center gap-2">
                <input
                  value={titleValue}
                  onChange={(e) => setTitleValue(e?.target?.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => e?.key === 'Enter' && handleTitleSave()}
                  autoFocus
                  className="text-2xl font-semibold bg-transparent border-b border-primary text-foreground outline-none w-full pb-1"
                />
              </div>
            ) : (
              <button
                onClick={() => { setTitleEditing(true); setTitleValue(projectTitle); }}
                className="group text-left"
              >
                <h2 className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {projectTitle}
                  <span className="ml-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity text-lg">✎</span>
                </h2>
              </button>
            )}
            <p className="text-xs text-muted-foreground mt-1 font-mono-data">
              Nhấn vào tiêu đề để đổi tên dự án
            </p>
          </div>

          {/* Beat Coverage Quick View */}
          <div className="mb-6 bg-card rounded border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="panel-header">Tổng Quan Beat Map</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#82C882' }} />
                  <span className="font-mono-data text-[10px] text-muted-foreground">{lockedBeats} đã khóa</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#D4A853' }} />
                  <span className="font-mono-data text-[10px] text-muted-foreground">{sketchedBeats} phác thảo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#2A2A2E' }} />
                  <span className="font-mono-data text-[10px] text-muted-foreground">{beatMap?.length - lockedBeats - sketchedBeats} trống</span>
                </div>
              </div>
            </div>
            <BeatCoverageChart beats={beatMap} />
          </div>

          {/* Main 3-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5">

            {/* Left Column: Logline + Premise */}
            <div className="lg:col-span-2 space-y-5">

              {/* Logline */}
              <div className="bg-card rounded border border-border p-4">
                <LoglineBuilder />
              </div>

              {/* Premise */}
              <div className="bg-card rounded border border-border p-4">
                <PremisePanel />
              </div>

              {/* Genre + Tone */}
              <div className="bg-card rounded border border-border p-4">
                <GenreToneSelector />
              </div>

              {/* Thematic Keywords */}
              <div className="bg-card rounded border border-border p-4">
                <ThematicKeywords />
              </div>
            </div>

            {/* Right Column: Status + Influences */}
            <div className="space-y-5">

              {/* Idea Status / Concept Strength */}
              <div className="bg-card rounded border border-border p-4">
                <IdeaStatusPanel />
              </div>

              {/* Influence Board */}
              <div className="bg-card rounded border border-border p-4">
                <InfluenceBoard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}