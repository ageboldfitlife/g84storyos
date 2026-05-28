import assert from 'node:assert/strict';
import test from 'node:test';

import { compileToolPromptPackage } from '@/lib/tool-prompt-compiler';
import type { RenderPackage } from '@/types/render-package';

const runtime: RenderPackage = {
  shot_id: 'SC01_005',
  project_id: 'P1',
  episode_id: 'E1',
  scene_id: 'S1',
  aspect_ratio: '9:16',
  duration_target_sec: 6,
  ai_generation_chunk_sec: 2,
  positive_prompt: 'A cinematic frame',
  negative_prompt: 'extra fingers',
  start_frame_prompt: 'Start frame prompt',
  motion_intent: 'Camera push in',
  end_frame_prompt: 'End frame prompt',
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

test('compileToolPromptPackage injects negative prompts into each frame package', () => {
  const compiled = compileToolPromptPackage(runtime, 'flux_basic');

  assert.ok(compiled.tool_prompt_package.start_frame, 'start_frame should exist');
  assert.ok(compiled.tool_prompt_package.end_frame, 'end_frame should exist');
  assert.equal(typeof compiled.tool_prompt_package.start_frame, 'object');
  assert.equal(typeof compiled.tool_prompt_package.end_frame, 'object');
  assert.match(String(compiled.tool_prompt_package.start_frame.negative_prompt ?? ''), /extra fingers/i);
  assert.match(String(compiled.tool_prompt_package.end_frame.negative_prompt ?? ''), /extra fingers/i);
  assert.equal('negative_prompt' in compiled.tool_prompt_package, false);
});
