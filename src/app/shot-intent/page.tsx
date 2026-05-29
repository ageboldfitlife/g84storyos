'use client';

import { useMemo } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useStoryStore } from '@/store/storyStore';
import { getRuntimeValidationDiagnostics, isRuntimeExportReady } from '@/lib/runtime-validator';
import type { ShotRuntime } from '@/types/shot-runtime';

type ProductionStatus = 'NOT_GENERATED' | 'GENERATED' | 'QA_PASS' | 'FAILED';

function getShotSortKey(shot: ShotRuntime): string {
  return `${shot.A_Identity.scene_id}_${shot.A_Identity.shot_index
    .toString()
    .padStart(4, '0')}_${shot.A_Identity.shot_id}`;
}

function sortShotsByTimeline(shots: ShotRuntime[]): ShotRuntime[] {
  return [...shots].sort((a, b) => getShotSortKey(a).localeCompare(getShotSortKey(b)));
}

function getProductionStatus(shot: ShotRuntime): ProductionStatus {
  if (shot.Q_RenderState.status === 'FAILED' || shot.R_QAState.qa_status === 'FAIL') {
    return 'FAILED';
  }

  if (isRuntimeExportReady(shot)) {
    return 'QA_PASS';
  }

  if (shot.P_Computed.generation_status === 'generated' || shot.Q_RenderState.export_status === 'GENERATED') {
    return 'GENERATED';
  }

  return 'NOT_GENERATED';
}

function getStatusBadge(status: ProductionStatus): { label: string; className: string } {
  switch (status) {
    case 'QA_PASS':
      return { label: 'READY', className: 'border-green-700 bg-green-950 text-green-300' };
    case 'GENERATED':
      return { label: 'HYDRATED', className: 'border-blue-700 bg-blue-950 text-blue-300' };
    case 'FAILED':
      return { label: 'FAILED', className: 'border-red-700 bg-red-950 text-red-300' };
    case 'NOT_GENERATED':
    default:
      return { label: 'SKELETON', className: 'border-gray-700 bg-gray-900 text-gray-400' };
  }
}

function hasMotionRuntime(shot: ShotRuntime): boolean {
  return isRuntimeExportReady(shot);
}

function getStartFrameText(shot: ShotRuntime): string {
  return shot.E_Motion.start_frame_prompt || shot.D_Frames.start_frame.description || 'No start frame data.';
}

function getMotionText(shot: ShotRuntime): string {
  return shot.E_Motion.motion_intent || shot.E_Motion.main_action || 'No motion intent data.';
}

function getEndFrameText(shot: ShotRuntime): string {
  return shot.E_Motion.end_frame_prompt || shot.D_Frames.end_frame.description || 'No end frame data.';
}

function groupShotsByScene(shots: ShotRuntime[]): Record<string, ShotRuntime[]> {
  return sortShotsByTimeline(shots).reduce<Record<string, ShotRuntime[]>>((groups, shot) => {
    const sceneId = shot.A_Identity.scene_id;
    groups[sceneId] = [...(groups[sceneId] ?? []), shot];
    return groups;
  }, {});
}

function ShotLane({
  shot,
  previousShotId,
  nextShotId,
}: {
  shot: ShotRuntime;
  previousShotId: string | null;
  nextShotId: string | null;
}) {
  const setActiveShot = useStoryStore((state) => state.setActiveShot);
  const activeShotId = useStoryStore((state) => state.active_shot_id);
  const status = getProductionStatus(shot);
  const statusBadge = getStatusBadge(status);
  const diagnostics = getRuntimeValidationDiagnostics(shot);
  const isHydrated = status === 'GENERATED' || status === 'QA_PASS';
  const isReadyForExport = status === 'QA_PASS' && hasMotionRuntime(shot);
  const isActive = activeShotId === shot.A_Identity.shot_id;

  return (
    <article
      onClick={() => setActiveShot(shot.A_Identity.shot_id)}
      className={`w-full border p-4 ${
        isActive ? 'border-yellow-700 bg-black' : 'border-gray-800 bg-zinc-950'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-gray-100">
              {shot.A_Identity.shot_id}
            </span>
            <span className="border border-gray-700 bg-black px-2 py-1 text-xs text-gray-300">
              {shot.A_Identity.shot_type}
            </span>
            <span className={`border px-2 py-1 text-xs font-semibold ${statusBadge.className}`}>
              [{statusBadge.label}]
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Prev: {previousShotId ?? 'NONE'} | Next: {nextShotId ?? 'NONE'}
          </div>
        </div>

        {isReadyForExport && (
          <span className="shrink-0 border border-green-700 bg-green-950 px-2 py-1 text-xs font-semibold text-green-300">
            [READY FOR EXPORT]
          </span>
        )}
      </div>

      <div className="mt-3 text-sm text-gray-300">{shot.A_Identity.title}</div>
      <div className="mt-1 text-xs text-gray-500">{shot.B_Narrative.narrative_intent}</div>

      {status === 'FAILED' && (
        <div className="mt-4 rounded border border-red-800 bg-red-950/30 p-3 text-xs text-red-100">
          <div className="mb-1 font-semibold uppercase tracking-[0.25em] text-red-300">FAILED_FIELD</div>
          <div className="mb-2 text-sm text-red-100">{diagnostics.failedField ?? 'NONE'}</div>
          <div className="mb-1 font-semibold uppercase tracking-[0.25em] text-red-300">FAILED_SENTENCE</div>
          <div className="mb-2 text-sm text-red-100">{diagnostics.failedSentence || '—'}</div>
          <div className="mb-1 font-semibold uppercase tracking-[0.25em] text-red-300">FAILED_REASON</div>
          <div className="mb-2 text-sm text-red-100">{diagnostics.failedReason}</div>
          <div className="mb-1 font-semibold uppercase tracking-[0.25em] text-red-300">FAILED_TEXT</div>
          <div className="text-sm text-red-100">{diagnostics.failedText || '—'}</div>
          <div className="mt-3 space-y-1 border-t border-red-900 pt-3 text-[11px] text-red-200">
            {(['start_frame_prompt', 'motion_intent', 'end_frame_prompt'] as const).map((field) => {
              const item = diagnostics.fields[field];
              return (
                <div key={field} className="flex items-start justify-between gap-3">
                  <span className="font-semibold uppercase tracking-[0.2em]">{field}</span>
                  <span className={item.ok ? 'text-green-300' : 'text-red-200'}>{item.ok ? 'PASS' : 'FAIL'} — {item.reason}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isHydrated && (
        <div className="mt-4 flex flex-col gap-3">
          <section>
            <div className="mb-1 text-xs font-semibold text-gray-500">[ S ] START FRAME</div>
            <div className="max-h-28 overflow-y-auto bg-gray-900 p-2 text-sm leading-6 text-gray-300">
              {getStartFrameText(shot)}
            </div>
          </section>

          <section>
            <div className="mb-1 text-xs font-semibold text-gray-500">[ M ] MOTION INTENT</div>
            <div className="max-h-28 overflow-y-auto border-l-2 border-yellow-600 bg-gray-900 p-2 text-sm leading-6 text-gray-300">
              {getMotionText(shot)}
            </div>
          </section>

          <section>
            <div className="mb-1 text-xs font-semibold text-gray-500">[ E ] END FRAME</div>
            <div className="max-h-28 overflow-y-auto bg-gray-900 p-2 text-sm leading-6 text-gray-300">
              {getEndFrameText(shot)}
            </div>
          </section>
        </div>
      )}
    </article>
  );
}

function TimelineScene({
  sceneId,
  shots,
}: {
  sceneId: string;
  shots: ShotRuntime[];
}) {
  const sortedShots = sortShotsByTimeline(shots);

  return (
    <section className="flex flex-col">
      <header className="sticky top-0 z-10 border-b border-gray-700 bg-black/95 py-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-mono text-base font-semibold text-gray-100">
            {sceneId} - {sortedShots.length} SHOTS
          </h2>
          <span className="text-xs text-gray-500">PRODUCTION TIMELINE</span>
        </div>
      </header>

      <div className="flex flex-col gap-3 py-4">
        {sortedShots.map((shot, index) => (
          <ShotLane
            key={shot.A_Identity.shot_id}
            shot={shot}
            previousShotId={sortedShots[index - 1]?.A_Identity.shot_id ?? null}
            nextShotId={sortedShots[index + 1]?.A_Identity.shot_id ?? null}
          />
        ))}
      </div>
    </section>
  );
}

function ShotIntentPageContent() {
  const shotRuntimes = useStoryStore((state) => state.shot_runtimes);

  const shots = useMemo(() => Object.values(shotRuntimes), [shotRuntimes]);
  const heroShots = useMemo(
    () => sortShotsByTimeline(shots.filter((shot) => shot.A_Identity.shot_type === 'HERO')),
    [shots]
  );
  const sceneGroups = useMemo(
    () => groupShotsByScene(shots.filter((shot) => shot.A_Identity.shot_type !== 'HERO')),
    [shots]
  );
  const sceneIds = useMemo(() => Object.keys(sceneGroups).sort(), [sceneGroups]);
  const skeletonCount = shots.filter((shot) => getProductionStatus(shot) === 'NOT_GENERATED').length;
  const readyCount = shots.filter((shot) => getProductionStatus(shot) === 'QA_PASS').length;
  const failedCount = shots.filter((shot) => getProductionStatus(shot) === 'FAILED').length;

  return (
    <main className="min-h-screen bg-zinc-950 text-gray-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-24 pt-6">
        <header className="border-b border-gray-800 pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 text-xs font-semibold text-yellow-500">T5 / ASSISTANT DIRECTOR WALL</div>
              <h1 className="text-2xl font-semibold text-gray-100">T5 - Shot Intent</h1>
              <p className="mt-2 text-sm text-gray-500">
                Timeline đọc theo trục dọc. Hero shot tách riêng. Production shots group theo scene.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="border border-gray-700 bg-black px-3 py-2 text-gray-300">
                TOTAL: {shots.length}
              </span>
              <span className="border border-gray-700 bg-gray-900 px-3 py-2 text-gray-400">
                SKELETON: {skeletonCount}
              </span>
              <span className="border border-green-700 bg-green-950 px-3 py-2 text-green-300">
                READY: {readyCount}
              </span>
              <span className="border border-red-700 bg-red-950 px-3 py-2 text-red-300">
                FAILED: {failedCount}
              </span>
            </div>
          </div>
        </header>

        <section className="flex flex-col border border-gray-800 bg-black">
          <header className="border-b border-gray-700 bg-black px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-mono text-base font-semibold text-yellow-500">
                GLOBAL HERO SHOTS
              </h2>
              <span className="text-xs text-gray-500">{heroShots.length} HERO</span>
            </div>
          </header>

          <div className="flex flex-col gap-3 p-4">
            {heroShots.length > 0 ? (
              heroShots.map((shot, index) => (
                <ShotLane
                  key={shot.A_Identity.shot_id}
                  shot={shot}
                  previousShotId={heroShots[index - 1]?.A_Identity.shot_id ?? null}
                  nextShotId={heroShots[index + 1]?.A_Identity.shot_id ?? null}
                />
              ))
            ) : (
              <div className="border border-gray-800 bg-zinc-950 p-4 text-sm text-gray-500">
                No global hero shots.
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          {sceneIds.length > 0 ? (
            sceneIds.map((sceneId) => (
              <TimelineScene key={sceneId} sceneId={sceneId} shots={sceneGroups[sceneId]} />
            ))
          ) : (
            <div className="border border-gray-800 bg-black p-4 text-sm text-gray-500">
              No scene production shots.
            </div>
          )}
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
