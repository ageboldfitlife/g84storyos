export interface NarrativeTruth {
  arc_intent: string;
  emotional_state: string;
}

export interface ContinuityTruth {
  weather: string;
  time_of_day: string;
  world_state_notes: string[];
}

export interface SceneNode {
  scene_id: string;
  episode_id: string;
  location: string;
  characters_present: string[];
  props_present: string[];
  narrative: NarrativeTruth;
  continuity: ContinuityTruth;
  created_at: string;
  updated_at: string;
}

export interface SceneGraph {
  project_id: string;
  scenes: Record<string, SceneNode>;
  last_propagation_at: string | null;
}
