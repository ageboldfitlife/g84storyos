import type { ShotRuntime } from "../types/shot-runtime";
import type { RenderPackage } from "../types/render-package";

export type RenderTargetTool = "flux" | "midjourney" | "comfyui" | "sora" | "kling";

export function exportRenderPackage(
  shot: ShotRuntime,
  _targetTool: RenderTargetTool
): RenderPackage {
  const missingCharacterRef = shot.I_Character.missing_character_refs?.[0];
  if (missingCharacterRef) {
    throw new Error(`MISSING_CHARACTER: ${missingCharacterRef}`);
  }

  if (shot.P_Computed.generation_status === "not_generated") {
    throw new Error(`Shot ${shot.A_Identity.shot_id} has not generated a prompt yet.`);
  }
  if (shot.P_Computed.generation_status === "stale") {
    throw new Error(`Shot ${shot.A_Identity.shot_id} is stale. Regenerate the prompt before export.`);
  }

  const renderSeed = shot.O_MachineBridge.injected_seeds ?? Math.floor(Math.random() * 1000000);
  const startFramePrompt = shot.E_Motion.start_frame_prompt || "";
  const motionIntent = shot.E_Motion.motion_intent || "";
  const endFramePrompt = shot.E_Motion.end_frame_prompt || "";
  const hasMotionRuntime = Boolean(
    startFramePrompt.trim() || endFramePrompt.trim()
  );
  const positivePrompt = hasMotionRuntime
    ? startFramePrompt || endFramePrompt
    : shot.P_Computed.prompt_text_en || "";

  return {
    shot_id: shot.A_Identity.shot_id,
    project_id: shot.A_Identity.project_id,
    episode_id: shot.A_Identity.episode_id,
    scene_id: shot.A_Identity.scene_id,

    aspect_ratio: "9:16",
    duration_target_sec: shot.F_EditorHandles.duration_target_sec,
    ai_generation_chunk_sec: shot.F_EditorHandles.ai_generation_chunk_sec ?? shot.F_EditorHandles.duration_render_sec,

    positive_prompt: positivePrompt,
    negative_prompt: shot.P_Computed.negative_prompt_en || "",
    start_frame_prompt: startFramePrompt,
    motion_intent: motionIntent,
    end_frame_prompt: endFramePrompt,

    reference_images: shot.O_MachineBridge.ref_images,
    seed: renderSeed,

    exported_at: new Date().toISOString(),
    from_shot_version: shot.A_Identity.version,
  };
}
