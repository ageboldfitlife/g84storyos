import { CharacterBible } from '@/data/character-bible';
import type { ShotRuntime } from '@/types/shot-runtime';

const CHARACTER_ALIASES: Array<{ id: string; aliases: string[] }> = [
  { id: 'MINA-01', aliases: ['mina', 'MINA-01'] },
  { id: 'LANH-01', aliases: ['lanh', 'LANH-01'] },
  { id: 'LY-01', aliases: ['ly', 'LY-01'] },
  { id: 'CHUBAY-01', aliases: ['chu bay', 'chubay', 'CHUBAY-01'] },
];

const MOTION_VERBS = [
  'walks',
  'walking',
  'moves',
  'moving',
  'enters',
  'entering',
  'runs',
  'running',
  'turns',
  'turning',
  'lifts',
  'lifting',
  'opens',
  'opening',
  'places',
  'placing',
  'grips',
  'loosening',
  'standing',
  'watching',
  'holding',
  'stays',
  'remains',
  'freezes',
  'looks up',
  'breath pause',
  'shifts',
];

function collectShotText(shot: ShotRuntime): string {
  return [
    shot.A_Identity.title,
    shot.B_Narrative.narrative_intent,
    shot.D_Frames.start_frame.description,
    shot.D_Frames.end_frame.description,
    shot.E_Motion.start_frame_prompt,
    shot.E_Motion.motion_intent,
    shot.E_Motion.end_frame_prompt,
    shot.I_Character.behavior_lock,
  ]
    .filter(Boolean)
    .join(' ');
}

function resolveCharRefs(shot: ShotRuntime): string[] {
  const existingRefs = [
    ...(shot.I_Character.char_refs ?? []),
    ...shot.I_Character.character_ids,
  ].filter(Boolean);

  const text = collectShotText(shot).toLowerCase();
  const detectedRefs = CHARACTER_ALIASES.filter(({ aliases }) =>
    aliases.some((alias) => {
      const escapedAlias = alias.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escapedAlias}\\b`).test(text);
    })
  ).map(({ id }) => id);

  return Array.from(new Set([...existingRefs, ...detectedRefs]));
}

function stripMotionLanguage(prompt: string): string {
  return MOTION_VERBS.reduce((text, verb) => {
    const pattern = new RegExp(`\\b${verb.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    return text.replace(pattern, '');
  }, prompt)
    .replace(/\s+/g, ' ')
    .replace(/\s+,/g, ',')
    .trim();
}

function applyGenderPronounLock(prompt: string, charRefs: string[]): string {
  const hasMaleCharacter = charRefs.some((charRef) => CharacterBible[charRef]?.gender === 'MALE');
  const hasFemaleCharacter = charRefs.some((charRef) => CharacterBible[charRef]?.gender === 'FEMALE');

  if (hasFemaleCharacter && !hasMaleCharacter) {
    return prompt
      .replace(/\bhis\b/gi, 'her')
      .replace(/\bhim\b/gi, 'her')
      .replace(/\bhe\b/gi, 'she')
      .replace(/\bman\b/gi, 'woman')
      .replace(/\bhimself\b/gi, 'herself');
  }

  if (hasMaleCharacter && !hasFemaleCharacter) {
    return prompt
      .replace(/\bshe\b/gi, 'he')
      .replace(/\bher\b/gi, 'him')
      .replace(/\bherself\b/gi, 'himself')
      .replace(/\bwoman\b/gi, 'man');
  }

  return prompt;
}

function buildCharacterVisualLock(charRefs: string[]): string {
  return charRefs
    .map((charRef) => CharacterBible[charRef])
    .filter(Boolean)
    .map((entry) =>
      [
        `${entry.display_name}: ${entry.gender}, ${entry.visual_lock}`,
        entry.wardrobe_lock,
        entry.accessory_lock,
        entry.behavior_lock,
        entry.realism_lock,
      ]
        .filter(Boolean)
        .join(', ')
    )
    .join(' | ');
}

function buildMicroDetails(charRefs: string[]): string[] {
  return charRefs
    .map((charRef) => CharacterBible[charRef])
    .filter(Boolean)
    .flatMap((entry) =>
      [
        `${entry.display_name} gender lock: ${entry.gender}`,
        entry.visual_lock,
        entry.wardrobe_lock,
        entry.accessory_lock,
        entry.behavior_lock,
      ].filter(Boolean)
    );
}

function makeStableHash(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return `ENV_${hash.toString(16).toUpperCase()}`;
}

function injectFramePrompt(
  framePrompt: string | undefined,
  visualLock: string,
  charRefs: string[]
): string | undefined {
  const basePrompt = applyGenderPronounLock(stripMotionLanguage(framePrompt ?? ''), charRefs);
  if (!basePrompt && !visualLock) return undefined;
  if (!visualLock) return basePrompt;

  return `${basePrompt}. Character visual lock: ${visualLock}. Static image frame only; no motion description.`
    .replace(/\s+/g, ' ')
    .trim();
}

export function injectPreProductionRuntime(shot: ShotRuntime): ShotRuntime {
  const charRefs = resolveCharRefs(shot);
  const missingCharacterRefs = charRefs.filter((charRef) => !CharacterBible[charRef]);
  const visualLockRefs = charRefs
    .map((charRef) => CharacterBible[charRef]?.visual_lock)
    .filter(Boolean);
  const wardrobeLock = charRefs
    .map((charRef) => CharacterBible[charRef]?.wardrobe_lock)
    .filter(Boolean)
    .join(' | ');
  const continuityLock = charRefs
    .map((charRef) => CharacterBible[charRef])
    .filter(Boolean)
    .map((entry) => `${entry.character_id}: ${entry.gender}, ${entry.wardrobe_lock}, ${entry.accessory_lock}`)
    .join(' | ');
  const characterVisualLock = buildCharacterVisualLock(charRefs);
  const microDetails = buildMicroDetails(charRefs);
  const emotionalPosture = shot.B_Narrative.emotion_end || shot.B_Narrative.emotion_start || shot.E_Motion.micro_action;
  const behaviorMemory = charRefs
    .map((charRef) => CharacterBible[charRef])
    .filter(Boolean)
    .map((entry) => `${entry.character_id}: ${entry.behavior_lock}`)
    .join(' | ');
  const spatialSeed = shot.H_Spatial.env_id || shot.A_Identity.scene_id;
  const environmentHash = makeStableHash(
    [shot.H_Spatial.env_id, shot.H_Spatial.location, shot.H_Spatial.planes_bg, shot.K_Style.dna_lock]
      .filter(Boolean)
      .join('|')
  );
  const physicsFrozenState = [
    shot.H_Spatial.location,
    shot.G_Camera.camera_framing,
    shot.G_Camera.angle,
    shot.K_Style.override_lighting,
  ]
    .filter(Boolean)
    .join(', ');
  const startFramePrompt = injectFramePrompt(shot.E_Motion.start_frame_prompt, characterVisualLock, charRefs);
  const endFramePrompt = injectFramePrompt(shot.E_Motion.end_frame_prompt, characterVisualLock, charRefs);
  const motionIntent = applyGenderPronounLock(shot.E_Motion.motion_intent ?? '', charRefs);

  return {
    ...shot,
    D_Frames: {
      ...shot.D_Frames,
      start_frame: {
        ...shot.D_Frames.start_frame,
        description: startFramePrompt ?? shot.D_Frames.start_frame.description,
      },
      end_frame: {
        ...shot.D_Frames.end_frame,
        description: endFramePrompt ?? shot.D_Frames.end_frame.description,
      },
    },
    E_Motion: {
      ...shot.E_Motion,
      start_frame_prompt: startFramePrompt ?? shot.E_Motion.start_frame_prompt,
      end_frame_prompt: endFramePrompt ?? shot.E_Motion.end_frame_prompt,
      motion_intent: motionIntent || shot.E_Motion.motion_intent,
    },
    G_Camera: {
      ...shot.G_Camera,
      contrast_level: shot.G_Camera.contrast_level ?? 'cinematic natural contrast',
      cut_hook: shot.G_Camera.cut_hook ?? shot.N_EditorNotes.cut_map_note,
    },
    H_Spatial: {
      ...shot.H_Spatial,
      spatial_seed: spatialSeed,
      environment_hash: environmentHash,
      physics_frozen_state: physicsFrozenState,
      imperfections: shot.H_Spatial.imperfections ?? ['natural material wear', 'practical real-world texture'],
    },
    I_Character: {
      ...shot.I_Character,
      character_ids: charRefs,
      char_refs: charRefs,
      visual_lock_refs: visualLockRefs,
      wardrobe_lock: wardrobeLock,
      continuity_lock: continuityLock,
      missing_character_refs: missingCharacterRefs,
      micro_details: microDetails,
      emotional_posture: emotionalPosture,
      behavior_memory: behaviorMemory,
      outfit_lock_ref: wardrobeLock || shot.I_Character.outfit_lock_ref,
      behavior_lock: characterVisualLock || shot.I_Character.behavior_lock,
    },
  };
}
