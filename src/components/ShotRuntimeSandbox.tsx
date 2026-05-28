'use client';

import { useMemo, useState } from 'react';
import { HV_TEST_HERO_001 } from '@/mock/shotData';
import { useStoryStore } from '@/store/storyStore';

export default function ShotRuntimeSandbox() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const activeShotId = useStoryStore((state) => state.active_shot_id);
  const shotRuntimes = useStoryStore((state) => state.shot_runtimes);
  const addShotRuntime = useStoryStore((state) => state.addShotRuntime);
  const generateShotPrompt = useStoryStore((state) => state.generateShotPrompt);
  const exportShotRenderPackage = useStoryStore((state) => state.exportShotRenderPackage);

  const activeShot = activeShotId ? shotRuntimes[activeShotId] : null;
  const promptText = activeShot?.P_Computed.prompt_text_en;
  const warnings = useMemo(
    () => activeShot?.P_Computed.prompt_debug.assembly_warnings ?? [],
    [activeShot]
  );

  const handleLoadMockShot = () => {
    addShotRuntime(HV_TEST_HERO_001);
    setLastAction(`Đã nạp ${HV_TEST_HERO_001.A_Identity.shot_id}`);
  };

  const handleGeneratePrompt = () => {
    if (!activeShotId) {
      setLastAction('Chưa có shot đang chọn.');
      return;
    }

    generateShotPrompt(activeShotId);
    setLastAction(`Đã sinh lời nhắc cho ${activeShotId}`);
  };

  const handleExportPackage = () => {
    if (!activeShotId) {
      setLastAction('Chưa có shot đang chọn.');
      return;
    }

    try {
      const pkg = exportShotRenderPackage(activeShotId, 'flux');
      console.log('RenderPackage:', pkg);
      setLastAction(`Đã xuất gói render cho ${activeShotId}. Kiểm tra console.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi xuất gói không xác định';
      console.error(error);
      setLastAction(message);
    }
  };

  return (
    <section className="mx-auto max-w-5xl space-y-4 rounded border border-slate-700 bg-slate-950 p-4 text-slate-100">
      <div className="flex flex-col gap-2 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Khu kiểm thử Shot Runtime</h2>
          <p className="text-sm text-slate-400">
            Shot đang chọn: {activeShotId ?? 'chưa có'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleLoadMockShot}
            className="rounded bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400"
          >
            Nạp shot mẫu
          </button>
          <button
            type="button"
            onClick={handleGeneratePrompt}
            disabled={!activeShotId}
            className="rounded bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            Sinh lời nhắc
          </button>
          <button
            type="button"
            onClick={handleExportPackage}
            disabled={!activeShotId}
            className="rounded bg-amber-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            Xuất gói
          </button>
        </div>
      </div>

      {lastAction && (
        <div className="rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300">
          {lastAction}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            P_Computed.prompt_text_en
          </h3>
          <pre className="min-h-48 overflow-auto whitespace-pre-wrap rounded bg-slate-900 p-3 text-sm leading-6 text-slate-100">
            {promptText ?? 'Chưa sinh lời nhắc.'}
          </pre>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Cảnh báo lắp ghép
          </h3>
          <div className="min-h-48 rounded bg-slate-900 p-3 text-sm text-slate-100">
            {warnings.length > 0 ? (
              <ul className="list-disc space-y-2 pl-5">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500">Không có cảnh báo.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
