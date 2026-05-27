import { z } from "zod";

const LockLevelEnum = z.enum(["STRICT", "FLEXIBLE", "EXEMPT"]);

const FrameStateSchema = z.object({
  description: z.string(),
  character_pose: z.string(),
  gaze: z.string(),
  hand_action: z.string(),
  prop_state: z.string(),
});

export const ShotRuntimeSchema = z.object({
  A_Identity: z.object({
    shot_id: z.string(),
    project_id: z.string(),
    episode_id: z.string(),
    scene_id: z.string(),
    shot_index: z.number().int(),
    shot_type: z.enum(["HERO", "COVERAGE", "INSERT", "CUTAWAY", "BRIDGE", "REACTION"]),
    priority: z.enum(["A", "B", "C"]),
    version: z.string(),
    title: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  }),

  B_Narrative: z.object({
    act: z.number().int(),
    beat: z.string(),
    emotion_start: z.string(),
    emotion_end: z.string(),
    narrative_intent: z.string(),
  }),

  C_PatternRef: z.object({
    scene_pattern_id: z.string().nullable(),
    position_in_pattern: z.number().int().nullable(),
    pattern_rules_apply: z.boolean(),
    override_reason: z.string().nullable(),
    time_budget_compliance: z.object({
      target_sec: z.number(),
      actual_render_sec: z.number(),
      within_budget: z.boolean(),
    }),
  }),

  D_Frames: z.object({
    start_frame: FrameStateSchema,
    end_frame: FrameStateSchema,
  }),

  E_Motion: z.object({
    main_action: z.string(),
    movement_start: z.string(),
    movement_middle: z.string(),
    movement_end: z.string(),
    micro_action: z.string(),
    forbidden_motion: z.array(z.string()),
  }),

  F_EditorHandles: z.object({
    duration_target_sec: z.number(),
    duration_handle_sec: z.number(),
    duration_render_sec: z.number(),
    ai_generation_chunk_sec: z.number().nullable(),
    usable_range_suggested: z.object({
      start_sec: z.number(),
      end_sec: z.number(),
      note: z.string().nullable(),
    }),
    handle_distribution: z.enum(["tail_only", "both_ends", "head_only"]),
    cut_in_point_suggested_sec: z.number(),
    cut_out_point_suggested_sec: z.number(),
    freeze_frame_allowed: z.boolean(),
    handle_notes: z.string().nullable(),
  }),

  G_Camera: z.object({
    camera_node: z.string(),
    camera_framing: z.string(),
    lens: z.string(),
    height: z.string(),
    angle: z.string(),
    movement: z.string(),
    depth_of_field: z.string(),
    camera_intent: z.string(),
  }),

  H_Spatial: z.object({
    env_id: z.string(),
    location: z.string(),
    planes_fg: z.string(),
    planes_mg: z.string(),
    planes_bg: z.string(),
    topology_rules: z.string(),
    negative_space_rules: z.string(),
  }),

  I_Character: z.object({
    character_ids: z.array(z.string()),
    face_lock_ref: z.string(),
    outfit_lock_ref: z.string(),
    signature_prop: z.string(),
    behavior_lock: z.string(),
    forbidden: z.array(z.string()),
  }),

  J_Props: z.object({
    required_props: z.array(z.string()),
    prop_positions: z.string(),
    prop_arc_note: z.string(),
    forbidden_props: z.array(z.string()),
  }),

  K_Style: z.object({
    dna_lock: z.string(),
    override_lighting: z.string().nullable(),
    override_look: z.string().nullable(),
  }),

  L_LockLevels: z.object({
    character_lock: LockLevelEnum,
    spatial_lock: LockLevelEnum,
    prop_lock: LockLevelEnum,
    dna_lock: z.enum(["STRICT", "FLEXIBLE"]),
    continuity_lock: LockLevelEnum,
    lock_priority: z.object({
      dna_lock: z.number(),
      spatial_lock: z.number(),
      character_lock: z.number(),
      prop_lock: z.number(),
      continuity_lock: z.number(),
    }),
    lock_relax_advisory: z.string().nullable(),
    auto_relax_enabled: z.literal(false),
  }),

  M_Continuity: z.object({
    prev_shot_id: z.string().nullable(),
    next_shot_id: z.string().nullable(),
    carry_over: z.string(),
    match_action: z.string(),
    eye_line: z.string(),
    continuity_risk_flags: z.array(z.string()),
  }),

  N_EditorNotes: z.object({
    sound_anchor: z.string(),
    foley: z.string(),
    music_intent: z.string(),
    cut_map_note: z.string(),
    editor_freedom_note: z.string(),
  }),

  O_MachineBridge: z.object({
    base_model: z.string(),
    lora_locks: z.array(z.string()),
    injected_seeds: z.number().nullable(),
    ref_images: z.object({
      face_ref: z.string().nullable(),
      env_ref: z.string().nullable(),
      depth_map: z.string().nullable(),
      thumbnail: z.string().nullable(),
    }),
  }),

  P_Computed: z.object({
    generation_status: z.enum(["not_generated", "generated", "stale", "locked"]),
    generated_at: z.string().nullable(),
    generated_from_shot_version: z.string().nullable(),
    prompt_text_en: z.string().nullable(),
    negative_prompt_en: z.string().nullable(),
    prompt_by_tool: z.object({
      flux: z.string().nullable(),
      midjourney: z.string().nullable(),
      comfyui: z
        .object({
          positive: z.string().nullable(),
          negative: z.string().nullable(),
          cfg_scale: z.number(),
          steps: z.number(),
        })
        .nullable(),
      sora: z.string().nullable(),
      kling: z.string().nullable(),
    }),
    prompt_debug: z.object({
      layer_subject: z.string().nullable(),
      layer_action_state: z.string().nullable(),
      layer_environment: z.string().nullable(),
      layer_lighting: z.string().nullable(),
      layer_camera: z.string().nullable(),
      layer_style: z.string().nullable(),
      layer_anti_hallucination: z.string().nullable(),
      assembly_warnings: z.array(z.string()),
    }),
    qwen_params: z.record(z.string(), z.any()).nullable(),
    token_count_estimate: z.number().nullable(),
    staleness_reason: z.string().nullable(),
  }),

  Q_RenderState: z.object({
    status: z.enum(["DRAFT", "READY", "QUEUED", "RENDERING", "RENDERED", "FAILED", "EXPORTED_FOR_HUMAN_RENDER"]),
    render_tier: z.enum(["test", "qa", "final"]),
    generated_assets: z.object({
      image_url: z.string().nullable(),
      depth_url: z.string().nullable(),
      mask_url: z.string().nullable(),
      video_url: z.string().nullable(),
    }),
    render_time: z.number().nullable(),
    render_model_used: z.string().nullable(),
    google_drive_folder_url: z.string().nullable(),
    assigned_to: z.string().nullable(),
    render_result_url: z.string().nullable(),
  }),

  R_QAState: z.object({
    qa_status: z.enum(["PENDING", "PASS", "NEED_FIX", "FAIL"]),
    checks: z.object({
      face: z.boolean().nullable(),
      hand: z.boolean().nullable(),
      outfit: z.boolean().nullable(),
      prop: z.boolean().nullable(),
      topology: z.boolean().nullable(),
      lighting: z.boolean().nullable(),
      motion: z.boolean().nullable(),
      json: z.boolean().nullable(),
      continuity: z.boolean().nullable(),
    }),
    issues: z.array(z.string()),
    fix_instructions: z.array(z.string()),
    reviewed_at: z.string().nullable(),
    reviewer: z.string().nullable(),
  }),
});
