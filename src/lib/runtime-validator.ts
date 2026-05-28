import type { ShotRuntime } from '@/types/shot-runtime';

const FALLBACK_MARKERS = [
  'neon noir',
  'empty environment',
  'establishing shot',
  'placeholder',
  'skeleton',
];

function hasFallbackMarker(value: string | null | undefined): boolean {
  const normalized = value?.toLowerCase() ?? '';
  return FALLBACK_MARKERS.some((marker) => normalized.includes(marker));
}

export function isRuntimeExportReady(shot: ShotRuntime): boolean {
  const startFramePrompt = shot.E_Motion.start_frame_prompt?.trim();
  const motionIntent = shot.E_Motion.motion_intent?.trim();
  const endFramePrompt = shot.E_Motion.end_frame_prompt?.trim();
  const validationText = [
    startFramePrompt,
    motionIntent,
    endFramePrompt,
    shot.D_Frames.start_frame.description,
    shot.D_Frames.end_frame.description,
    shot.E_Motion.main_action,
  ].join(' ');

  return Boolean(
    startFramePrompt &&
      motionIntent &&
      endFramePrompt &&
      !hasFallbackMarker(validationText)
  );
}
