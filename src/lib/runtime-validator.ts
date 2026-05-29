import type { ShotRuntime } from '@/types/shot-runtime';

const FALLBACK_MARKERS = [
  'neon noir',
  'empty environment',
  'establishing shot',
  'placeholder',
  'skeleton',
];

const VERB_HINTS = [
  '\\b(be|am|is|are|was|were|remain|remains|sit|sits|stand|stands|stay|stays|hold|holds|keep|keeps|lie|lies|have|has|create|creates|emphasize|emphasizes|emphasizing|share|sharing|speak|speaking|look|looks|looking|move|moves|moving|turn|turns|turning|open|opens|opening|lift|lifts|lifting|grip|grips|gripping|freeze|freezes|freezing|stare|stares|staring|lean|leans|leaning|crouch|crouches|crouching|sit|sits|sitting|take|takes|taking|place|places|placing|use|uses|using|see|sees|seeing|reach|reaches|reaching|find|finds|finding|pull|pulls|pulling|push|pushes|pushing|rest|rests|resting|wait|waits|pause|pauses|eat|eats|continue|continues|unscrew|unscrews|spill|spills|glow|glows|watch|watches|enter|enters|exit|exits|carry|carries|capture|captures|emit|emits|shine|shines|reflect|reflects|breathe|breathes|linger|lingers|frame|frames|illuminate|illuminates|close|closes)\\b',
];

function hasFallbackMarker(value: string | null | undefined): boolean {
  const normalized = value?.toLowerCase() ?? '';
  return FALLBACK_MARKERS.some((marker) => normalized.includes(marker));
}

function detectVerb(value: string | null | undefined): string | null {
  const normalized = value?.toLowerCase() ?? '';
  const match = VERB_HINTS
    .map((pattern) => new RegExp(pattern, 'i').exec(normalized))
    .find(Boolean);

  return match?.[0] ?? null;
}

function splitSentences(value: string | null | undefined): string[] {
  const normalized = value?.replace(/\s+/g, ' ').trim() ?? '';
  if (!normalized) return [];

  return normalized
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function hasVerb(value: string | null | undefined): boolean {
  return Boolean(detectVerb(value));
}

function detectSubject(value: string | null | undefined): string {
  const match = value?.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/) ?? value?.match(/\b([a-z]+(?:\s+[a-z]+)*)\b/);
  return match?.[1]?.trim() || 'NONE';
}

export interface FieldValidationResult {
  field: 'start_frame_prompt' | 'motion_intent' | 'end_frame_prompt';
  ok: boolean;
  reason: string;
  sentence: string;
  text: string;
  detectedVerb: string | null;
  detectedSubject: string;
}

export interface RuntimeValidationDiagnostics {
  ok: boolean;
  failedField: 'start_frame_prompt' | 'motion_intent' | 'end_frame_prompt' | null;
  failedSentence: string;
  failedReason: string;
  failedText: string;
  fields: Record<'start_frame_prompt' | 'motion_intent' | 'end_frame_prompt', FieldValidationResult>;
}

function getFailureReason(startFramePrompt: string | undefined, motionIntent: string | undefined, endFramePrompt: string | undefined, validationText: string): string {
  if (!startFramePrompt) return 'missing start_frame_prompt';
  if (!motionIntent) return 'missing motion_intent';
  if (!endFramePrompt) return 'missing end_frame_prompt';
  if (!hasVerb(startFramePrompt) || !hasVerb(motionIntent) || !hasVerb(endFramePrompt)) return 'missing detected verb';
  if (hasFallbackMarker(validationText)) return 'fallback marker detected';
  return 'unknown';
}

export function getRuntimeValidationDiagnostics(shot: ShotRuntime): RuntimeValidationDiagnostics {
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

  const fieldEntries = [
    {
      field: 'start_frame_prompt' as const,
      text: startFramePrompt ?? '',
      detectedVerb: detectVerb(startFramePrompt),
      detectedSubject: detectSubject(startFramePrompt),
    },
    {
      field: 'motion_intent' as const,
      text: motionIntent ?? '',
      detectedVerb: detectVerb(motionIntent),
      detectedSubject: detectSubject(motionIntent),
    },
    {
      field: 'end_frame_prompt' as const,
      text: endFramePrompt ?? '',
      detectedVerb: detectVerb(endFramePrompt),
      detectedSubject: detectSubject(endFramePrompt),
    },
  ];

  const fields = Object.fromEntries(
    fieldEntries.map((entry) => {
      const sentences = splitSentences(entry.text);
      const invalidSentence = sentences.find((sentence) => !hasVerb(sentence)) ?? '';
      const hasText = Boolean(entry.text);
      const hasDetectedVerb = Boolean(entry.detectedVerb);
      const reason = !hasText
        ? 'missing field text'
        : invalidSentence
          ? 'sentence missing complete verb'
          : hasFallbackMarker(validationText)
            ? 'fallback marker detected'
            : 'ok';

      return [entry.field, {
        field: entry.field,
        ok: hasText && hasDetectedVerb && !invalidSentence && !hasFallbackMarker(validationText),
        reason,
        sentence: invalidSentence,
        text: entry.text,
        detectedVerb: entry.detectedVerb,
        detectedSubject: entry.detectedSubject,
      }];
    })
  ) as RuntimeValidationDiagnostics['fields'];

  const firstFailedField = (Object.entries(fields) as Array<[keyof typeof fields, FieldValidationResult]>).find(([, item]) => !item.ok);
  const failedField = firstFailedField?.[0] ?? null;
  const failedSentence = firstFailedField?.[1]?.sentence ?? '';
  const failedReason = firstFailedField?.[1]?.reason ?? 'ok';
  const failedText = firstFailedField?.[1]?.text ?? '';

  return {
    ok: !failedField,
    failedField,
    failedSentence,
    failedReason,
    failedText,
    fields,
  };
}

export function isRuntimeExportReady(shot: ShotRuntime): boolean {
  const diagnostics = getRuntimeValidationDiagnostics(shot);

  if (!diagnostics.ok) {
    console.warn('[VALIDATOR_DEBUG]', {
      SHOT_ID: shot.A_Identity.shot_id || 'UNKNOWN_SHOT',
      FAILED_FIELD: diagnostics.failedField,
      FAILED_SENTENCE: diagnostics.failedSentence || 'NONE',
      FAILED_REASON: diagnostics.failedReason,
      FAILED_RULE: diagnostics.failedField ? 'field validation failed' : 'fallback marker failed',
      SUBJECT_DETECTED: Object.values(diagnostics.fields)
        .map((field) => field.detectedSubject)
        .filter((value, index, values) => value !== 'NONE' && values.indexOf(value) === index)
        .join(' | ') || 'NONE',
      VERB_DETECTED: Object.values(diagnostics.fields)
        .map((field) => field.detectedVerb)
        .filter(Boolean)
        .join(' | ') || 'NONE',
    });
  }

  return diagnostics.ok;
}
