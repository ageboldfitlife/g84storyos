'use client';

import { useMemo, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useStoryStore } from '@/store/storyStore';
import {
  compileToolPromptPackage,
  type CompiledRenderExport,
  type ToolPromptTarget,
} from '@/lib/tool-prompt-compiler';
import { isRuntimeExportReady } from '@/lib/runtime-validator';

const TOOL_PROMPT_TARGETS: ToolPromptTarget[] = ['nano_banana', 'gpt_image', 'flux_basic'];

function sanitizeFilenameSegment(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function buildExportFilename(kind: 'MASTER' | 'START_FRAMES' | 'END_FRAMES' | 'MOTION', projectId: string, episodeId: string, episodeTitle: string, targetTool: string, version: string): string {
  const base = [projectId, episodeId, episodeTitle].map((value) => sanitizeFilenameSegment(value || 'UNKNOWN')).join('_');

  if (kind === 'MOTION') {
    return `${base}_${kind}_${sanitizeFilenameSegment(version)}.json`;
  }

  return `${base}_${kind}_${sanitizeFilenameSegment(targetTool)}_${sanitizeFilenameSegment(version)}.json`;
}

function downloadJson(filename: string, payload: unknown) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function stringifyPrompt(prompt: unknown): string {
  return typeof prompt === 'string' ? prompt : JSON.stringify(prompt, null, 2);
}

function ExportHubContent() {
  const { project_meta, shot_runtimes, exportShotRenderPackage, markShotAsExported } = useStoryStore();
  const [targetTool, setTargetTool] = useState<ToolPromptTarget>('flux_basic');

  const renderPackages = useMemo(() => {
    return Object.values(shot_runtimes).reduce<Array<{ shotId: string; pkg: CompiledRenderExport }>>(
      (packages, shot) => {
        if (shot.P_Computed.generation_status !== 'generated') return packages;
        if (!isRuntimeExportReady(shot)) return packages;

        try {
          const rawPackage = exportShotRenderPackage(shot.A_Identity.shot_id, 'flux');
          packages.push({
            shotId: shot.A_Identity.shot_id,
            pkg: compileToolPromptPackage(rawPackage, targetTool),
          });
        } catch (error) {
          console.error(`Cannot export package for ${shot.A_Identity.shot_id}:`, error);
        }

        return packages;
      },
      []
    );
  }, [exportShotRenderPackage, shot_runtimes, targetTool]);

  const exportMetadata = useMemo(() => {
    const firstPackage = renderPackages[0]?.pkg;

    return {
      projectId: project_meta.id || 'PROJECT',
      episodeId: firstPackage?.raw_render_package.episode_id || 'E01',
      episodeTitle: project_meta.title || 'EPISODE',
      version: project_meta.version || 'v001',
      targetTool,
    };
  }, [project_meta.id, project_meta.title, project_meta.version, renderPackages, targetTool]);

  const handleDownloadMaster = () => {
    downloadJson(
      buildExportFilename('MASTER', exportMetadata.projectId, exportMetadata.episodeId, exportMetadata.episodeTitle, exportMetadata.targetTool, exportMetadata.version),
      renderPackages.map((item) => ({
        shot_id: item.pkg.shot_id,
        target_tool: item.pkg.target_tool,
        raw_render_package: item.pkg.raw_render_package,
        tool_prompt_package: item.pkg.tool_prompt_package,
      }))
    );
  };

  const handleDownloadStartFrames = () => {
    downloadJson(
      buildExportFilename('START_FRAMES', exportMetadata.projectId, exportMetadata.episodeId, exportMetadata.episodeTitle, exportMetadata.targetTool, exportMetadata.version),
      renderPackages.map((item) => ({
        shot_id: item.pkg.shot_id,
        scene_id: item.pkg.raw_render_package.scene_id,
        episode_id: item.pkg.raw_render_package.episode_id,
        target_tool: item.pkg.target_tool,
        frame_type: 'START',
        prompt: item.pkg.tool_prompt_package.start_frame.prompt,
        negative_prompt: item.pkg.tool_prompt_package.start_frame.negative_prompt,
        reference_images: item.pkg.raw_render_package.reference_images,
        text_overlay: item.pkg.raw_render_package.text_overlay ?? '',
        seed: item.pkg.raw_render_package.seed,
      }))
    );
  };

  const handleDownloadEndFrames = () => {
    downloadJson(
      buildExportFilename('END_FRAMES', exportMetadata.projectId, exportMetadata.episodeId, exportMetadata.episodeTitle, exportMetadata.targetTool, exportMetadata.version),
      renderPackages.map((item) => ({
        shot_id: item.pkg.shot_id,
        scene_id: item.pkg.raw_render_package.scene_id,
        episode_id: item.pkg.raw_render_package.episode_id,
        target_tool: item.pkg.target_tool,
        frame_type: 'END',
        prompt: item.pkg.tool_prompt_package.end_frame.prompt,
        negative_prompt: item.pkg.tool_prompt_package.end_frame.negative_prompt,
        reference_images: item.pkg.raw_render_package.reference_images,
        text_overlay: item.pkg.raw_render_package.text_overlay ?? '',
        seed: item.pkg.raw_render_package.seed,
      }))
    );
  };

  const handleDownloadMotion = () => {
    downloadJson(
      buildExportFilename('MOTION', exportMetadata.projectId, exportMetadata.episodeId, exportMetadata.episodeTitle, exportMetadata.targetTool, exportMetadata.version),
      renderPackages.map((item) => ({
        shot_id: item.pkg.shot_id,
        scene_id: item.pkg.raw_render_package.scene_id,
        episode_id: item.pkg.raw_render_package.episode_id,
        motion_intent: item.pkg.tool_prompt_package.motion_intent,
        start_frame_asset_id: null,
        end_frame_asset_id: null,
        duration_target_sec: item.pkg.raw_render_package.duration_target_sec,
        camera_variant: 'A',
        notes: '',
      }))
    );
  };

  const handleDownloadAllLanes = () => {
    handleDownloadMaster();
    setTimeout(handleDownloadStartFrames, 120);
    setTimeout(handleDownloadEndFrames, 240);
    setTimeout(handleDownloadMotion, 360);
  };

  const handleDownloadAll = () => {
    downloadJson('RenderPackages_ALL.json', renderPackages.map((item) => item.pkg));
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-zinc-950 p-8 font-mono text-zinc-100">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-4 border-b border-zinc-800 pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-yellow-500">T6 - Tram xuat</h1>
              <p className="text-zinc-400">
                Xuat dual-layer JSON: raw render package va tool prompt package.
              </p>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <select
                value={targetTool}
                onChange={(event) => setTargetTool(event.target.value as ToolPromptTarget)}
                className="rounded border border-zinc-700 bg-black px-4 py-3 text-sm font-bold text-zinc-100 outline-none focus:border-yellow-500"
              >
                {TOOL_PROMPT_TARGETS.map((tool) => (
                  <option key={tool} value={tool}>
                    {tool}
                  </option>
                ))}
              </select>
              <button
                onClick={handleDownloadMaster}
                disabled={renderPackages.length === 0}
                className="rounded bg-yellow-600 px-4 py-3 font-bold text-black transition hover:bg-yellow-500 disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                EXPORT MASTER
              </button>
              <button
                onClick={handleDownloadStartFrames}
                disabled={renderPackages.length === 0}
                className="rounded bg-emerald-600 px-4 py-3 font-bold text-black transition hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                EXPORT START FRAMES
              </button>
              <button
                onClick={handleDownloadEndFrames}
                disabled={renderPackages.length === 0}
                className="rounded bg-rose-600 px-4 py-3 font-bold text-black transition hover:bg-rose-500 disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                EXPORT END FRAMES
              </button>
              <button
                onClick={handleDownloadMotion}
                disabled={renderPackages.length === 0}
                className="rounded bg-sky-600 px-4 py-3 font-bold text-black transition hover:bg-sky-500 disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                EXPORT MOTION
              </button>
              <button
                onClick={handleDownloadAllLanes}
                disabled={renderPackages.length === 0}
                className="rounded bg-violet-600 px-4 py-3 font-bold text-black transition hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                EXPORT ALL LANES
              </button>
              <button
                onClick={handleDownloadAll}
                disabled={renderPackages.length === 0}
                className="rounded bg-zinc-800 px-4 py-3 font-bold text-zinc-100 transition hover:bg-zinc-700 disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                LEGACY ALL JSON
              </button>
            </div>
          </div>

          {renderPackages.length === 0 ? (
            <div className="rounded border border-red-900 bg-zinc-900 p-8 text-center text-red-400">
              Chua co shot nao san sang xuat. Hay chay T4/T5 truoc.
            </div>
          ) : (
            <div className="grid gap-4">
              {renderPackages.map(({ shotId, pkg }) => (
                <article key={shotId} className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
                  <div className="mb-4 flex flex-col gap-3 border-b border-zinc-800 pb-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-zinc-200">{shotId}</h2>
                      <p className="text-xs text-zinc-500">
                        {pkg.raw_render_package.scene_id} / {pkg.raw_render_package.episode_id} / {pkg.target_tool}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                        NEGATIVE PROFILE ACTIVE: REALISM_V1
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(stringifyPrompt(pkg.tool_prompt_package.start_frame))}
                        className="rounded bg-zinc-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-zinc-700"
                      >
                        COPY START PROMPT
                      </button>
                      <button
                        onClick={() => downloadJson(`RenderPackage_${shotId}.json`, pkg)}
                        className="rounded bg-zinc-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-zinc-700"
                      >
                        TAI JSON
                      </button>
                      <button
                        onClick={() => markShotAsExported(shotId)}
                        className="rounded bg-yellow-600 px-4 py-2 text-sm font-bold text-black transition hover:bg-yellow-500"
                      >
                        DANH DAU DA XUAT
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="mb-2 text-xs font-bold text-zinc-500">START FRAME TOOL PROMPT</div>
                      <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded bg-black p-3 font-mono text-sm leading-6 text-green-400">
                        {stringifyPrompt(pkg.tool_prompt_package.start_frame)}
                      </pre>
                    </div>
                    <div>
                      <div className="mb-2 text-xs font-bold text-zinc-500">END FRAME TOOL PROMPT</div>
                      <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded bg-black p-3 font-mono text-sm leading-6 text-red-400">
                        {stringifyPrompt(pkg.tool_prompt_package.end_frame)}
                      </pre>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ExportHubPage() {
  return <ExportHubContent />;
}
