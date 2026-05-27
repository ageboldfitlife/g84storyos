import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  StoryProjectState,
  IdeaCore,
  IdeaBible,
  Character,
  WorldElement,
  ThematicPillar,
  GenreTag,
  ToneTag,
  ProjectStatus,
} from '@/types';
import type { ShotRuntime } from '@/types/shot-runtime';
import type { RenderPackage } from '@/types/render-package';
import { generatePrompt } from '@/lib/prompt-engine';
import { exportRenderPackage } from '@/lib/mapper';
import { validateRenderPackage, type ValidationResult } from '@/lib/validator';
import { processQAResult, type QAReport } from '@/lib/qa-checker';
import { generateShotsFromPattern } from '@/lib/shot-generator';
import { hydrateShotsWithScreenplay } from '@/lib/shot-hydrator';
import { mockProjectState } from '@/mock/storyData';

type RenderTargetTool = RenderPackage['target_tool'];

type PersistedStoryState = Pick<
  StoryProjectState,
  | 'project_meta'
  | 'idea_core'
  | 'idea_bible'
  | 'beat_map'
  | 'screenplay_scenes'
  | 'shot_intents'
  | 'export_packages'
> & {
  shot_runtimes: Record<string, ShotRuntime>;
  active_shot_id: string | null;
};

interface StoryStore extends StoryProjectState {
  // Shot Runtime state
  shot_runtimes: Record<string, ShotRuntime>;
  active_shot_id: string | null;

  // Idea Core actions
  updateIdeaCore: (updates: Partial<IdeaCore>) => void;
  setProjectTitle: (title: string) => void;
  setLogline: (logline: string) => void;
  setPremise: (premise: string) => void;
  toggleGenre: (genre: GenreTag) => void;
  toggleTone: (tone: ToneTag) => void;
  addThematicKeyword: (keyword: string) => void;
  removeThematicKeyword: (keyword: string) => void;
  setProjectStatus: (status: ProjectStatus) => void;

  // Idea Bible actions
  updateIdeaBible: (updates: Partial<IdeaBible>) => void;
  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  removeCharacter: (id: string) => void;
  addWorldElement: (element: WorldElement) => void;
  removeWorldElement: (id: string) => void;
  updateThematicPillar: (id: string, updates: Partial<ThematicPillar>) => void;

  // Beat Map actions
  setBeatMap: (beats: any[]) => void;

  // Shot Runtime CRUD actions
  addShotRuntime: (shot: ShotRuntime) => void;
  updateShotRuntime: (shotId: string, updates: Partial<ShotRuntime>) => void;
  setActiveShot: (shotId: string | null) => void;
  removeShotRuntime: (shotId: string) => void;

  // Shot Runtime command actions
  generateShotPrompt: (shotId: string) => void;
  exportShotRenderPackage: (shotId: string, targetTool: RenderTargetTool) => RenderPackage;
  validateShotRenderPackage: (pkg: RenderPackage) => ValidationResult;
  applyShotQAReport: (shotId: string, report: QAReport) => void;
  applyCinematicPattern: (sceneId: string, patternId: string, screenplayText?: string) => void;
  markShotAsExported: (shotId: string) => void;

  // Utility
  resetToMock: () => void;
  getCompletionScore: () => number;
}

export const useStoryStore = create<StoryStore>()(
  persist(
    (set, get) => ({
      ...mockProjectState,
      shot_runtimes: {},
      active_shot_id: null,

      updateIdeaCore: (updates) =>
        set((state) => ({
          idea_core: { ...state.idea_core, ...updates, lastModified: new Date().toISOString() },
          project_meta: { ...state.project_meta, lastModified: new Date().toISOString() },
        })),

      setProjectTitle: (title) =>
        set((state) => ({
          idea_core: { ...state.idea_core, projectTitle: title },
          project_meta: { ...state.project_meta, title, lastModified: new Date().toISOString() },
        })),

      setLogline: (logline) =>
        set((state) => ({
          idea_core: { ...state.idea_core, logline },
        })),

      setPremise: (premise) =>
        set((state) => ({
          idea_core: { ...state.idea_core, premise },
        })),

      toggleGenre: (genre) =>
        set((state) => {
          const genres = state.idea_core.genres.includes(genre)
            ? state.idea_core.genres.filter((g) => g !== genre)
            : [...state.idea_core.genres, genre];
          return { idea_core: { ...state.idea_core, genres } };
        }),

      toggleTone: (tone) =>
        set((state) => {
          const tones = state.idea_core.tones.includes(tone)
            ? state.idea_core.tones.filter((t) => t !== tone)
            : [...state.idea_core.tones, tone];
          return { idea_core: { ...state.idea_core, tones } };
        }),

      addThematicKeyword: (keyword) =>
        set((state) => ({
          idea_core: {
            ...state.idea_core,
            thematicKeywords: [...state.idea_core.thematicKeywords, keyword],
          },
        })),

      removeThematicKeyword: (keyword) =>
        set((state) => ({
          idea_core: {
            ...state.idea_core,
            thematicKeywords: state.idea_core.thematicKeywords.filter((k) => k !== keyword),
          },
        })),

      setProjectStatus: (status) =>
        set((state) => ({
          idea_core: { ...state.idea_core, status },
          project_meta: { ...state.project_meta, status },
        })),

      updateIdeaBible: (updates) =>
        set((state) => ({
          idea_bible: { ...state.idea_bible, ...updates },
        })),

      addCharacter: (character) =>
        set((state) => ({
          idea_bible: {
            ...state.idea_bible,
            characters: [...state.idea_bible.characters, character],
          },
        })),

      updateCharacter: (id, updates) =>
        set((state) => ({
          idea_bible: {
            ...state.idea_bible,
            characters: state.idea_bible.characters.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
          },
        })),

      removeCharacter: (id) =>
        set((state) => ({
          idea_bible: {
            ...state.idea_bible,
            characters: state.idea_bible.characters.filter((c) => c.id !== id),
          },
        })),

      addWorldElement: (element) =>
        set((state) => ({
          idea_bible: {
            ...state.idea_bible,
            worldElements: [...state.idea_bible.worldElements, element],
          },
        })),

      removeWorldElement: (id) =>
        set((state) => ({
          idea_bible: {
            ...state.idea_bible,
            worldElements: state.idea_bible.worldElements.filter((e) => e.id !== id),
          },
        })),

      updateThematicPillar: (id, updates) =>
        set((state) => ({
          idea_bible: {
            ...state.idea_bible,
            thematicPillars: state.idea_bible.thematicPillars.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            ),
          },
        })),

      setBeatMap: (beats) =>
        set(() => ({
          beat_map: beats,
        })),

      addShotRuntime: (shot) =>
        set((state) => ({
          shot_runtimes: {
            ...state.shot_runtimes,
            [shot.A_Identity.shot_id]: shot,
          },
          active_shot_id: shot.A_Identity.shot_id,
        })),

      updateShotRuntime: (shotId, updates) =>
        set((state) => {
          const currentShot = state.shot_runtimes[shotId];
          if (!currentShot) {
            throw new Error(`ShotRuntime not found: ${shotId}`);
          }

          return {
            shot_runtimes: {
              ...state.shot_runtimes,
              [shotId]: {
                ...currentShot,
                ...updates,
              },
            },
          };
        }),

      setActiveShot: (shotId) =>
        set(() => ({
          active_shot_id: shotId,
        })),

      removeShotRuntime: (shotId) =>
        set((state) => {
          const { [shotId]: _removed, ...remainingShots } = state.shot_runtimes;

          return {
            shot_runtimes: remainingShots,
            active_shot_id: state.active_shot_id === shotId ? null : state.active_shot_id,
          };
        }),

      generateShotPrompt: (shotId) =>
        set((state) => {
          const shot = state.shot_runtimes[shotId];
          if (!shot) {
            throw new Error(`ShotRuntime not found: ${shotId}`);
          }

          return {
            shot_runtimes: {
              ...state.shot_runtimes,
              [shotId]: {
                ...shot,
                P_Computed: generatePrompt(shot),
              },
            },
          };
        }),

      exportShotRenderPackage: (shotId, targetTool) => {
        const shot = get().shot_runtimes[shotId];
        if (!shot) {
          throw new Error(`ShotRuntime not found: ${shotId}`);
        }

        return exportRenderPackage(shot, targetTool);
      },

      validateShotRenderPackage: (pkg) => validateRenderPackage(pkg),

      applyShotQAReport: (shotId, report) =>
        set((state) => {
          const shot = state.shot_runtimes[shotId];
          if (!shot) {
            throw new Error(`ShotRuntime not found: ${shotId}`);
          }

          return {
            shot_runtimes: {
              ...state.shot_runtimes,
              [shotId]: {
                ...shot,
                R_QAState: processQAResult(shot, report),
              },
            },
          };
        }),

      applyCinematicPattern: (sceneId, patternId, screenplayText = '') => {
        const state = get();
        const activeShot = state.active_shot_id ? state.shot_runtimes[state.active_shot_id] : null;
        const episodeId = activeShot?.A_Identity.episode_id ?? 'E01';
        const skeletonShots = generateShotsFromPattern(
          state.project_meta.id,
          episodeId,
          sceneId,
          patternId
        );
        const hydratedShots = hydrateShotsWithScreenplay(skeletonShots, screenplayText);

        hydratedShots.forEach((shot) => {
          get().addShotRuntime(shot);
        });
      },

      markShotAsExported: (shotId) =>
        set((state) => {
          const shot = state.shot_runtimes[shotId];
          if (!shot) throw new Error(`ShotRuntime not found: ${shotId}`);

          return {
            shot_runtimes: {
              ...state.shot_runtimes,
              [shotId]: {
                ...shot,
                Q_RenderState: {
                  ...shot.Q_RenderState,
                  export_status: "EXPORTED_FOR_RENDER",
                },
              },
            },
          };
        }),

      resetToMock: () =>
        set({
          ...mockProjectState,
          shot_runtimes: {},
          active_shot_id: null,
        }),

      getCompletionScore: () => {
        const state = get();
        let score = 0;
        const core = state.idea_core;
        if (core.projectTitle) score += 10;
        if (core.logline && core.logline.length > 20) score += 20;
        if (core.premise && core.premise.length > 50) score += 15;
        if (core.genres.length > 0) score += 5;
        if (core.tones.length > 0) score += 5;
        if (core.thematicKeywords.length >= 3) score += 5;
        if (state.idea_bible.characters.length >= 3) score += 15;
        if (state.idea_bible.worldElements.length >= 2) score += 10;
        if (state.idea_bible.thematicPillars.length >= 1) score += 10;
        if (state.beat_map.filter((b) => b.status !== 'empty').length >= 4) score += 5;
        return Math.min(score, 100);
      },
    }),
    {
      name: 'g84-story-os-state',
      version: 2,
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<PersistedStoryState>;
        const migratedState: PersistedStoryState = {
          project_meta: state.project_meta ?? mockProjectState.project_meta,
          idea_core: state.idea_core ?? mockProjectState.idea_core,
          idea_bible: state.idea_bible ?? mockProjectState.idea_bible,
          beat_map: state.beat_map ?? mockProjectState.beat_map,
          screenplay_scenes: state.screenplay_scenes ?? mockProjectState.screenplay_scenes,
          shot_intents: state.shot_intents ?? mockProjectState.shot_intents,
          export_packages: state.export_packages ?? mockProjectState.export_packages,
          shot_runtimes: state.shot_runtimes ?? {},
          active_shot_id: state.active_shot_id ?? null,
        };

        if (version < 2) {
          return migratedState;
        }

        return migratedState;
      },
      partialize: (state) => ({
        project_meta: state.project_meta,
        idea_core: state.idea_core,
        idea_bible: state.idea_bible,
        beat_map: state.beat_map,
        screenplay_scenes: state.screenplay_scenes,
        shot_intents: state.shot_intents,
        export_packages: state.export_packages,
        shot_runtimes: state.shot_runtimes,
        active_shot_id: state.active_shot_id,
      }),
    }
  )
);
