import type { ShotRuntime, SectionP_Computed } from "../types/shot-runtime";
import { DNALockDictionary } from "../data/dna-lock-dict";

export function generatePrompt(shot: ShotRuntime): SectionP_Computed {
  const dnaKey = shot.K_Style.dna_lock;
  const dna = DNALockDictionary[dnaKey];
  const warnings: string[] = [];

  if (!dna) {
    warnings.push(`CẢNH BÁO: Không tìm thấy DNA Lock '${dnaKey}'. Dùng fallback mặc định.`);
  }

  // --- 1. LAYER: SUBJECT & CHARACTER ---
  const subject = shot.I_Character.character_ids.length > 0
    ? `Characters: ${shot.I_Character.character_ids.join(", ")}, wearing ${shot.I_Character.outfit_lock_ref}, behavior: ${shot.I_Character.behavior_lock}`
    : "Subject: Empty environment or establishing shot";

  // --- 2. LAYER: ACTION STATE ---
  const actionState = `Action: ${shot.E_Motion.main_action}. Pose: ${shot.D_Frames.start_frame.character_pose}, Hand action: ${shot.D_Frames.start_frame.hand_action}, Gaze: ${shot.D_Frames.start_frame.gaze}. Prop state: ${shot.D_Frames.start_frame.prop_state}`;

  // --- 3. LAYER: ENVIRONMENT & SPATIAL ---
  const environment = `Environment: ${shot.H_Spatial.location}. Foreground: ${shot.H_Spatial.planes_fg}. Midground: ${shot.H_Spatial.planes_mg}. Background: ${shot.H_Spatial.planes_bg}`;

  // --- 4. LAYER: LIGHTING ---
  const lighting = dna
    ? `Lighting: ${dna.lighting_style}, ${dna.key_light}, Temperature: ${dna.color_temp}`
    : "Lighting: Cinematic standard";

  // --- 5. LAYER: CAMERA ---
  const camera = `Camera: ${shot.G_Camera.camera_framing}, Lens: ${shot.G_Camera.lens}, Angle: ${shot.G_Camera.angle}, Depth of Field: ${shot.G_Camera.depth_of_field}`;

  // --- 6. LAYER: STYLE & LOOK ---
  const style = dna
    ? `Style: ${dna.film_stock}`
    : "Style: Masterpiece, high quality";

  // --- TỔNG HỢP POSITIVE PROMPT ---
  const promptParts = [subject, actionState, environment, lighting, camera, style];
  const prompt_text_en = promptParts.join(" | ");

  // --- 7. LAYER: ANTI-HALLUCINATION (NEGATIVE PROMPT) ---
  const forbiddenMotions = shot.E_Motion.forbidden_motion.length > 0 ? `Motion: ${shot.E_Motion.forbidden_motion.join(", ")}` : "";
  const forbiddenProps = shot.J_Props.forbidden_props.length > 0 ? `Props: ${shot.J_Props.forbidden_props.join(", ")}` : "";
  const forbiddenChars = shot.I_Character.forbidden.length > 0 ? `Traits: ${shot.I_Character.forbidden.join(", ")}` : "";

  const baseNegative = dna ? dna.negative_prompt_prefix : "";
  const negativeParts = [baseNegative, forbiddenMotions, forbiddenProps, forbiddenChars].filter(Boolean);
  const negative_prompt_en = negativeParts.join(", ");

  return {
    generation_status: "generated",
    generated_at: new Date().toISOString(),
    generated_from_shot_version: shot.A_Identity.version,
    prompt_text_en,
    negative_prompt_en,
    prompt_by_tool: {
      flux: prompt_text_en,
      midjourney: `${prompt_text_en} --ar 16:9 --style raw`,
      comfyui: {
        positive: prompt_text_en,
        negative: negative_prompt_en,
        cfg_scale: 7.0,
        steps: 30
      },
      sora: null,
      kling: null
    },
    prompt_debug: {
      layer_subject: subject,
      layer_action_state: actionState,
      layer_environment: environment,
      layer_lighting: lighting,
      layer_camera: camera,
      layer_style: style,
      layer_anti_hallucination: negativeParts.length > 0 ? negativeParts.join(" | ") : null,
      assembly_warnings: warnings
    },
    qwen_params: null,
    token_count_estimate: Math.round(prompt_text_en.length / 4),
    staleness_reason: null
  };
}
