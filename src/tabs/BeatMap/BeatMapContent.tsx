'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GripVertical, ChevronDown, Zap, Film, Target, Eye } from 'lucide-react';
import { useStoryStore } from '@/store/storyStore';
import type { BeatCard, EnergyLevel } from '@/types';

const DEFAULT_BEATS: BeatCard[] = [
  { id: 'beat-1', order: 0, title: '1. Hook', subtitle: 'Mở màn', emotionalGoal: '', visualGoal: '', energyLevel: 'Cao' },
  { id: 'beat-2', order: 1, title: '2. Setup', subtitle: 'Thiết lập', emotionalGoal: '', visualGoal: '', energyLevel: 'Vừa' },
  { id: 'beat-3', order: 2, title: '3. Inciting Incident', subtitle: 'Biến cố', emotionalGoal: '', visualGoal: '', energyLevel: 'Cao' },
  { id: 'beat-4', order: 3, title: '4. Pressure', subtitle: 'Áp lực', emotionalGoal: '', visualGoal: '', energyLevel: 'Vừa' },
  { id: 'beat-5', order: 4, title: '5. Reversal', subtitle: 'Đảo chiều', emotionalGoal: '', visualGoal: '', energyLevel: 'Cao' },
  { id: 'beat-6', order: 5, title: '6. Climax', subtitle: 'Cao trào', emotionalGoal: '', visualGoal: '', energyLevel: 'Bùng nổ' },
  { id: 'beat-7', order: 6, title: '7. Resolution', subtitle: 'Giải quyết', emotionalGoal: '', visualGoal: '', energyLevel: 'Thấp' },
];

const ENERGY_CONFIG: Record<EnergyLevel, { color: string; border: string; bg: string; dot: string }> = {
  'Thấp':    { color: '#6BA8E8', border: 'border-[#6BA8E8]/60', bg: 'bg-[#6BA8E8]/10', dot: '#6BA8E8' },
  'Vừa':     { color: '#D4A853', border: 'border-[#D4A853]/60', bg: 'bg-[#D4A853]/10', dot: '#D4A853' },
  'Cao':     { color: '#82C882', border: 'border-[#82C882]/60', bg: 'bg-[#82C882]/10', dot: '#82C882' },
  'Bùng nổ': { color: '#E85C5C', border: 'border-[#E85C5C]/80', bg: 'bg-[#E85C5C]/10', dot: '#E85C5C' },
};

const ENERGY_LEVELS: EnergyLevel[] = ['Thấp', 'Vừa', 'Cao', 'Bùng nổ'];

function initBeatsFromStore(storeBeatMap: any[]): BeatCard[] {
  if (storeBeatMap && storeBeatMap.length > 0 && storeBeatMap[0]?.emotionalGoal !== undefined) {
    return storeBeatMap as BeatCard[];
  }
  return DEFAULT_BEATS;
}

export default function BeatMapContent() {
  const storeBeatMap = useStoryStore((s) => s.beat_map);
  const setBeatMap = useStoryStore((s) => s.setBeatMap);

  const [beats, setBeats] = useState<BeatCard[]>(() => initBeatsFromStore(storeBeatMap as any[]));
  const [expandedId, setExpandedId] = useState<string | null>('beat-1');
  const [openEnergyId, setOpenEnergyId] = useState<string | null>(null);

  // Drag state
  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Sync to store whenever beats change
  useEffect(() => {
    setBeatMap(beats as any[]);
  }, [beats, setBeatMap]);

  const updateBeat = useCallback((id: string, field: keyof BeatCard, value: string) => {
    setBeats((prev) => prev.map((b) => b.id === id ? { ...b, [field]: value } : b));
  }, []);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, index: number, id: string) => {
    dragIndex.current = index;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverIndex.current = index;
    setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === dropIndex) {
      setDraggingId(null);
      setDragOverId(null);
      dragIndex.current = null;
      dragOverIndex.current = null;
      return;
    }
    setBeats((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(dropIndex, 0, moved);
      return updated.map((b, i) => ({ ...b, order: i }));
    });
    setDraggingId(null);
    setDragOverId(null);
    dragIndex.current = null;
    dragOverIndex.current = null;
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
    dragIndex.current = null;
    dragOverIndex.current = null;
  };

  const completedCount = beats.filter((b) => b.emotionalGoal.trim() || b.visualGoal.trim()).length;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10 border border-primary/30">
              <Film size={16} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-foreground tracking-tight">Beat Map</h1>
                <span className="font-mono-data text-[10px] text-primary tracking-widest border border-primary/30 px-1.5 py-0.5 rounded">MODULE 03</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Bản Đồ Nhịp Phim — Kéo thả để sắp xếp cấu trúc tự sự</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-mono-data text-xs text-primary">{completedCount}/{beats.length}</div>
              <div className="text-[10px] text-muted-foreground">Nhịp hoàn thành</div>
            </div>
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(completedCount / beats.length) * 100}%`,
                  background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Energy Legend */}
      <div className="flex-shrink-0 px-6 py-2 border-b border-border/50 bg-card/30 flex items-center gap-4 overflow-x-auto">
        <span className="text-[10px] text-muted-foreground font-mono-data tracking-widest flex-shrink-0">MỨC NĂNG LƯỢNG:</span>
        {ENERGY_LEVELS.map((level) => (
          <div key={level} className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ENERGY_CONFIG[level].dot }} />
            <span className="text-[11px] text-muted-foreground">{level}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
        {beats.map((beat, index) => {
          const energy = ENERGY_CONFIG[beat.energyLevel];
          const isExpanded = expandedId === beat.id;
          const isDragging = draggingId === beat.id;
          const isDragOver = dragOverId === beat.id && draggingId !== beat.id;

          return (
            <div
              key={beat.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index, beat.id)}
              onDragOver={(e) => handleDragOver(e, index, beat.id)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                rounded-lg border-2 transition-all duration-200 select-none
                ${energy.border} ${energy.bg}
                ${isDragging ? 'opacity-40 scale-[0.98]' : 'opacity-100'}
                ${isDragOver ? 'ring-2 ring-primary/60 scale-[1.01]' : ''}
                cursor-grab active:cursor-grabbing
              `}
            >
              {/* Card Header */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                onClick={() => setExpandedId(isExpanded ? null : beat.id)}
              >
                {/* Drag Handle */}
                <div className="flex-shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                  <GripVertical size={16} />
                </div>

                {/* Order Badge */}
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono-data font-bold"
                  style={{ backgroundColor: `${energy.dot}20`, color: energy.dot, border: `1px solid ${energy.dot}40` }}
                >
                  {index + 1}
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">{beat.title}</span>
                    <span className="text-[11px] text-muted-foreground">— {beat.subtitle}</span>
                  </div>
                  {!isExpanded && (beat.emotionalGoal || beat.visualGoal) && (
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {beat.emotionalGoal || beat.visualGoal}
                    </p>
                  )}
                </div>

                {/* Energy Badge */}
                <div
                  className="flex-shrink-0 flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium"
                  style={{ backgroundColor: `${energy.dot}15`, color: energy.dot, border: `1px solid ${energy.dot}30` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenEnergyId(openEnergyId === beat.id ? null : beat.id);
                  }}
                >
                  <Zap size={10} />
                  <span>{beat.energyLevel}</span>
                  <ChevronDown size={10} className={`transition-transform ${openEnergyId === beat.id ? 'rotate-180' : ''}`} />
                </div>

                {/* Expand toggle */}
                <ChevronDown
                  size={14}
                  className={`flex-shrink-0 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </div>

              {/* Energy Dropdown */}
              {openEnergyId === beat.id && (
                <div className="mx-4 mb-2 rounded border border-border bg-card shadow-lg z-10 relative">
                  {ENERGY_LEVELS.map((level) => {
                    const cfg = ENERGY_CONFIG[level];
                    return (
                      <button
                        key={level}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 transition-colors text-left ${beat.energyLevel === level ? 'bg-muted/30' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateBeat(beat.id, 'energyLevel', level);
                          setOpenEnergyId(null);
                        }}
                      >
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.dot }} />
                        <span style={{ color: cfg.color }}>{level}</span>
                        {beat.energyLevel === level && (
                          <span className="ml-auto text-[10px] text-muted-foreground">✓ Đang chọn</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Expanded Form */}
              {isExpanded && (
                <div
                  className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Emotional Goal */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                      <Target size={11} style={{ color: energy.dot }} />
                      Mục tiêu Cảm xúc
                    </label>
                    <textarea
                      value={beat.emotionalGoal}
                      onChange={(e) => updateBeat(beat.id, 'emotionalGoal', e.target.value)}
                      placeholder="Khán giả cần cảm thấy điều gì trong nhịp này? (VD: Sợ hãi, hy vọng, bị phản bội...)"
                      rows={2}
                      className="w-full bg-background/60 border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/60 transition-colors"
                      style={{ fontFamily: 'inherit' }}
                    />
                  </div>

                  {/* Visual Goal */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                      <Eye size={11} style={{ color: energy.dot }} />
                      Mục tiêu Hình ảnh
                    </label>
                    <textarea
                      value={beat.visualGoal}
                      onChange={(e) => updateBeat(beat.id, 'visualGoal', e.target.value)}
                      placeholder="Hình ảnh chủ đạo của nhịp này là gì? (VD: Cận cảnh bàn tay run rẩy, góc máy thấp, ánh sáng đỏ...)"
                      rows={2}
                      className="w-full bg-background/60 border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/60 transition-colors"
                      style={{ fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Timeline connector hint */}
        <div className="flex items-center justify-center py-3 gap-3">
          <div className="h-px flex-1 bg-border/30" />
          <span className="text-[10px] text-muted-foreground/50 font-mono-data tracking-widest">KẾT THÚC TIMELINE</span>
          <div className="h-px flex-1 bg-border/30" />
        </div>
      </div>
    </div>
  );
}
