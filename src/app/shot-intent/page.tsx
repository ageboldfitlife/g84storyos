'use client';

import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { HV_TEST_HERO_001 } from '@/mock/shotData';
import { useStoryStore } from '@/store/storyStore';
import type { QAReport } from '@/lib/qa-checker';
import type { ShotRuntime } from '@/types/shot-runtime';

type QAReviewCheck = 'face' | 'hand' | 'outfit' | 'prop' | 'topology' | 'lighting' | 'continuity';

const QA_REVIEW_CHECKS: Array<{ key: QAReviewCheck; label: string }> = [
  { key: 'face', label: 'Face (Mặt)' },
  { key: 'hand', label: 'Hand (Tay)' },
  { key: 'outfit', label: 'Outfit (Trang phục)' },
  { key: 'prop', label: 'Prop (Đạo cụ)' },
  { key: 'topology', label: 'Topology (Không gian)' },
  { key: 'lighting', label: 'Lighting/DNA (Ánh sáng)' },
  { key: 'continuity', label: 'Continuity (Rắc-co)' },
];

function ShotQAReviewForm({ shot }: { shot: ShotRuntime }) {
  const updateShotRuntime = useStoryStore((state) => state.updateShotRuntime);
  const applyShotQAReport = useStoryStore((state) => state.applyShotQAReport);
  const [renderResultUrl, setRenderResultUrl] = useState(shot.Q_RenderState.render_result_url ?? '');
  const [issuesText, setIssuesText] = useState(shot.R_QAState.issues.join(', '));
  const [checks, setChecks] = useState<Record<QAReviewCheck, boolean>>({
    face: true,
    hand: true,
    outfit: true,
    prop: true,
    topology: true,
    lighting: true,
    continuity: true,
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const shotId = shot.A_Identity.shot_id;
    const issues = issuesText
      .split(',')
      .map((issue) => issue.trim())
      .filter(Boolean);

    updateShotRuntime(shotId, {
      Q_RenderState: {
        ...shot.Q_RenderState,
        render_result_url: renderResultUrl.trim() || null,
      },
    });

    const report: QAReport = {
      face: checks.face,
      hand: checks.hand,
      outfit: checks.outfit,
      prop: checks.prop,
      topology: checks.topology,
      lighting: checks.lighting,
      motion: true,
      json: true,
      continuity: checks.continuity,
      issues,
      reviewer: 'director',
    };

    applyShotQAReport(shotId, report);
  };

  return (
    <form
      onSubmit={handleSubmit}
      onClick={(event) => event.stopPropagation()}
      className="space-y-3 rounded border border-zinc-800 bg-zinc-950 p-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-amber-300">
          QA Review Form
        </div>
        <span
          className={`rounded px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
            shot.R_QAState.qa_status === 'PASS'
              ? 'bg-emerald-500/15 text-emerald-300'
              : shot.R_QAState.qa_status === 'FAIL'
                ? 'bg-red-500/15 text-red-300'
                : shot.R_QAState.qa_status === 'NEED_FIX'
                  ? 'bg-amber-500/15 text-amber-300'
                  : 'bg-zinc-800 text-zinc-400'
          }`}
        >
          {shot.R_QAState.qa_status}
        </span>
      </div>

      <label className="block space-y-1">
        <span className="text-xs text-zinc-500">Render result URL</span>
        <input
          value={renderResultUrl}
          onChange={(event) => setRenderResultUrl(event.target.value)}
          placeholder="https://drive.google.com/..."
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-amber-500/70"
        />
      </label>

      <div className="grid gap-2 sm:grid-cols-2">
        {QA_REVIEW_CHECKS.map((check) => (
          <label
            key={check.key}
            className="flex items-center gap-2 rounded border border-zinc-800 bg-zinc-900 px-2 py-2 text-xs text-zinc-300"
          >
            <input
              type="checkbox"
              checked={checks[check.key]}
              onChange={(event) =>
                setChecks((current) => ({ ...current, [check.key]: event.target.checked }))
              }
              className="h-4 w-4 accent-amber-500"
            />
            {check.label}
          </label>
        ))}
      </div>

      <label className="block space-y-1">
        <span className="text-xs text-zinc-500">Issues, phân cách bằng dấu phẩy</span>
        <input
          value={issuesText}
          onChange={(event) => setIssuesText(event.target.value)}
          placeholder="tay sai, ánh sáng lệch DNA..."
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-amber-500/70"
        />
      </label>

      <button
        type="submit"
        className="w-full rounded border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-amber-300 transition hover:bg-amber-500/20"
      >
        Submit QA Report
      </button>

      {shot.R_QAState.fix_instructions.length > 0 && (
        <div className="rounded border border-zinc-800 bg-zinc-900 p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Fix Instructions
          </div>
          <ul className="list-disc space-y-1 pl-4 text-xs leading-5 text-zinc-300">
            {shot.R_QAState.fix_instructions.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}

function ShotIntentPageContent() {
  const shotRuntimes = useStoryStore((state) => state.shot_runtimes);
  const activeShotId = useStoryStore((state) => state.active_shot_id);
  const addShotRuntime = useStoryStore((state) => state.addShotRuntime);
  const setActiveShot = useStoryStore((state) => state.setActiveShot);
  const generateShotPrompt = useStoryStore((state) => state.generateShotPrompt);
  const applyCinematicPattern = useStoryStore((state) => state.applyCinematicPattern);

  const shots = useMemo(() => Object.values(shotRuntimes), [shotRuntimes]);

  useEffect(() => {
    if (shots.length === 0) {
      addShotRuntime(HV_TEST_HERO_001);
    }
  }, [addShotRuntime, shots.length]);

  const promptGeneratedCount = shots.filter(
    (shot) => shot.P_Computed.generation_status === 'generated'
  ).length;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        <header className="flex flex-col gap-4 border-b border-zinc-800 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
                T5
              </span>
              <span className="rounded border border-zinc-700 px-2 py-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                Shot Runtime Live
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
              T5 - Shot Intent
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Quản lý danh sách Shot Runtime đã được nạp vào Store. Màn hình này chỉ đọc dữ liệu và kiểm tra trạng thái prompt.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => applyCinematicPattern('SC01', 'OPEN_E01_MYSTERY')}
              className="w-full rounded border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-300 transition hover:bg-amber-500/20"
            >
              APPLY OPENING PATTERN
            </button>

            <div className="grid grid-cols-3 gap-2 text-right">
              <div className="rounded border border-zinc-800 bg-zinc-900 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Shots</div>
                <div className="mt-1 text-xl font-semibold text-zinc-50">{shots.length}</div>
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-900 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Prompt</div>
                <div className="mt-1 text-xl font-semibold text-amber-300">{promptGeneratedCount}</div>
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-900 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Active</div>
                <div className="mt-1 truncate text-sm font-semibold text-zinc-200">
                  {activeShotId ?? 'none'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shots.map((shot) => {
            const identity = shot.A_Identity;
            const promptStatus = shot.P_Computed.generation_status;
            const isActive = activeShotId === identity.shot_id;
            const isGenerated = promptStatus === 'generated' || promptStatus === 'locked';
            const canShowQAForm = shot.Q_RenderState.status === 'EXPORTED_FOR_HUMAN_RENDER' || isGenerated;

            return (
              <article
                key={identity.shot_id}
                onClick={() => setActiveShot(identity.shot_id)}
                className={`rounded border p-4 text-left transition ${
                  isActive
                    ? 'border-amber-500/70 bg-amber-500/10'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-sm font-semibold text-zinc-100">
                      {identity.shot_id}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {identity.episode_id} / {identity.scene_id} / Index {identity.shot_index}
                    </div>
                  </div>
                  <span className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs font-semibold text-zinc-300">
                    {identity.shot_type}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-wide text-zinc-500">
                      AI Prompt
                    </span>
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
                        isGenerated
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {promptStatus}
                    </span>
                  </div>

                  <div className="text-sm font-medium text-zinc-200">{identity.title}</div>
                  <div className="line-clamp-2 text-xs leading-5 text-zinc-500">
                    {shot.B_Narrative.narrative_intent}
                  </div>

                  {promptStatus === 'not_generated' && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        generateShotPrompt(identity.shot_id);
                        setActiveShot(identity.shot_id);
                      }}
                      className="w-full rounded border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-amber-300 transition hover:bg-amber-500/20"
                    >
                      Generate AI Prompt
                    </button>
                  )}

                  {promptStatus === 'generated' && shot.P_Computed.prompt_text_en && (
                    <div className="rounded border border-zinc-800 bg-zinc-950 p-3">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                        Prompt Text
                      </div>
                      <p className="line-clamp-6 text-xs leading-5 text-zinc-300">
                        {shot.P_Computed.prompt_text_en}
                      </p>
                    </div>
                  )}

                  {canShowQAForm && <ShotQAReviewForm shot={shot} />}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

export default function ShotIntentPage() {
  return (
    <DashboardLayout>
      <ShotIntentPageContent />
    </DashboardLayout>
  );
}
