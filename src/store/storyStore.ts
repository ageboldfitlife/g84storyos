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
import { mockProjectState } from '@/mock/storyData';

interface StoryStore extends StoryProjectState {
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

  // Utility
  resetToMock: () => void;
  getCompletionScore: () => number;
}

export const useStoryStore = create<StoryStore>()(
  persist(
    (set, get) => ({
      ...mockProjectState,

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

      resetToMock: () => set(mockProjectState),

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
      partialize: (state) => ({
        project_meta: state.project_meta,
        idea_core: state.idea_core,
        idea_bible: state.idea_bible,
        beat_map: state.beat_map,
        screenplay_scenes: state.screenplay_scenes,
        shot_intents: state.shot_intents,
        export_packages: state.export_packages,
      }),
    }
  )
);