export interface RenderPackage {
  shot_id: string;
  project_id: string;
  episode_id: string;
  scene_id: string;

  target_tool: "flux" | "midjourney" | "comfyui" | "sora" | "kling";
  render_duration_sec: number;
  chunk_size_sec: number | null;

  positive_prompt: string;
  negative_prompt: string;
  tool_specific_payload: any;

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
