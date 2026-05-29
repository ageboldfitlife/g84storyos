export interface PatternPosition {
  position: number;
  allowed_shot_types: string[];
  handle_distribution: "tail_only" | "both_ends" | "head_only";
  min_handle_sec: number;
}

export interface OpeningPattern {
  pattern_id: string;
  story_engine: string;
  time_budget_max_sec: number;
  sequence: PatternPosition[];
  forbidden_camera_movements: string[];
}

export const OpeningPatternsDict: Record<string, OpeningPattern> = {
  "OPEN_E01_MYSTERY": {
    pattern_id: "OPEN_E01_MYSTERY",
    story_engine: "mystery",
    time_budget_max_sec: 15.0,
    sequence: [
      { position: 1, allowed_shot_types: ["INSERT"], handle_distribution: "tail_only", min_handle_sec: 1.0 },
      { position: 2, allowed_shot_types: ["CUTAWAY"], handle_distribution: "both_ends", min_handle_sec: 1.0 },
      { position: 3, allowed_shot_types: ["COVERAGE", "HERO"], handle_distribution: "head_only", min_handle_sec: 1.0 }
    ],
    forbidden_camera_movements: ["fast_pan", "whip_pan"]
  }
};
