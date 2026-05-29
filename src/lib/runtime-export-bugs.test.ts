import assert from 'node:assert/strict';
import test from 'node:test';

import { HV_TEST_HERO_001 } from '@/mock/shotData';
import { injectPreProductionRuntime } from '@/lib/preproduction-injector';
import { getRuntimeValidationDiagnostics, isRuntimeExportReady } from '@/lib/runtime-validator';
import { injectGlobalNegativeProfile } from '@/lib/file16/negative-profile';
import { compileToolPromptPackage } from '@/lib/tool-prompt-compiler';
import { inferPhysicalSubject } from '@/lib/file16/prompt-utils';
import type { RenderPackage } from '@/types/render-package';

const femaleLanhShot = {
  ...HV_TEST_HERO_001,
  A_Identity: { ...HV_TEST_HERO_001.A_Identity, shot_id: 'LANH_FIX_TEST' },
  E_Motion: {
    ...HV_TEST_HERO_001.E_Motion,
    start_frame_prompt: 'Lanh stands by the workbench.',
    end_frame_prompt: 'Lanh turns to the screwdriver.',
    motion_intent: 'He walks toward the table and he holds the screwdriver.',
  },
  I_Character: {
    ...HV_TEST_HERO_001.I_Character,
    character_ids: ['LANH-01'],
    char_refs: ['LANH-01'],
  },
};

test('injectPreProductionRuntime locks female pronouns in motion_intent to Character Bible gender', () => {
  const injected = injectPreProductionRuntime(femaleLanhShot);

  assert.match(injected.E_Motion.motion_intent ?? '', /she|her|woman/i);
  assert.doesNotMatch(injected.E_Motion.motion_intent ?? '', /\bhe\b|\bhim\b|\bman\b/i);
});

test('isRuntimeExportReady fails when frame prompts have no clear verb', () => {
  const invalidShot = {
    ...HV_TEST_HERO_001,
    E_Motion: {
      ...HV_TEST_HERO_001.E_Motion,
      start_frame_prompt: 'Mina still a screwdriver',
      motion_intent: 'Quiet tension',
      end_frame_prompt: 'Her left hand a screwdriver',
    },
  } as typeof HV_TEST_HERO_001;

  assert.equal(isRuntimeExportReady(invalidShot), false);
});

test('injectGlobalNegativeProfile strips motion grammar from image negative prompts', () => {
  const negative = injectGlobalNegativeProfile('fast_pan, whip_pan, camera movement, handheld_shaky, extra fingers');

  assert.match(negative, /extra fingers/i);
  assert.doesNotMatch(negative, /fast_pan|whip_pan|camera movement|handheld_shaky|pan|zoom|dolly/i);
});

test('getRuntimeValidationDiagnostics reports the first invalid sentence', () => {
  const shot = {
    ...HV_TEST_HERO_001,
    E_Motion: {
      ...HV_TEST_HERO_001.E_Motion,
      start_frame_prompt: 'A top-down view of an alley. Mina stands by the door.',
      motion_intent: 'The camera holds still.',
      end_frame_prompt: 'Warm light glows from the shop entrance.',
    },
  } as typeof HV_TEST_HERO_001;

  const diagnostics = getRuntimeValidationDiagnostics(shot);

  assert.equal(diagnostics.failedField, 'start_frame_prompt');
  assert.match(diagnostics.failedSentence, /A top-down view of an alley/i);
  assert.equal(diagnostics.failedReason, 'sentence missing complete verb');
});

test('compileToolPromptPackage forwards text_overlay without embedding it into the image prompt', () => {
  const runtimePackage: RenderPackage = {
    shot_id: 'SC01_005',
    project_id: 'P1',
    episode_id: 'E1',
    scene_id: 'S1',
    aspect_ratio: '9:16',
    duration_target_sec: 6,
    ai_generation_chunk_sec: 2,
    positive_prompt: 'A cinematic frame',
    negative_prompt: 'extra fingers',
    start_frame_prompt: 'Lanh holds the screwdriver.',
    motion_intent: 'She leans closer.',
    end_frame_prompt: 'Lanh pauses.',
    text_overlay: '11:03 PM',
    subject: 'Lanh',
    foreground_actor: 'Lanh',
    shot_focus: 'Lanh holds the screwdriver.',
    char_refs: ['LANH-01'],
    reference_images: {
      face_ref: null,
      env_ref: null,
      depth_map: null,
      thumbnail: null,
    },
    seed: 42,
    exported_at: '2026-05-28T00:00:00.000Z',
    from_shot_version: 'v1',
  };

  const compiled = compileToolPromptPackage(runtimePackage, 'flux_basic');

  assert.equal(compiled.tool_prompt_package.start_frame.prompt.includes('11:03 PM'), false);
  assert.equal(compiled.tool_prompt_package.end_frame.prompt.includes('11:03 PM'), false);
  assert.equal(compiled.raw_render_package.text_overlay, '11:03 PM');
});

test('ENV_KHE_EXT_001 should PASS as a valid still atmospheric shot', () => {
  const shot = {
    ...HV_TEST_HERO_001,
    A_Identity: { ...HV_TEST_HERO_001.A_Identity, shot_id: 'ENV_KHE_EXT_001' },
    E_Motion: {
      ...HV_TEST_HERO_001.E_Motion,
      start_frame_prompt: 'A small warm-lit shop opening emits a steady square of light into a narrow dark alley',
      motion_intent: 'The shop opening emits warm light into the alley.',
      end_frame_prompt: 'Warm light glows from the shop and spills into the narrow alley.',
    },
  } as typeof HV_TEST_HERO_001;

  assert.equal(isRuntimeExportReady(shot), true);
});

test('ENV_MINA_SHOP_005 should PASS with valid subject + verb + visual state', () => {
  const shot = {
    ...HV_TEST_HERO_001,
    A_Identity: { ...HV_TEST_HERO_001.A_Identity, shot_id: 'ENV_MINA_SHOP_005' },
    E_Motion: {
      ...HV_TEST_HERO_001.E_Motion,
      start_frame_prompt: 'Mina lifts the metal shutter while Lanh enters carrying a small air fryer and places it on the workbench',
      motion_intent: 'Mina lifts the metal shutter while Lanh enters carrying a small air fryer.',
      end_frame_prompt: 'Lanh places the air fryer on the workbench.',
    },
  } as typeof HV_TEST_HERO_001;

  assert.equal(isRuntimeExportReady(shot), true);
});

test('static image framing phrases should pass without a main action verb', () => {
  const shot = {
    ...HV_TEST_HERO_001,
    A_Identity: { ...HV_TEST_HERO_001.A_Identity, shot_id: 'STATIC_FRAME_001' },
    E_Motion: {
      ...HV_TEST_HERO_001.E_Motion,
      start_frame_prompt: 'A static overhead camera captures a deep narrow alley lined with old brick walls and hanging laundry.',
      motion_intent: 'The scene remains still and emotionally sealed off.',
      end_frame_prompt: 'The glass reflects the alley with quiet tension.',
    },
  } as typeof HV_TEST_HERO_001;

  assert.equal(isRuntimeExportReady(shot), true);
});

test('stillness and micro-motion phrases should pass as valid motion_intent', () => {
  const shot = {
    ...HV_TEST_HERO_001,
    A_Identity: { ...HV_TEST_HERO_001.A_Identity, shot_id: 'STILLNESS_001' },
    E_Motion: {
      ...HV_TEST_HERO_001.E_Motion,
      start_frame_prompt: 'A close-up of chopsticks and a screwdriver resting on the table.',
      motion_intent: 'No camera movement and no interaction keep the moment emotionally sealed off. The tiny motions of chopsticks and screwdriver create a quiet counterpoint.',
      end_frame_prompt: 'The frame holds on the delicate stillness.',
    },
  } as typeof HV_TEST_HERO_001;

  assert.equal(isRuntimeExportReady(shot), true);
});

test('inferPhysicalSubject prefers the active character over generic fallbacks', () => {
  assert.match(inferPhysicalSubject('Lanh in the alley', { subject: 'Lanh', char_refs: ['LANH-01'] } as any), /Lanh/i);
});
