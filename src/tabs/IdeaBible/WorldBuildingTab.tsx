'use client';
import React, { useState } from 'react';
import { useStoryStore } from '@/store/storyStore';
import { Globe, MapPin, Clock, Users, BookOpen, Cpu, Mountain, Trash2 } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';



const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Setting: MapPin,
  Era: Clock,
  'Social Structure': Users,
  'Rule of World': BookOpen,
  Mythology: Globe,
  Technology: Cpu,
  Geography: Mountain,
};

const IMPORTANCE_CONFIG: Record<string, { label: string; color: string }> = {
  critical: { label: 'Cốt Lõi', color: '#C86464' },
  major: { label: 'Quan Trọng', color: '#D4A853' },
  minor: { label: 'Phụ', color: '#6B6560' },
};

export default function WorldBuildingTab() {
  const worldElements = useStoryStore((s) => s.idea_bible.worldElements);
  const removeWorldElement = useStoryStore((s) => s.removeWorldElement);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(worldElements.map((e) => e.category)))];

  const filtered = filterCategory === 'All'
    ? worldElements
    : worldElements.filter((e) => e.category === filterCategory);

  const criticalCount = worldElements.filter((e) => e.importance === 'critical').length;
  const majorCount = worldElements.filter((e) => e.importance === 'major').length;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/50 rounded border border-border px-3 py-2">
          <p className="panel-header">Tổng Yếu Tố</p>
          <p className="font-mono-data text-2xl font-bold text-primary mt-1">{worldElements.length}</p>
        </div>
        <div className="bg-muted/50 rounded border border-border px-3 py-2">
          <p className="panel-header">Cốt Lõi</p>
          <p className="font-mono-data text-2xl font-bold text-red-400 mt-1">{criticalCount}</p>
        </div>
        <div className="bg-muted/50 rounded border border-border px-3 py-2">
          <p className="panel-header">Quan Trọng</p>
          <p className="font-mono-data text-2xl font-bold mt-1" style={{ color: '#D4A853' }}>{majorCount}</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={`world-filter-${cat}`}
            onClick={() => setFilterCategory(cat)}
            className={`tag-chip ${filterCategory === cat ? 'selected' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Element List */}
      <div className="space-y-2">
        {filtered.map((el) => {
          const Icon = CATEGORY_ICONS[el.category] ?? Globe;
          const imp = IMPORTANCE_CONFIG[el.importance];
          const isExp = expandedId === el.id;

          return (
            <div
              key={`world-el-${el.id}`}
              className="rounded border border-border bg-card overflow-hidden"
            >
              <div
                className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(isExp ? null : el.id)}
              >
                <div className="flex-shrink-0 w-7 h-7 rounded bg-muted flex items-center justify-center mt-0.5">
                  <Icon size={13} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{el.title}</span>
                    <span
                      className="cinema-badge"
                      style={{
                        backgroundColor: `${imp.color}15`,
                        color: imp.color,
                        border: `1px solid ${imp.color}30`,
                        fontSize: '9px',
                      }}
                    >
                      {imp.label}
                    </span>
                    <span className="cinema-badge status-seed" style={{ fontSize: '9px' }}>
                      {el.category}
                    </span>
                  </div>
                  {!isExp && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {el.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeWorldElement(el.id); }}
                  className="flex-shrink-0 p-1 rounded text-muted-foreground hover:text-red-400 transition-colors"
                  aria-label="Xóa yếu tố"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              {isExp && (
                <div className="px-4 py-3 border-t border-border bg-muted/10 fade-in-up">
                  <p className="text-sm text-foreground/80 leading-relaxed">{el.description}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border rounded">
          <Globe size={28} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Không có yếu tố nào trong danh mục này</p>
        </div>
      )}
    </div>
  );
}