import type { RenderPackage } from '@/types/render-package';

const BANNED_PROMPT_FRAGMENTS = [
  'Subject:',
  'Action:',
  'Pose:',
  'Hand action:',
  'Gaze:',
  'Prop state:',
  'screenplay-specific look',
];

export function cleanPromptText(value: string | null | undefined): string {
  const timeStripped = (value ?? '').replace(/\b\d{1,2}:\d{2}\s*(AM|PM)\b/gi, '');
  const cleaned = BANNED_PROMPT_FRAGMENTS.reduce(
    (text, fragment) => text.replaceAll(fragment, ''),
    timeStripped
  )
    .replace(/\s*\|\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || 'A production-ready cinematic frame based on the validated FILE15 runtime.';
}

export function inferPhysicalSubject(prompt: string, runtime?: { subject?: string; foreground_actor?: string; shot_focus?: string; char_refs?: string[] }): string {
  const lower = prompt.toLowerCase();
  const explicitSubject = runtime?.subject || runtime?.foreground_actor || runtime?.shot_focus || runtime?.char_refs?.[0];

  if (explicitSubject) {
    return `${explicitSubject} and the visible production objects in frame`;
  }

  if (lower.includes('mina')) return 'Mina and the visible production objects in frame';
  if (lower.includes('lanh')) return 'Lanh and the visible production objects in frame';
  if (lower.includes('ly')) return 'Ly and the visible production objects in frame';
  if (lower.includes('chu bay')) return 'Chu Bay and the visible production objects in frame';
  if (lower.includes('alley')) return 'The alley and its visible geometry';
  if (lower.includes('workbench')) return 'The workbench and visible props';
  if (lower.includes('rice cooker')) return 'The rice cooker and surrounding work surface';
  if (lower.includes('circuit')) return 'The exposed circuit board and nearby objects';

  return 'The visible physical subject of the frame';
}

export function getStartFrame(runtime: RenderPackage): string {
  return runtime.start_frame_prompt || runtime.positive_prompt;
}

export function getEndFrame(runtime: RenderPackage): string {
  return runtime.end_frame_prompt || runtime.positive_prompt;
}
