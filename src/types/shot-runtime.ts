export type LockLevel = "STRICT" | "FLEXIBLE" | "EXEMPT";
export type GenStatus = "not_generated" | "generated" | "stale" | "locked";
export type RenderStatus = "DRAFT" | "READY" | "QUEUED" | "RENDERING" | "RENDERED" | "FAILED" | "EXPORTED_FOR_HUMAN_RENDER";
export type ExportLifecycleStatus =
  | "DRAFT"
  | "GENERATED"
  | "EXPORTED_FOR_RENDER"
  | "RENDER_RETURNED"
  | "QA_PENDING"
  | "APPROVED";
export type QAStatus = "PENDING" | "PASS" | "NEED_FIX" | "FAIL";

export interface SectionA_Identity {
  shot_id: string;
  project_id: string;
  episode_id: string;
  scene_id: string;
  shot_index: number;
  shot_type: "HERO" | "COVERAGE" | "INSERT" | "CUTAWAY" | "BRIDGE" | "REACTION";
  priority: "A" | "B" | "C";
  version: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface SectionB_Narrative {
  act: number;
  beat: string;
  emotion_start: string;
  emotion_end: string;
  narrative_intent: string;
}

export interface SectionC_PatternRef {
  scene_pattern_id: string | null;
  position_in_pattern: number | null;
  pattern_rules_apply: boolean;
  override_reason: string | null;
  time_budget_compliance: {
    target_sec: number;
    actual_render_sec: number;
    within_budget: boolean;
  };
}

export interface FrameState {
  description: string;
  character_pose: string;
  gaze: string;
  hand_action: string;
  prop_state: string;
}

export interface SectionD_Frames {
  start_frame: FrameState;
  end_frame: FrameState;
}

export interface SectionE_Motion {
  main_action: string;
  movement_start: string;
  movement_middle: string;
  movement_end: string;
  micro_action: string;
  forbidden_motion: string[];
  start_frame_prompt?: string;
  end_frame_prompt?: string;
  motion_intent?: string;
}

export interface SectionF_EditorHandles {
  duration_target_sec: number;
  duration_handle_sec: number;
  duration_render_sec: number;
  ai_generation_chunk_sec: number | null;
  usable_range_suggested: {
    start_sec: number;
    end_sec: number;
    note: string | null;
  };
  handle_distribution: "tail_only" | "both_ends" | "head_only";
  cut_in_point_suggested_sec: number;
  cut_out_point_suggested_sec: number;
  freeze_frame_allowed: boolean;
  handle_notes: string | null;
}

export interface SectionG_Camera {
  camera_node: string;
  camera_framing: string;
  lens: string;
  height: string;
  angle: string;
  movement: string;
  depth_of_field: string;
  camera_intent: string;
  contrast_level?: string;
  cut_hook?: string;
}

export interface SectionH_Spatial {
  env_id: string;
  location: string;
  planes_fg: string;
  planes_mg: string;
  planes_bg: string;
  topology_rules: string;
  negative_space_rules: string;
  spatial_seed?: string;
  environment_hash?: string;
  physics_frozen_state?: string;
  imperfections?: string[];
}

export interface SectionI_Character {
  character_ids: string[];
  face_lock_ref: string;
  outfit_lock_ref: string;
  signature_prop: string;
  behavior_lock: string;
  forbidden: string[];
  char_refs?: string[];
  visual_lock_refs?: string[];
  wardrobe_lock?: string;
  continuity_lock?: string;
  missing_character_refs?: string[];
  micro_details?: string[];
  emotional_posture?: string;
  behavior_memory?: string;
}

export interface SectionJ_Props {
  required_props: string[];
  prop_positions: string;
  prop_arc_note: string;
  forbidden_props: string[];
}

export interface SectionK_Style {
  dna_lock: string;
  override_lighting: string | null;
  override_look: string | null;
}

export interface SectionL_LockLevels {
  character_lock: LockLevel;
  spatial_lock: LockLevel;
  prop_lock: LockLevel;
  dna_lock: Exclude<LockLevel, "EXEMPT">;
  continuity_lock: LockLevel;
  lock_priority: {
    dna_lock: number;
    spatial_lock: number;
    character_lock: number;
    prop_lock: number;
    continuity_lock: number;
  };
  lock_relax_advisory: string | null;
  auto_relax_enabled: boolean;
}

export interface SectionM_Continuity {
  prev_shot_id: string | null;
  next_shot_id: string | null;
  carry_over: string;
  match_action: string;
  eye_line: string;
  continuity_risk_flags: string[];
}

export interface SectionN_EditorNotes {
  sound_anchor: string;
  foley: string;
  music_intent: string;
  cut_map_note: string;
  editor_freedom_note: string;
}

export interface SectionO_MachineBridge {
  base_model: string;
  lora_locks: string[];
  injected_seeds: number | null;
  ref_images: {
    face_ref: string | null;
    env_ref: string | null;
    depth_map: string | null;
    thumbnail: string | null;
  };
}

export interface SectionP_Computed {
  generation_status: GenStatus;
  generated_at: string | null;
  generated_from_shot_version: string | null;
  prompt_text_en: string | null;
  negative_prompt_en: string | null;
  prompt_by_tool: {
    flux: string | null;
    midjourney: string | null;
    comfyui: {
      positive: string | null;
      negative: string | null;
      cfg_scale: number;
      steps: number;
    } | null;
    sora: string | null;
    kling: string | null;
  };
  prompt_debug: {
    layer_subject: string | null;
    layer_action_state: string | null;
    layer_environment: string | null;
    layer_lighting: string | null;
    layer_camera: string | null;
    layer_style: string | null;
    layer_anti_hallucination: string | null;
    assembly_warnings: string[];
  };
  qwen_params: Record<string, any> | null;
  token_count_estimate: number | null;
  staleness_reason: string | null;
}

export interface SectionQ_RenderState {
  status: string;
  export_status?: ExportLifecycleStatus;
  render_tier: "test" | "qa" | "final";
  generated_assets: {
    image_url: string | null;
    depth_url: string | null;
    mask_url: string | null;
    video_url: string | null;
  };
  render_time: number | null;
  render_model_used: string | null;
  google_drive_folder_url: string | null;
  assigned_to?: string | null;
  google_drive_url?: string | null;
  render_result_url?: string | null;
}

export interface SectionR_QAState {
  qa_status: QAStatus;
  checks: {
    face: boolean | null;
    hand: boolean | null;
    outfit: boolean | null;
    prop: boolean | null;
    topology: boolean | null;
    lighting: boolean | null;
    motion: boolean | null;
    json: boolean | null;
    continuity: boolean | null;
  };
  issues: string[];
  fix_instructions: string[];
  reviewed_at: string | null;
  reviewer: string | null;
}

export interface ShotRuntime {
  text_overlay?: string;
  A_Identity: SectionA_Identity;
  B_Narrative: SectionB_Narrative;
  C_PatternRef: SectionC_PatternRef;
  D_Frames: SectionD_Frames;
  E_Motion: SectionE_Motion;
  F_EditorHandles: SectionF_EditorHandles;
  G_Camera: SectionG_Camera;
  H_Spatial: SectionH_Spatial;
  I_Character: SectionI_Character;
  J_Props: SectionJ_Props;
  K_Style: SectionK_Style;
  L_LockLevels: SectionL_LockLevels;
  M_Continuity: SectionM_Continuity;
  N_EditorNotes: SectionN_EditorNotes;
  O_MachineBridge: SectionO_MachineBridge;
  P_Computed: SectionP_Computed;
  Q_RenderState: SectionQ_RenderState;
  R_QAState: SectionR_QAState;
}
