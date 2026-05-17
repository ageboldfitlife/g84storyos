'use client';
import React from 'react';
import { useStoryStore } from '@/store/storyStore';
import CharacterCard from './CharacterCard';
import { Users, Plus } from 'lucide-react';

export default function CharactersTab() {
  const characters = useStoryStore((s) => s.idea_bible.characters);
  const updateCharacter = useStoryStore((s) => s.updateCharacter);
  const removeCharacter = useStoryStore((s) => s.removeCharacter);

  const archetypeCounts = characters.reduce<Record<string, number>>((acc, c) => {
    acc[c.archetype] = (acc[c.archetype] ?? 0) + 1;
    return acc;
  }, {});

  const lockedArcs = characters.filter((c) => c.arcStatus === 'locked').length;
  const developedArcs = characters.filter((c) => c.arcStatus === 'developed').length;

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tổng Nhân Vật', value: characters.length, color: 'var(--primary)' },
          { label: 'Arc Đã Khóa', value: lockedArcs, color: '#82C882' },
          { label: 'Arc Đã Phát Triển', value: developedArcs, color: '#6BA8E8' },
          { label: 'Archetype Đã Dùng', value: Object.keys(archetypeCounts).length, color: '#B882D8' },
        ].map((stat) => (
          <div key={`char-stat-${stat.label}`} className="bg-muted/50 rounded border border-border px-3 py-2">
            <p className="panel-header">{stat.label}</p>
            <p
              className="font-mono-data text-2xl font-bold mt-1"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Character Grid */}
      {characters.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-2 gap-3">
          {characters.map((char) => (
            <CharacterCard
              key={`char-card-${char.id}`}
              character={char}
              onUpdate={updateCharacter}
              onRemove={removeCharacter}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-border rounded">
          <Users size={32} className="mx-auto text-muted-foreground mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">Chưa có nhân vật nào</h3>
          <p className="text-xs text-muted-foreground">
            Thế giới câu chuyện còn trống. Thêm nhân vật để xây dựng Bible.
          </p>
          <button className="mt-4 flex items-center gap-1.5 mx-auto px-4 py-2 rounded text-sm font-semibold bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20 transition-all active:scale-95">
            <Plus size={14} />
            Thêm Nhân Vật Đầu Tiên
          </button>
        </div>
      )}
    </div>
  );
}