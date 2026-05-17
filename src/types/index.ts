export type ProjectStatus = 'seed' | 'developing' | 'structured' | 'draft' | 'locked';

export type GenreTag =
  | 'Drama' | 'Thriller' | 'Sci-Fi' | 'Horror' | 'Comedy' |'Action'| 'Romance' | 'Crime' | 'Mystery' | 'Fantasy' |'Western' | 'Documentary' | 'Animation' | 'Noir' | 'Arthouse';

export type ToneTag =
  | 'Bleak' | 'Hopeful' | 'Sardonic' | 'Lyrical' | 'Visceral'
  | 'Contemplative'| 'Frenetic' | 'Intimate' | 'Epic' | 'Absurdist' |'Tense' | 'Melancholic' | 'Euphoric' | 'Gritty' | 'Dreamlike';

export type CharacterArchetype =
  | 'The Hero' | 'The Shadow' | 'The Mentor' | 'The Trickster'
  | 'The Herald' | 'The Shapeshifter' | 'The Guardian' | 'The Ally';

export type CharacterArcStatus = 'undefined' | 'sketched' | 'developed' | 'locked';

export interface Character {
  id: string;
  name: string;
  archetype: CharacterArchetype;
  logline: string;
  want: string;
  need: string;
  fear: string;
  arc: string;
  arcStatus: CharacterArcStatus;
  notes: string;
  colorAccent: string;
}

export interface WorldElement {
  id: string;
  category: 'Setting' | 'Era' | 'Social Structure' | 'Rule of World' | 'Mythology' | 'Technology' | 'Geography';
  title: string;
  description: string;
  importance: 'critical' | 'major' | 'minor';
}

export interface ThematicPillar {
  id: string;
  statement: string;
  question: string;
  alignmentScore: number;
  linkedCharacters: string[];
  notes: string;
}

export interface VisualReference {
  id: string;
  title: string;
  type: 'Film' | 'Photograph' | 'Painting' | 'Music' | 'Book' | 'Director';
  description: string;
  colorPalette: string[];
  tags: string[];
}

export interface InfluenceReference {
  id: string;
  title: string;
  director?: string;
  year?: number;
  type: 'Film' | 'Book' | 'Photograph' | 'Music' | 'Director';
  note: string;
  tags: string[];
}

export interface IdeaCore {
  projectTitle: string;
  logline: string;
  premise: string;
  genres: GenreTag[];
  tones: ToneTag[];
  thematicKeywords: string[];
  influences: InfluenceReference[];
  conceptStrength: {
    originality: number;
    clarity: number;
    emotionalHook: number;
    commercialViability: number;
    thematicDepth: number;
  };
  status: ProjectStatus;
  lastModified: string;
  wordCountTarget: number;
}

export interface IdeaBible {
  characters: Character[];
  worldElements: WorldElement[];
  thematicPillars: ThematicPillar[];
  visualReferences: VisualReference[];
  moodColors: string[];
  cinematicStatement: string;
}

export interface BeatPoint {
  id: string;
  act: 1 | 2 | 3;
  label: string;
  description: string;
  pageTarget: number;
  status: 'empty' | 'sketched' | 'locked';
}

export type EnergyLevel = 'Thấp' | 'Vừa' | 'Cao' | 'Bùng nổ';

export interface BeatCard {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  emotionalGoal: string;
  visualGoal: string;
  energyLevel: EnergyLevel;
}

export interface ScreenplayScene {
  id: string;
  sceneNumber: number;
  heading: string;
  action: string;
  pageCount: number;
  status: 'outline' | 'draft' | 'revised' | 'locked';
  beatId?: string;
}

export interface ShotIntent {
  id: string;
  sceneId: string;
  shotType: string;
  lensNote: string;
  emotionTarget: string;
  movementNote: string;
}

export interface ExportPackage {
  id: string;
  type: 'PDF' | 'FDX' | 'JSON' | 'Lookbook';
  label: string;
  generatedAt: string;
  status: 'pending' | 'ready';
}

export interface StoryProjectState {
  project_meta: {
    id: string;
    title: string;
    status: ProjectStatus;
    createdAt: string;
    lastModified: string;
    version: string;
  };
  idea_core: IdeaCore;
  idea_bible: IdeaBible;
  beat_map: BeatPoint[];
  screenplay_scenes: ScreenplayScene[];
  shot_intents: ShotIntent[];
  export_packages: ExportPackage[];
}

export interface NavItem {
  id: string;
  label: string;
  shortLabel: string;
  href: string;
  icon: string;
  tabNumber: number;
  status: 'active' | 'placeholder';
  badge?: number;
}