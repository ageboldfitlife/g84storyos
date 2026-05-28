import type { RenderPackage } from '@/types/render-package';
import { fluxTranslator } from '@/lib/file16/translator-flux';
import { gptImageTranslator } from '@/lib/file16/translator-gpt-image';
import { nanoBananaTranslator } from '@/lib/file16/translator-nano';
import type {
  CompiledRenderExport,
  IToolTranslator,
  ToolPromptTarget,
} from '@/lib/file16/types';

export type { CompiledRenderExport, IToolTranslator, ToolPromptTarget } from '@/lib/file16/types';

const TRANSLATORS: Record<ToolPromptTarget, IToolTranslator> = {
  nano_banana: nanoBananaTranslator,
  gpt_image: gptImageTranslator,
  flux_basic: fluxTranslator,
};

export function compileToolPromptPackage(
  runtime: RenderPackage,
  targetTool: ToolPromptTarget
): CompiledRenderExport {
  const translator = TRANSLATORS[targetTool] ?? fluxTranslator;

  return {
    shot_id: runtime.shot_id,
    target_tool: translator.toolId,
    raw_render_package: runtime,
    tool_prompt_package: translator.translate(runtime),
  };
}
