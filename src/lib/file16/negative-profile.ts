import { cleanPromptText } from './prompt-utils';

const MOTION_GRAMMAR_TERMS = [
  'fast_pan',
  'whip_pan',
  'camera movement',
  'camera motion',
  'motion blur',
  'pan',
  'tilt',
  'zoom',
  'dolly',
  'whip',
  'push_in',
  'pull_out',
  'shake',
  'tracking',
  'handheld_shaky',
];

export const GLOBAL_NEGATIVE_PROFILE_REALISM = [
  'extra fingers',
  'wrong anatomy',
  'anime eyes',
  'duplicate limbs',
  'floating props',
  'plastic skin',
  'cgi face',
  'warped perspective',
  'identity drift',
  'duplicate screwdriver',
];

function sanitizeNegativeTerm(term: string): boolean {
  const normalized = term.toLowerCase();
  return !MOTION_GRAMMAR_TERMS.some((pattern) => normalized.includes(pattern));
}

export function injectGlobalNegativeProfile(baseNegativePrompt?: string | null): string {
  const baseText = cleanPromptText(baseNegativePrompt);
  const baseTerms = baseText
    .split(',')
    .map((term) => term.trim())
    .filter(Boolean)
    .filter(sanitizeNegativeTerm);

  const profileTerms = [...GLOBAL_NEGATIVE_PROFILE_REALISM, ...baseTerms]
    .map((term) => term.trim())
    .filter(Boolean);

  return Array.from(new Set(profileTerms)).join(', ');
}
