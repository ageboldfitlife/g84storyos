import type { RenderPackage } from "../types/render-package";

export interface ValidationResult {
  pass: boolean;
  errors: string[];
  warnings: string[];
}

export function validateRenderPackage(pkg: RenderPackage): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // --- 1. KIỂM TRA PROMPT (Tử huyệt) ---
  if (!pkg.positive_prompt || pkg.positive_prompt.trim() === "") {
    errors.push("BLOCK: Positive Prompt trống! Không thể gửi cho AI.");
  }
  if (!pkg.negative_prompt || pkg.negative_prompt.trim() === "") {
    warnings.push("LOG: Negative Prompt trống. AI dễ bị ảo giác.");
  }

  // --- 2. KIỂM TRA LUẬT CỦA TỪNG TOOL ---
  switch (pkg.target_tool) {
    case "kling":
      if (pkg.chunk_size_sec !== 5 && pkg.chunk_size_sec !== 10) {
        errors.push(`BLOCK: Kling chỉ hỗ trợ chunk 5s hoặc 10s. Hiện tại đòi render: ${pkg.chunk_size_sec}s`);
      }
      break;
    case "sora":
      warnings.push("LOG: API Sora hiện chưa public, render sẽ fallback sang test-mode.");
      break;
    case "flux":
    case "midjourney":
      if (pkg.chunk_size_sec !== null) {
        warnings.push(`LOG: Tool ${pkg.target_tool} là ảnh tĩnh, nhưng lại có chunk_size_sec. Dữ liệu này sẽ bị bỏ qua.`);
      }
      break;
  }

  // --- 3. KIỂM TRA SEED & REF ---
  if (pkg.seed < 0) {
    warnings.push("LOG: Seed bị âm, AI sẽ bỏ qua seed này và sinh random.");
  }

  return {
    pass: errors.length === 0,
    errors,
    warnings
  };
}
