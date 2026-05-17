'use client';
import React from 'react';
import { useStoryStore } from '@/store/storyStore';
import type { GenreTag, ToneTag } from '@/types';

const ALL_GENRES: GenreTag[] = [
  'Drama', 'Thriller', 'Sci-Fi', 'Horror', 'Comedy',
  'Action', 'Romance', 'Crime', 'Mystery', 'Fantasy',
  'Western', 'Documentary', 'Animation', 'Noir', 'Arthouse',
];

const ALL_TONES: ToneTag[] = [
  'Bleak', 'Hopeful', 'Sardonic', 'Lyrical', 'Visceral',
  'Contemplative', 'Frenetic', 'Intimate', 'Epic', 'Absurdist',
  'Tense', 'Melancholic', 'Euphoric', 'Gritty', 'Dreamlike',
];

export default function GenreToneSelector() {
  const genres = useStoryStore((s) => s.idea_core.genres);
  const tones = useStoryStore((s) => s.idea_core.tones);
  const toggleGenre = useStoryStore((s) => s.toggleGenre);
  const toggleTone = useStoryStore((s) => s.toggleTone);

  return (
    <div className="space-y-4">
      {/* Genre */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="panel-header">Thể Loại</span>
          <span className="font-mono-data text-[10px] text-primary">
            {genres.length} đã chọn
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ALL_GENRES.map((g) => (
            <button
              key={`genre-chip-${g}`}
              onClick={() => toggleGenre(g)}
              className={`tag-chip ${genres.includes(g) ? 'selected' : ''}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Tone */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="panel-header">Tone</span>
          <span className="font-mono-data text-[10px] text-primary">
            {tones.length} đã chọn
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TONES.map((t) => (
            <button
              key={`tone-chip-${t}`}
              onClick={() => toggleTone(t)}
              className={`tag-chip ${tones.includes(t) ? 'selected' : ''}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}