import type { ShotRuntime, SectionR_QAState, QAStatus } from "../types/shot-runtime";

export interface QAReport {
  face: boolean | null;
  hand: boolean | null;
  outfit: boolean | null;
  prop: boolean | null;
  topology: boolean | null;
  lighting: boolean | null;
  motion: boolean | null;
  json: boolean | null;
  continuity: boolean | null;
  issues: string[];
  reviewer: string | null;
}

export function processQAResult(shot: ShotRuntime, report: QAReport): SectionR_QAState {
  let finalStatus: QAStatus = "PASS";
  const issues = [...report.issues];
  const fixInstructions: string[] = [];

  // Helper function so sánh độ gắt của Lock Level
  const evaluateCheck = (
    checkPassed: boolean | null,
    lockLevel: "STRICT" | "FLEXIBLE" | "EXEMPT",
    categoryName: string
  ) => {
    if (checkPassed === false) {
      if (lockLevel === "STRICT") {
        finalStatus = "FAIL";
        fixInstructions.push(`[BLOCK] ${categoryName} không đạt chuẩn STRICT. Bắt buộc Gen lại.`);
      } else if (lockLevel === "FLEXIBLE") {
        if (finalStatus !== "FAIL") finalStatus = "NEED_FIX";
        fixInstructions.push(`[WARNING] ${categoryName} lỗi mức FLEXIBLE. Có thể dùng tool hậu kỳ để cứu.`);
      }
      // Nếu là EXEMPT thì bỏ qua, không đánh rớt
    }
  };

  // Đánh giá dựa trên Section L (Lock Levels)
  evaluateCheck(report.face, shot.L_LockLevels.character_lock, "Face");
  evaluateCheck(report.hand, shot.L_LockLevels.character_lock, "Hand");
  evaluateCheck(report.outfit, shot.L_LockLevels.character_lock, "Outfit");
  evaluateCheck(report.prop, shot.L_LockLevels.prop_lock, "Prop");
  evaluateCheck(report.topology, shot.L_LockLevels.spatial_lock, "Topology/Spatial");

  // Ép kiểu (as) an toàn vì dna_lock chỉ có STRICT hoặc FLEXIBLE (đã exclude EXEMPT)
  evaluateCheck(report.lighting, shot.L_LockLevels.dna_lock as "STRICT" | "FLEXIBLE" | "EXEMPT", "Lighting/DNA");
  evaluateCheck(report.continuity, shot.L_LockLevels.continuity_lock, "Continuity");

  // Các lỗi đặc thù: Motion sai là vứt
  if (report.motion === false) {
    finalStatus = "FAIL";
    fixInstructions.push("[BLOCK] Motion/Action sai lệch hoàn toàn. Bắt buộc Gen lại.");
  }

  return {
    qa_status: finalStatus,
    checks: {
      face: report.face,
      hand: report.hand,
      outfit: report.outfit,
      prop: report.prop,
      topology: report.topology,
      lighting: report.lighting,
      motion: report.motion,
      json: report.json,
      continuity: report.continuity,
    },
    issues: issues,
    fix_instructions: fixInstructions,
    reviewed_at: new Date().toISOString(),
    reviewer: report.reviewer,
  };
}
