import type { RenderPackage } from "../types/render-package";

export interface ValidationResult {
  pass: boolean;
  errors: string[];
  warnings: string[];
}

export function validateRenderPackage(pkg: RenderPackage): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!pkg.positive_prompt || pkg.positive_prompt.trim() === "") {
    errors.push("BLOCK: Positive prompt is empty.");
  }
  if (!pkg.negative_prompt || pkg.negative_prompt.trim() === "") {
    warnings.push("LOG: Negative prompt is empty.");
  }

  if (!pkg.aspect_ratio || pkg.aspect_ratio.trim() === "") {
    errors.push("BLOCK: Aspect ratio is empty.");
  }

  if (pkg.duration_target_sec <= 0) {
    errors.push("BLOCK: Duration target must be greater than zero.");
  }

  if (pkg.ai_generation_chunk_sec <= 0) {
    errors.push("BLOCK: AI generation chunk must be greater than zero.");
  }

  if (pkg.seed < 0) {
    warnings.push("LOG: Seed is negative and may be ignored by render tools.");
  }

  return {
    pass: errors.length === 0,
    errors,
    warnings
  };
}
