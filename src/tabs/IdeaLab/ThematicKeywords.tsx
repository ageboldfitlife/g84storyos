'use client';
import React, { useState } from 'react';
import { useStoryStore } from '@/store/storyStore';
import { Plus, X } from 'lucide-react';

export default function ThematicKeywords() {
  const keywords = useStoryStore((s) => s.idea_core.thematicKeywords);
  const addKeyword = useStoryStore((s) => s.addThematicKeyword);
  const removeKeyword = useStoryStore((s) => s.removeThematicKeyword);
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed)) {
      addKeyword(trimmed);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Backspace' && !input && keywords.length > 0) {
      removeKeyword(keywords[keywords.length - 1]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="panel-header">Từ Khóa Chủ Đề</span>
        <span className="font-mono-data text-[10px] text-muted-foreground">
          {keywords.length} / 12
        </span>
      </div>

      <div className="min-h-[48px] flex flex-wrap gap-1.5 p-2 rounded border border-border bg-input focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
        {keywords.map((kw) => (
          <span
            key={`kw-${kw}`}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/15 border border-primary/30 text-xs text-primary"
          >
            {kw}
            <button
              onClick={() => removeKeyword(kw)}
              className="text-primary/60 hover:text-primary transition-colors"
              aria-label={`Remove keyword ${kw}`}
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={keywords.length === 0 ? 'Thêm từ khóa chủ đề...' : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none border-none"
          style={{ padding: '2px 4px' }}
        />
      </div>

      <button
        onClick={handleAdd}
        disabled={!input.trim()}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus size={12} />
        Thêm từ khóa
      </button>

      <p className="text-[10px] text-muted-foreground">
        Các khái niệm đơn từ hoặc cụm ngắn mà câu chuyện khám phá. Nhấn Enter hoặc dấu phẩy để thêm.
      </p>
    </div>
  );
}