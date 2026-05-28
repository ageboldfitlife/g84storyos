import type { IToolTranslator, TargetToolPackage } from './types';
import type { RenderPackage } from '@/types/render-package';
import { cleanPromptText, getEndFrame, getStartFrame } from './prompt-utils';
import { injectGlobalNegativeProfile } from './negative-profile';

function asNanoBananaInstruction(framePrompt: string, runtime: RenderPackage) {
  return {
    META: {
      aspect_ratio: runtime.aspect_ratio,
      contrast_level: 'cinematic natural contrast',
      resolution_target: 'production still frame',
    },
    ANCHOR_IMAGE: null,
    EDIT_INSTRUCTION: cleanPromptText(framePrompt),
    MICRO_DETAILS: ['Preserve FILE15 character identity locks', 'Preserve practical props described by the runtime'],
    PRESERVE: ['environment geometry', 'lighting', 'camera angle', 'wardrobe continuity'],
    CHANGE: ['only the frame-specific pose/action/gaze/prop state already present in FILE15'],
  };
}

export const nanoBananaTranslator: IToolTranslator = {
  toolId: 'nano_banana',
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
