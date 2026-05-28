import { cleanPromptText } from './prompt-utils';

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

export function injectGlobalNegativeProfile(baseNegativePrompt?: string | null): string {
  const baseText = cleanPromptText(baseNegativePrompt);
  const profileTerms = [...GLOBAL_NEGATIVE_PROFILE_REALISM, baseText]
    .map((term) => term.trim())
    .filter(Boolean);

  return Array.from(new Set(profileTerms)).join(', ');
}
