'use client';
import React, { useState } from 'react';
import type { Character } from '@/types';
import { ChevronDown, ChevronUp, Target, Heart, AlertTriangle } from 'lucide-react';

const ARCHETYPE_COLORS: Record<string, string> = {
  'The Hero': '#6BA8E8',
  'The Shadow': '#C86464',
  'The Mentor': '#D4A853',
  'The Trickster': '#E8A87C',
  'The Herald': '#82C882',
  'The Shapeshifter': '#B882D8',
  'The Guardian': '#6BB8A8',
  'The Ally': '#A8C870',
};

const ARC_STATUS_LABELS: Record<string, string> = {
  undefined: 'Chưa Xác Định',
  sketched: 'Phác Thảo',
  developed: 'Đã Phát Triển',
  locked: 'Đã Khóa',
};

const ARC_STATUS_COLORS: Record<string, string> = {
  undefined: '#6B6560',
  sketched: '#D4A853',
  developed: '#6BA8E8',
  locked: '#82C882',
};

interface CharacterCardProps {
  character: Character;
  onUpdate: (id: string, updates: Partial<Character>) => void;
  onRemove: (id: string) => void;
}

export default function CharacterCard({ character, onUpdate, onRemove }: CharacterCardProps) {
  const [expanded, setExpanded] = useState(false);
  const archetypeColor = ARCHETYPE_COLORS[character.archetype] ?? '#D4A853';

  return (
    <div
      className="character-card-hover rounded border bg-card overflow-hidden"
      style={{ borderColor: expanded ? `${archetypeColor}40` : 'var(--border)' }}
    >
      {/* Card Header */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {/* Color accent circle */}
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: `${archetypeColor}20`,
                border: `2px solid ${archetypeColor}50`,
                color: archetypeColor,
              }}
            >
              {character.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate">{character.name}</h3>
              <span
                className="cinema-badge mt-0.5"
                style={{
                  backgroundColor: `${archetypeColor}15`,
                  color: archetypeColor,
                  border: `1px solid ${archetypeColor}30`,
                  fontSize: '9px',
                }}
              >
                {character.archetype}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span
              className="cinema-badge"
              style={{
                backgroundColor: `${ARC_STATUS_COLORS[character.arcStatus]}15`,
                color: ARC_STATUS_COLORS[character.arcStatus],
                border: `1px solid ${ARC_STATUS_COLORS[character.arcStatus]}30`,
                fontSize: '9px',
              }}
            >
              {ARC_STATUS_LABELS[character.arcStatus]}
            </span>
            <button
              onClick={() => setExpanded((e) => !e)}
              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
              aria-label={expanded ? 'Thu gọn nhân vật' : 'Mở rộng nhân vật'}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
          {character.logline}
        </p>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-border fade-in-up">
          {/* Want / Need / Fear Triangle */}
          <div className="grid grid-cols-3 gap-0 divide-x divide-border">
            <div className="px-3 py-2.5">
              <div className="flex items-center gap-1 mb-1">
                <Target size={10} className="text-primary" />
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">Muốn</span>
              </div>
              <p className="text-[11px] text-foreground/80 leading-relaxed">{character.want}</p>
            </div>
            <div className="px-3 py-2.5">
              <div className="flex items-center gap-1 mb-1">
                <Heart size={10} className="text-blue-400" />
                <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide">Cần</span>
              </div>
              <p className="text-[11px] text-foreground/80 leading-relaxed">{character.need}</p>
            </div>
            <div className="px-3 py-2.5">
              <div className="flex items-center gap-1 mb-1">
                <AlertTriangle size={10} className="text-red-400" />
                <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">Sợ</span>
              </div>
              <p className="text-[11px] text-foreground/80 leading-relaxed">{character.fear}</p>
            </div>
          </div>

          {/* Arc */}
          <div className="px-4 py-3 border-t border-border">
            <span className="panel-header block mb-1">Character Arc</span>
            <p className="text-xs text-foreground/80 leading-relaxed">{character.arc}</p>
          </div>

          {/* Notes */}
          {character.notes && (
            <div className="px-4 py-3 border-t border-border bg-muted/20">
              <span className="panel-header block mb-1">Ghi Chú Đạo Diễn</span>
              <p className="text-xs text-muted-foreground leading-relaxed italic">{character.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="px-4 py-2 border-t border-border flex items-center justify-between">
            <select
              value={character.arcStatus}
              onChange={(e) => onUpdate(character.id, { arcStatus: e.target.value as Character['arcStatus'] })}
              className="text-[11px] bg-muted border border-border rounded px-2 py-1 text-foreground cursor-pointer"
            >
              <option value="undefined">Arc: Chưa Xác Định</option>
              <option value="sketched">Arc: Phác Thảo</option>
              <option value="developed">Arc: Đã Phát Triển</option>
              <option value="locked">Arc: Đã Khóa</option>
            </select>
            <button
              onClick={() => onRemove(character.id)}
              className="text-[11px] text-red-400/60 hover:text-red-400 transition-colors"
            >
              Xóa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}