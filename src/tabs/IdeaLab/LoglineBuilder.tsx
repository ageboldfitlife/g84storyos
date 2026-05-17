'use client';
import React, { useState } from 'react';
import { useStoryStore } from '@/store/storyStore';
import { Copy, Check } from 'lucide-react';

export default function LoglineBuilder() {
  const logline = useStoryStore((s) => s?.idea_core?.logline);
  const setLogline = useStoryStore((s) => s?.setLogline);
  const [copied, setCopied] = useState(false);

  const wordCount = logline?.trim()?.split(/\s+/)?.filter(Boolean)?.length;
  const charCount = logline?.length;

  const isOptimal = wordCount >= 25 && wordCount <= 50;
  const tooShort = wordCount < 25;

  const handleCopy = () => {
    navigator.clipboard?.writeText(logline);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="panel-header">Logline</span>
        <div className="flex items-center gap-3">
          <span
            className={`font-mono-data text-[10px] ${
              isOptimal ? 'text-green-400' : tooShort ? 'text-primary' : 'text-red-400'
            }`}
          >
            {wordCount}w · {charCount}ch
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Sao chép Logline"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          </button>
        </div>
      </div>
      <textarea
        value={logline}
        onChange={(e) => setLogline(e?.target?.value)}
        rows={4}
        className="w-full px-3 py-2.5 text-sm leading-relaxed resize-none rounded border border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
        placeholder="Một [nhân vật] phải [mục tiêu] trước khi [cái giá phải trả] — nhưng [chướng ngại vật] đứng chắn đường."
        spellCheck={false}
      />
      {/* Formula Guide */}
      <div className="bg-muted/50 rounded px-3 py-2 border border-border">
        <p className="panel-header mb-1.5">Công Thức Logline</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {[
            ['Nhân Vật', 'Câu chuyện kể về ai?'],
            ['Mục Tiêu', 'Họ muốn gì?'],
            ['Cái Giá', 'Điều gì xảy ra nếu họ thất bại?'],
            ['Chướng Ngại', 'Điều gì cản đường họ?'],
          ]?.map(([label, hint]) => (
            <div key={`formula-${label}`} className="flex flex-col">
              <span className="text-[10px] font-semibold text-primary">{label}</span>
              <span className="text-[10px] text-muted-foreground">{hint}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Strength Indicator */}
      <div className="concept-strength-bar">
        <div
          className="concept-strength-fill"
          style={{
            width: `${Math.min((wordCount / 50) * 100, 100)}%`,
            backgroundColor: isOptimal ? '#82C882' : tooShort ? '#D4A853' : '#C86464',
          }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        {tooShort
          ? `Thêm ${25 - wordCount} từ nữa để đạt Logline tối ưu`
          : isOptimal
          ? 'Độ dài Logline đã tối ưu (25–50 từ)'
          : 'Cân nhắc rút gọn — Logline trên 50 từ sẽ mất trọng tâm'}
      </p>
    </div>
  );
}