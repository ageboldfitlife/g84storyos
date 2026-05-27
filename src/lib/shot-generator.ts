import { OpeningPatternsDict } from '@/data/opening-patterns';
import type { ShotRuntime } from '@/types/shot-runtime';

type ShotType = ShotRuntime['A_Identity']['shot_type'];

const FALLBACK_SHOT_TYPE: ShotType = 'COVERAGE';
const VALID_SHOT_TYPES: ShotType[] = ['HERO', 'COVERAGE', 'INSERT', 'CUTAWAY', 'BRIDGE', 'REACTION'];

function resolveShotType(shotTypes: string[]): ShotType {
  const firstType = shotTypes[0];

  if (VALID_SHOT_TYPES.includes(firstType as ShotType)) {
    return firstType as ShotType;
  }

  return FALLBACK_SHOT_TYPE;
}

export function generateShotsFromPattern(
  projectId: string,
  episodeId: string,
  sceneId: string,
  patternId: string
): ShotRuntime[] {
  const pattern = OpeningPatternsDict[patternId];

  if (!pattern) {
    throw new Error(`Opening pattern not found: ${patternId}`);
  }

  const now = new Date().toISOString();

  return pattern.sequence.map((position, index) => {
    const shotType = resolveShotType(position.allowed_shot_types);
    const shotId = `${sceneId}_${position.position.toString().padStart(3, '0')}`;

    return {
      A_Identity: {
        shot_id: shotId,
        project_id: projectId,
        episode_id: episodeId,
        scene_id: sceneId,
        shot_index: index + 1,
        shot_type: shotType,
        priority: 'B',
        version: 'v1.0',
        title: `${pattern.pattern_id} ${shotType} ${position.position}`,
        created_at: now,
        updated_at: now,
      },
      B_Narrative: {
        act: 1,
        beat: pattern.story_engine,
        emotion_start: '',
        emotion_end: '',
        narrative_intent: '',
      },
      C_PatternRef: {
        scene_pattern_id: pattern.pattern_id,
        position_in_pattern: position.position,
        pattern_rules_apply: true,
        override_reason: null,
        time_budget_compliance: {
          target_sec: pattern.time_budget_max_sec,
          actual_render_sec: 0,
          within_budget: true,
        },
      },
      D_Frames: {
        start_frame: {
          description: '',
          character_pose: '',
          gaze: '',
          hand_action: '',
          prop_state: '',
        },
        end_frame: {
          description: '',
          character_pose: '',
          gaze: '',
          hand_action: '',
          prop_state: '',
        },
      },
      E_Motion: {
        main_action: '',
        movement_start: '',
        movement_middle: '',
        movement_end: '',
        micro_action: '',
        forbidden_motion: pattern.forbidden_camera_movements,
      },
      F_EditorHandles: {
        duration_target_sec: position.min_handle_sec,
        duration_handle_sec: position.min_handle_sec,
        duration_render_sec: position.min_handle_sec,
        ai_generation_chunk_sec: null,
        usable_range_suggested: {
          start_sec: 0,
          end_sec: position.min_handle_sec,
          note: null,
        },
        handle_distribution: position.handle_distribution,
        cut_in_point_suggested_sec: 0,
        cut_out_point_suggested_sec: position.min_handle_sec,
        freeze_frame_allowed: false,
        handle_notes: null,
      },
      G_Camera: {
        camera_node: '',
        camera_framing: '',
        lens: '',
        height: '',
        angle: '',
        movement: '',
        depth_of_field: '',
        camera_intent: '',
      },
      H_Spatial: {
        env_id: '',
        location: '',
        planes_fg: '',
        planes_mg: '',
        planes_bg: '',
        topology_rules: '',
        negative_space_rules: '',
      },
      I_Character: {
        character_ids: [],
        face_lock_ref: '',
        outfit_lock_ref: '',
        signature_prop: '',
        behavior_lock: '',
        forbidden: [],
      },
      J_Props: {
        required_props: [],
        prop_positions: '',
        prop_arc_note: '',
        forbidden_props: [],
      },
      K_Style: {
        dna_lock: 'OCP1_NIGHT',
        override_lighting: null,
        override_look: null,
      },
      L_LockLevels: {
        character_lock: 'FLEXIBLE',
        spatial_lock: 'FLEXIBLE',
        prop_lock: 'FLEXIBLE',
        dna_lock: 'STRICT',
        continuity_lock: 'FLEXIBLE',
        lock_priority: {
          dna_lock: 1,
          spatial_lock: 2,
          character_lock: 3,
          prop_lock: 4,
          continuity_lock: 5,
        },
        lock_relax_advisory: null,
        auto_relax_enabled: false,
      },
      M_Continuity: {
        prev_shot_id: null,
        next_shot_id: null,
        carry_over: '',
        match_action: '',
        eye_line: '',
        continuity_risk_flags: [],
      },
      N_EditorNotes: {
        sound_anchor: '',
        foley: '',
        music_intent: '',
        cut_map_note: '',
        editor_freedom_note: '',
      },
      O_MachineBridge: {
        base_model: 'flux.1-dev',
        lora_locks: [],
        injected_seeds: null,
        ref_images: {
          face_ref: null,
          env_ref: null,
          depth_map: null,
          thumbnail: null,
        },
      },
      P_Computed: {
        generation_status: 'not_generated',
        generated_at: null,
        generated_from_shot_version: null,
        prompt_text_en: null,
        negative_prompt_en: null,
        prompt_by_tool: {
          flux: null,
          midjourney: null,
          comfyui: null,
          sora: null,
          kling: null,
        },
        prompt_debug: {
          layer_subject: null,
          layer_action_state: null,
          layer_environment: null,
          layer_lighting: null,
          layer_camera: null,
          layer_style: null,
          layer_anti_hallucination: null,
          assembly_warnings: [],
        },
        qwen_params: null,
        token_count_estimate: null,
        staleness_reason: null,
      },
      Q_RenderState: {
        status: 'DRAFT',
        render_tier: 'test',
        generated_assets: {
          image_url: null,
          depth_url: null,
          mask_url: null,
          video_url: null,
        },
        render_time: null,
        render_model_used: null,
        google_drive_folder_url: null,
        assigned_to: null,
        render_result_url: null,
      },
      R_QAState: {
        qa_status: 'PASS',
        checks: {
          face: null,
          hand: null,
          outfit: null,
          prop: null,
          topology: null,
          lighting: null,
          motion: null,
          json: null,
          continuity: null,
        },
        issues: [],
        fix_instructions: [],
        reviewed_at: null,
        reviewer: null,
      },
    };
  });
}
