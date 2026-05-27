import type { ShotRuntime } from '@/types/shot-runtime';

export function hydrateShotsWithScreenplay(shots: ShotRuntime[], screenplayText: string): ShotRuntime[] {
  const normalizedText = screenplayText.toLowerCase();

  const hasMina = /mina/i.test(screenplayText);
  const hasRiceCooker = normalizedText.includes('nồi cơm');
  const hasAlley = normalizedText.includes('hẻm');
  const hasDisassembly = normalizedText.includes('tháo');

  const characterIds = hasMina ? ['MINA-01'] : [];
  const outfitLockRef = hasMina ? 'mina_mechanic_jacket_red' : '';
  const behaviorLock = hasMina ? 'lầm lì, tập trung' : '';
  const propState = hasRiceCooker ? 'Nồi cơm điện rỉ sét, đang bị tháo nắp' : '';
  const environment = hasAlley ? 'Hẻm sau nhà máy, mưa rả rích' : '';
  const action = hasDisassembly ? 'Tháo nắp đáy, khựng lại khi thấy bảng mạch' : '';
  const gaze = 'Nhìn chằm chằm, tập trung';

  return shots.map((shot) => {
    const isInsert = shot.A_Identity.shot_type === 'INSERT';
    const subject = isInsert && hasRiceCooker
      ? 'Cận cảnh đôi tay và tua vít'
      : hasMina
        ? 'MINA-01, wearing mina_mechanic_jacket_red'
        : '';

    return {
      ...shot,
      B_Narrative: {
        ...shot.B_Narrative,
        beat: shot.B_Narrative.beat || 'screenplay_hydrated',
        narrative_intent: subject
          ? `${subject}. ${action || 'Thiết lập hành động từ kịch bản.'}`
          : shot.B_Narrative.narrative_intent,
      },
      D_Frames: {
        start_frame: {
          ...shot.D_Frames.start_frame,
          description: environment || shot.D_Frames.start_frame.description,
          character_pose: isInsert ? 'Cận tay thao tác với tua vít' : 'Mina cúi xuống bàn làm việc',
          gaze,
          hand_action: hasDisassembly ? 'Đang tháo nắp đáy bằng tua vít' : shot.D_Frames.start_frame.hand_action,
          prop_state: propState,
        },
        end_frame: {
          ...shot.D_Frames.end_frame,
          description: hasRiceCooker ? 'Bảng mạch đỏ lộ ra bên trong nồi cơm' : shot.D_Frames.end_frame.description,
          character_pose: isInsert ? 'Tay khựng lại trên linh kiện' : 'Mina khựng lại',
          gaze,
          hand_action: hasDisassembly ? 'Khựng lại giữa thao tác tháo' : shot.D_Frames.end_frame.hand_action,
          prop_state: propState,
        },
      },
      E_Motion: {
        ...shot.E_Motion,
        main_action: action || shot.E_Motion.main_action,
        movement_start: hasDisassembly ? 'Đưa tua vít vào nắp đáy' : shot.E_Motion.movement_start,
        movement_middle: hasDisassembly ? 'Cạy nắp, bảng mạch bắt đầu lộ ra' : shot.E_Motion.movement_middle,
        movement_end: hasDisassembly ? 'Khựng lại khi thấy bảng mạch đỏ' : shot.E_Motion.movement_end,
        micro_action: hasMina ? 'Mím môi, chớp mắt chậm' : shot.E_Motion.micro_action,
      },
      H_Spatial: {
        ...shot.H_Spatial,
        env_id: hasAlley ? 'ALLEY_WORKSHOP' : shot.H_Spatial.env_id,
        location: environment || shot.H_Spatial.location,
        planes_fg: hasRiceCooker ? 'Tua vít, mép bàn rỉ sét' : shot.H_Spatial.planes_fg,
        planes_mg: hasMina ? 'Mina và nồi cơm điện' : shot.H_Spatial.planes_mg,
        planes_bg: hasAlley ? 'Hẻm tối, mưa trên mái tôn' : shot.H_Spatial.planes_bg,
      },
      I_Character: {
        ...shot.I_Character,
        character_ids: characterIds,
        outfit_lock_ref: outfitLockRef,
        signature_prop: hasMina ? 'kính bảo hộ trán' : shot.I_Character.signature_prop,
        behavior_lock: behaviorLock,
      },
      J_Props: {
        ...shot.J_Props,
        required_props: hasRiceCooker ? ['rice_cooker_broken', 'screwdriver'] : shot.J_Props.required_props,
        prop_positions: hasRiceCooker ? 'nồi cơm trên bàn, tua vít trong tay' : shot.J_Props.prop_positions,
        prop_arc_note: hasRiceCooker ? 'Nồi cơm mở ra, lộ bảng mạch đỏ' : shot.J_Props.prop_arc_note,
      },
    };
  });
}
