import type { ShotRuntime, SectionP_Computed } from "../types/shot-runtime";
import { DNALockDictionary } from "../data/dna-lock-dict";

const TRANSLATION_DICTIONARY: Record<string, string> = {
  "Tháo nắp nồi, phát hiện mạch điện, khựng lại.": "Removing the rice cooker cover, discovering the circuit board, then pausing in shock.",
  "Tháo nắp đáy, khựng lại khi thấy bảng mạch": "Removing the bottom cover, pausing after seeing the circuit board.",
  "Vặn ốc nhanh nhẹn": "Quickly unscrewing the casing.",
  "Nắp bung, tay khựng lại": "The cover pops open and the hand freezes mid-motion.",
  "Ngước mắt lên chậm": "Slowly looking up.",
  "Chớp mắt chậm, mím môi": "Slow blink, lips pressed tight.",
  "Mím môi, chớp mắt chậm": "Lips pressed tight, slow blink.",
  "cúi người, hai tay cầm tua vít": "leaning forward, both hands holding a screwdriver tightly",
  "Mina cúi xuống bàn làm việc": "Mina leaning over the workbench",
  "Cận tay thao tác với tua vít": "Close-up of hands working with a screwdriver",
  "nhìn chằm chằm linh kiện": "staring intensely at the components",
  "Nhìn chằm chằm, tập trung": "staring intensely with focused concentration",
  "vặn ốc": "unscrewing the casing",
  "Đang tháo nắp đáy bằng tua vít": "removing the bottom cover with a screwdriver",
  "nồi cơm chưa mở hẳn": "rice cooker not fully opened yet",
  "Nồi cơm điện rỉ sét, đang bị tháo nắp": "rusted rice cooker with its cover being removed",
  "Bàn làm việc hẻm sau": "Workbench in a back alley",
  "Hẻm sau nhà máy, mưa rả rích": "Back alley behind a factory, steady rain",
  "Mép bàn, ốc vít": "table edge, loose screws",
  "Tua vít, mép bàn rỉ sét": "screwdriver and rusted table edge",
  "Mina, nồi cơm": "Mina and the rice cooker",
  "Mina và nồi cơm điện": "Mina and the rice cooker",
  "Tường gạch, neon đỏ mờ": "brick wall with dim red neon",
  "Hẻm tối, mưa trên mái tôn": "dark alley, rain falling on a corrugated metal roof",
  "nồi cơm trên bàn, tua vít trong tay": "rice cooker on the table, screwdriver in hand",
  "Lộ mạch điện": "exposed circuit board",
  "Nồi cơm mở ra, lộ bảng mạch đỏ": "rice cooker opened, revealing a red circuit board",
  "lầm lì, tập trung": "quiet, tense, focused",
  "kính bảo hộ trán": "safety goggles on forehead",
  "Tóc dài": "long hair",
  "Không được cười": "smiling",
  "Không nhìn thẳng ống kính": "looking directly into the camera",
  "điện thoại": "mobile phone",
};

function isFilled(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function mapToEnglish(text: string | null | undefined): string {
  if (!isFilled(text)) return "";

  const trimmed = text.trim();
  return TRANSLATION_DICTIONARY[trimmed] ?? trimmed;
}

function joinNamedParts(parts: Array<[string, string | null | undefined]>): string {
  return parts
    .map(([label, value]) => {
      const englishValue = mapToEnglish(value);
      return englishValue ? `${label}: ${englishValue}` : "";
    })
    .filter(Boolean)
    .join(", ");
}

function joinPromptLayers(layers: Array<string | null | undefined>): string {
  return layers
    .map((layer) => mapToEnglish(layer))
    .filter(Boolean)
    .join(" | ");
}

function joinEnglishList(values: string[]): string {
  return values
    .map((value) => mapToEnglish(value))
    .filter(Boolean)
    .join(", ");
}

function hasHandFocusedAction(shot: ShotRuntime): boolean {
  const actionText = [
    shot.E_Motion.main_action,
    shot.D_Frames.start_frame.character_pose,
    shot.D_Frames.start_frame.hand_action,
  ]
    .map((value) => mapToEnglish(value).toLowerCase())
    .join(" ");

  return actionText.includes("hand") || actionText.includes("hands") || actionText.includes("screwdriver");
}

export function generatePrompt(shot: ShotRuntime): SectionP_Computed {
  const dnaKey = shot.K_Style.dna_lock;
  const dna = DNALockDictionary[dnaKey];
  const warnings: string[] = [];

  if (!dna) {
    warnings.push(`DNA Lock '${dnaKey}' was not found. Default cinematic fallback was used.`);
  }

  const characterList = joinEnglishList(shot.I_Character.character_ids);
  const isInsertOrCutaway = shot.A_Identity.shot_type === "INSERT" || shot.A_Identity.shot_type === "CUTAWAY";
  const subject = shot.I_Character.character_ids.length > 0
    ? joinNamedParts([
        ["Characters", characterList],
        ["Wardrobe", shot.I_Character.outfit_lock_ref],
        ["Behavior", shot.I_Character.behavior_lock],
      ])
    : isInsertOrCutaway && hasHandFocusedAction(shot)
      ? "Subject: Close-up of MINA-01's hands"
    : "Subject: empty environment or establishing shot";

  const actionState = joinNamedParts([
    ["Action", shot.E_Motion.main_action],
    ["Pose", shot.D_Frames.start_frame.character_pose],
    ["Hand action", shot.D_Frames.start_frame.hand_action],
    ["Gaze", shot.D_Frames.start_frame.gaze],
    ["Prop state", shot.D_Frames.start_frame.prop_state],
  ]);

  const environment = joinNamedParts([
    ["Environment", shot.H_Spatial.location],
    ["Foreground", shot.H_Spatial.planes_fg],
    ["Midground", shot.H_Spatial.planes_mg],
    ["Background", shot.H_Spatial.planes_bg],
  ]);

  const lighting = isFilled(shot.K_Style.override_lighting)
    ? joinNamedParts([["Lighting", shot.K_Style.override_lighting]])
    : dna
      ? joinNamedParts([
          ["Lighting", dna.lighting_style],
          ["Key light", dna.key_light],
          ["Color temperature", dna.color_temp],
        ])
      : "Lighting: cinematic standard";

  const camera = joinNamedParts([
    ["Camera framing", shot.G_Camera.camera_framing],
    ["Lens", shot.G_Camera.lens],
    ["Angle", shot.G_Camera.angle],
    ["Depth of field", shot.G_Camera.depth_of_field],
  ]);

  const style = isFilled(shot.K_Style.override_look)
    ? joinNamedParts([["Style", shot.K_Style.override_look]])
    : dna
      ? joinNamedParts([["Style", dna.film_stock]])
      : "Style: masterpiece, high quality";

  const prompt_text_en = joinPromptLayers([subject, actionState, environment, lighting, camera, style]);

  const forbiddenMotions = shot.E_Motion.forbidden_motion.length > 0 ? `Motion: ${joinEnglishList(shot.E_Motion.forbidden_motion)}` : "";
  const forbiddenProps = shot.J_Props.forbidden_props.length > 0 ? `Props: ${joinEnglishList(shot.J_Props.forbidden_props)}` : "";
  const forbiddenChars = shot.I_Character.forbidden.length > 0 ? `Traits: ${joinEnglishList(shot.I_Character.forbidden)}` : "";

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
