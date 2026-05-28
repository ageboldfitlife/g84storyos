import type { RenderPackage } from '@/types/render-package';

export type ToolPromptTarget = 'nano_banana' | 'gpt_image' | 'flux_basic';

export interface FrameToolPackage {
  prompt: string;
  negative_prompt: string;
}

export interface TargetToolPackage {
  shot_id: string;
  start_frame: FrameToolPackage;
  motion_intent: string;
  end_frame: FrameToolPackage;
}

export interface CompiledRenderExport {
  shot_id: string;
  target_tool: ToolPromptTarget;
  raw_render_package: RenderPackage;
  tool_prompt_package: TargetToolPackage;
}

export interface IToolTranslator {
  toolId: ToolPromptTarget;
  translate(runtime: RenderPackage): TargetToolPackage;
}
