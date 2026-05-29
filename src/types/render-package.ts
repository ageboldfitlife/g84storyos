export interface RenderPackage {
  shot_id: string;
  project_id: string;
  episode_id: string;
  scene_id: string;

  aspect_ratio: string;
  duration_target_sec: number;
  ai_generation_chunk_sec: number;

  positive_prompt: string;
  negative_prompt: string;
  start_frame_prompt?: string;
  motion_intent?: string;
  end_frame_prompt?: string;
  text_overlay?: string;
  subject?: string;
  foreground_actor?: string;
  shot_focus?: string;
  char_refs?: string[];

  reference_images: {
    face_ref: string | null;
    env_ref: string | null;
    depth_map: string | null;
    thumbnail: string | null;
  };
  seed: number;

  exported_at: string;
  from_shot_version: string;
}
