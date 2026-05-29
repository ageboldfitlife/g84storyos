import type { IToolTranslator, TargetToolPackage } from './types';
import type { RenderPackage } from '@/types/render-package';
import { cleanPromptText, getEndFrame, getStartFrame, inferPhysicalSubject } from './prompt-utils';
import { injectGlobalNegativeProfile } from './negative-profile';

function asGptImagePrompt(framePrompt: string, runtime: RenderPackage) {
  const prompt = cleanPromptText(framePrompt);

  return {
    meta: {
      aspect_ratio: runtime.aspect_ratio,
      resolution_target: 'production still frame',
    },
    global_context: prompt,
    color_palette: ['FILE15-derived practical colors', 'natural shadow tones'],
    composition: {
      subject: inferPhysicalSubject(prompt, runtime),
      framing: 'cinematic still frame based only on FILE15 runtime',
      camera: 'preserve the camera angle already present in runtime',
    },
    depth_layers: {
      foreground: 'use only visible foreground elements described by FILE15',
      midground: 'use only visible action subjects described by FILE15',
      background: 'preserve the runtime location and environment geometry',
    },
    objects: ['only characters, props, and locations explicitly present in FILE15'],
    imperfections: ['subtle real-world texture', 'natural material wear when appropriate'],
    physics: ['realistic lighting behavior', 'coherent object contact and scale'],
    style: 'grounded cinematic realism',
    do_not_include: [
      'new characters',
      'new props',
      'new locations',
      'video motion blur instructions',
      'screenplay-specific look',
      'raw prompt labels',
    ],
  };
}

export const gptImageTranslator: IToolTranslator = {
  toolId: 'gpt_image',
  translate(runtime: RenderPackage): TargetToolPackage {
    const startPrompt = cleanPromptText(getStartFrame(runtime));
    const endPrompt = cleanPromptText(getEndFrame(runtime));

    return {
      shot_id: runtime.shot_id,
      start_frame: {
        prompt: startPrompt,
        negative_prompt: injectGlobalNegativeProfile(runtime.negative_prompt),
      },
      motion_intent: cleanPromptText(runtime.motion_intent),
      end_frame: {
        prompt: endPrompt,
        negative_prompt: injectGlobalNegativeProfile(runtime.negative_prompt),
      },
    };
  },
};
