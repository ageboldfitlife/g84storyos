import type { ShotRuntime } from "../types/shot-runtime";
import type { RenderPackage } from "../types/render-package";

export function exportRenderPackage(
  shot: ShotRuntime,
  targetTool: "flux" | "midjourney" | "comfyui" | "sora" | "kling"
): RenderPackage {

  if (shot.P_Computed.generation_status === "not_generated") {
    throw new Error(`LỖI: Shot ${shot.A_Identity.shot_id} chưa được sinh Prompt.`);
  }
  if (shot.P_Computed.generation_status === "stale") {
    throw new Error(`LỖI: Shot ${shot.A_Identity.shot_id} bị stale. Cần re-generate trước khi xuất.`);
  }

  const renderSeed = shot.O_MachineBridge.injected_seeds ?? Math.floor(Math.random() * 1000000);

  return {
    shot_id: shot.A_Identity.shot_id,
    project_id: shot.A_Identity.project_id,
    episode_id: shot.A_Identity.episode_id,
    scene_id: shot.A_Identity.scene_id,

    target_tool: targetTool,
    render_duration_sec: shot.F_EditorHandles.duration_render_sec,
    chunk_size_sec: shot.F_EditorHandles.ai_generation_chunk_sec,

    positive_prompt: shot.P_Computed.prompt_text_en || "",
    negative_prompt: shot.P_Computed.negative_prompt_en || "",
    tool_specific_payload: shot.P_Computed.prompt_by_tool[targetTool] || null,

    reference_images: shot.O_MachineBridge.ref_images,
    seed: renderSeed,

    exported_at: new Date().toISOString(),
    from_shot_version: shot.A_Identity.version,
  };
}
