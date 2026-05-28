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
  const cleaned = BANNED_PROMPT_FRAGMENTS.reduce(
    (text, fragment) => text.replaceAll(fragment, ''),
    value ?? ''
  )
    .replace(/\s*\|\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || 'A production-ready cinematic frame based on the validated FILE15 runtime.';
}

export function inferPhysicalSubject(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes('mina')) return 'Mina and the visible production objects in frame';
  if (lower.includes('lanh')) return 'Lanh and the visible production objects in frame';
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
