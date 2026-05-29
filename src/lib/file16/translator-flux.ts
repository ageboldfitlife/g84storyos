import type { IToolTranslator, TargetToolPackage } from './types';
import type { RenderPackage } from '@/types/render-package';
import { cleanPromptText, getEndFrame, getStartFrame, inferPhysicalSubject } from './prompt-utils';
import { injectGlobalNegativeProfile } from './negative-profile';

function asFluxParagraph(framePrompt: string, runtime: RenderPackage): string {
  const prompt = cleanPromptText(framePrompt);
  const subject = inferPhysicalSubject(prompt, runtime);

  return `${prompt} Frame subject: ${subject}. Compose as a grounded cinematic still image with coherent environment geometry, consistent lighting, natural camera perspective, tactile real-world texture, and no invented characters, props, or locations. Aspect ratio ${runtime.aspect_ratio}.`;
}

export const fluxTranslator: IToolTranslator = {
  toolId: 'flux_basic',
  translate(runtime: RenderPackage): TargetToolPackage {
    const startPrompt = asFluxParagraph(getStartFrame(runtime), runtime);
    const endPrompt = asFluxParagraph(getEndFrame(runtime), runtime);

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
