"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStoryStore } from "@/store/storyStore";
import { OpeningPatternsDict } from "@/data/opening-patterns";

interface ParsedShotRecord {
  shot_order: number;
  shot_id: string;
  env_id: string;
  raw_text: string;
}

interface ParsedScene {
  id: string;
  scene_id: string;
  title: string;
  text: string;
  shotIds: string[];
  shots: ParsedShotRecord[];
}

const DEFAULT_SCREENPLAY = `SHOT 01 — ENV_KHE_EXT / 11:03 PM
[1] ACTION: Khe toi, 11h dem. Mua cham tren be tong uot.
[2] CHARACTER: Mina dung sat mep tuong, lang nghe tieng buoc chan.
[14] POST-PROD NOTES

SHOT 02 — ENV_MINA_SHOP / 11:03 PM
[1] ACTION: Mina dat noi com dien cu len ban lam viec.
[2] PROP: Tua vit vang nam trong tay trai.
[14] POST-PROD NOTES

SHOT 03 — ENV_MINA_SHOP / 11:04 PM
[1] ACTION: Mina thao nap day noi com dien va khung lai khi thay bang mach do.
[2] EMOTION: Tap trung, nghi ngo.
[14] POST-PROD NOTES`;

function parseScreenplay(text: string): ParsedShotRecord[] {
  const rawShots = text
    .split(/(?=SHOT\s+\d+\s+\u2014\s+ENV_[A-Z0-9_]+)/g)
    .map((shotText) => shotText.trim())
    .filter(Boolean);

  return rawShots.reduce<ParsedShotRecord[]>((records, rawText) => {
    const metadataMatch = rawText.match(/SHOT\s+(\d+)\s+\u2014\s+(ENV_[A-Z0-9_]+)/i);

    if (!metadataMatch) {
      return records;
    }

    const shotOrder = Number(metadataMatch[1]);
    const shotId = `SHOT ${metadataMatch[1].padStart(2, "0")}`;
    const envId = metadataMatch[2].toUpperCase();

    records.push({
      shot_order: shotOrder,
      shot_id: shotId,
      env_id: envId,
      raw_text: rawText,
    });

    return records;
  }, []);
}

function groupShotsByEnv(shots: ParsedShotRecord[]): ParsedScene[] {
  const groupedScenes = shots.reduce<Record<string, ParsedShotRecord[]>>((acc, shot) => {
    acc[shot.env_id] = acc[shot.env_id] ?? [];
    acc[shot.env_id].push(shot);
    return acc;
  }, {});

  return Object.entries(groupedScenes).map(([envId, sceneShots]) => {
    const sortedShots = [...sceneShots].sort((a, b) => a.shot_order - b.shot_order);

    return {
      id: envId,
      scene_id: envId,
      title: envId,
      text: sortedShots.map((shot) => shot.raw_text).join("\n\n"),
      shotIds: sortedShots.map((shot) => shot.shot_id),
      shots: sortedShots,
    };
  });
}

export default function ScreenplayPage() {
  const router = useRouter();
  const { applyCinematicPattern, clearShotRuntime } = useStoryStore();
  const patternIds = Object.keys(OpeningPatternsDict);
  const defaultPatternId = patternIds[0] || "";

  const [screenplayText, setScreenplayText] = useState(DEFAULT_SCREENPLAY);
  const [parsedShots, setParsedShots] = useState<ParsedShotRecord[]>(() => parseScreenplay(DEFAULT_SCREENPLAY));
  const [selectedPatterns, setSelectedPatterns] = useState<Record<string, string>>({});
  const [sceneStatuses, setSceneStatuses] = useState<Record<string, string>>({});
  const [isBatchHydrating, setIsBatchHydrating] = useState(false);

  const scenes = groupShotsByEnv(parsedShots);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setParsedShots(parseScreenplay(screenplayText));
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [screenplayText]);

  const getPatternForScene = (sceneId: string) => selectedPatterns[sceneId] || defaultPatternId;

  const handleGenerateScene = async (scene: ParsedScene) => {
    const patternId = getPatternForScene(scene.id);
    if (!patternId) return;

    setSceneStatuses((current) => ({ ...current, [scene.id]: "Dang phan tich..." }));

    try {
      await applyCinematicPattern(scene.scene_id, patternId, scene.text);
      setSceneStatuses((current) => ({ ...current, [scene.id]: "Da sinh Shot Intent" }));
    } catch (error) {
      console.error(`Scene ${scene.scene_id} failed:`, error);
      setSceneStatuses((current) => ({ ...current, [scene.id]: "Loi hydrate, da bo qua scene nay" }));
    }
  };

  const handleBatchGenerate = async () => {
    if (isBatchHydrating) return;
    setIsBatchHydrating(true);
    clearShotRuntime();
    setSceneStatuses({});

    try {
      for (const scene of scenes) {
        try {
          await handleGenerateScene(scene);
        } catch (error) {
          console.error(`Batch continued after ${scene.scene_id} failed:`, error);
          continue;
        }
      }

      alert("Da xu ly batch. Cac scene loi da duoc cach ly, cac scene con lai van tiep tuc chay.");
      router.push("/shot-intent");
    } finally {
      setIsBatchHydrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-8 font-mono text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 border-b border-zinc-800 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-yellow-500">T4 - Kich ban</h1>
            <p className="text-zinc-400">
              Auto-parse theo tung SHOT record, ENV chi dung de group hien thi sau do.
            </p>
          </div>
          <button
            onClick={handleBatchGenerate}
            disabled={isBatchHydrating || parsedShots.length === 0}
            className="rounded bg-yellow-600 px-5 py-3 font-bold text-black transition hover:bg-yellow-500 disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {isBatchHydrating ? "DANG CHAY BATCH..." : "SINH TAT CA SCENE"}
          </button>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <label className="mb-2 block text-xs font-bold text-zinc-500">TOAN BO KICH BAN</label>
          <textarea
            rows={14}
            value={screenplayText}
            onChange={(event) => setScreenplayText(event.target.value)}
            className="w-full rounded border border-zinc-700 bg-black p-4 text-sm leading-6 text-zinc-200 outline-none transition focus:border-yellow-500"
            placeholder="Dan full screenplay tai day. Moi shot bat dau bang SHOT 01 — ENV_TEN_CANH / TIME va ket thuc o [14] POST-PROD NOTES."
          />
          <div className="mt-2 text-xs text-zinc-500">
            Auto-parse sau 500ms. Da tach duoc {parsedShots.length} shot records, group thanh {scenes.length} ENV.
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {parsedShots.length === 0 && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 text-sm text-zinc-500">
              Chua tim thay block hop le. Format can co: SHOT 01 — ENV_NAME / TIME ... [14] POST-PROD NOTES.
            </div>
          )}

          {scenes.map((scene) => {
            const patternId = getPatternForScene(scene.id);

            return (
              <article key={scene.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 shadow-xl">
                <div className="mb-4 flex flex-col gap-3 border-b border-zinc-800 pb-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-zinc-200">
                      {scene.scene_id} - {scene.shots.length} shots
                    </h2>
                    <p className="mt-1 text-xs text-zinc-500">
                      {scene.shotIds.join(", ")} | {sceneStatuses[scene.id] || "Chua sinh shot"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <select
                      className="rounded border border-zinc-700 bg-black p-3 text-sm text-white outline-none focus:border-yellow-500"
                      value={patternId}
                      onChange={(event) =>
                        setSelectedPatterns((current) => ({ ...current, [scene.id]: event.target.value }))
                      }
                      disabled={isBatchHydrating}
                    >
                      {patternIds.map((id) => (
                        <option key={id} value={id}>
                          {id}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleGenerateScene(scene)}
                      disabled={isBatchHydrating || !patternId}
                      className="rounded bg-yellow-600 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-500 disabled:bg-zinc-700 disabled:text-zinc-400"
                    >
                      SINH SHOT INTENT
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {scene.shots.map((shot) => (
                    <section
                      key={shot.shot_id}
                      className="rounded border border-zinc-800 bg-black p-4 text-sm leading-6 text-zinc-300"
                    >
                      <div className="mb-2 flex items-center gap-3 text-xs font-bold text-yellow-500">
                        <span>{shot.shot_id}</span>
                        <span className="text-zinc-500">ORDER {shot.shot_order}</span>
                      </div>
                      <pre className="whitespace-pre-wrap font-mono">{shot.raw_text}</pre>
                    </section>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
