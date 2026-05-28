import type { ShotRuntime } from '@/types/shot-runtime';

interface HydratedShotPayload {
  shot_id: string;
  subject?: string;
  action?: string;
  pose?: string;
  gaze?: string;
  prop_state?: string;
  environment?: string;
  lighting?: string;
  camera?: string;
  start_frame_prompt?: string;
  end_frame_prompt?: string;
  motion_intent?: string;
}

interface ParsedScreenplayBlock {
  shotNumber: number;
  envId: string;
  layers: Record<string, string>;
  fallbackText: string;
}

function isFilled(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeLayerName(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function firstFilled(...values: Array<string | undefined>): string {
  return values.find((value) => isFilled(value))?.trim() ?? '';
}

function parseScreenplayBlocks(screenplayText: string): ParsedScreenplayBlock[] {
  return screenplayText
    .split(/(?=SHOT\s+\d+\s+\u2014\s+ENV_[A-Z0-9_]+)/g)
    .map((block) => block.trim())
    .filter(Boolean)
    .reduce<ParsedScreenplayBlock[]>((blocks, block) => {
      const metadataMatch = block.match(/SHOT\s+(\d+)\s+\u2014\s+(ENV_[A-Z0-9_]+)/i);

      if (!metadataMatch) {
        return blocks;
      }

      const layers = block.split(/\r?\n/).reduce<Record<string, string>>((acc, line) => {
        const layerMatch = line.match(/^\[\d+\]\s*([^:]+):\s*(.+)$/);
        if (!layerMatch) return acc;

        acc[normalizeLayerName(layerMatch[1])] = layerMatch[2].trim();
        return acc;
      }, {});

      blocks.push({
        shotNumber: Number(metadataMatch[1]),
        envId: metadataMatch[2].toUpperCase(),
        layers,
        fallbackText: block
          .split(/\r?\n/)
          .filter((line) => !/^SHOT\s+\d+/i.test(line))
          .join(' ')
          .trim(),
      });

      return blocks;
    }, []);
}

function buildStructuredPatches(
  shots: ShotRuntime[],
  screenplayText: string
): Map<string, HydratedShotPayload> {
  const blocksByShotNumber = new Map(
    parseScreenplayBlocks(screenplayText).map((block) => [block.shotNumber, block])
  );

  return new Map<string, HydratedShotPayload>(
    shots.map<[string, HydratedShotPayload]>((shot) => {
      const shotNumber = shot.C_PatternRef.position_in_pattern ?? shot.A_Identity.shot_index;
      const block = blocksByShotNumber.get(shotNumber);

      if (!block) {
        return [shot.A_Identity.shot_id, { shot_id: shot.A_Identity.shot_id }];
      }

      const layers = block.layers;
      const actionLayer = firstFilled(layers.ACTION_LAYER, layers.ACTION, layers.BLOCKING);
      const cameraPhysics = firstFilled(layers.CAMERA_PHYSICS, layers.CAMERA);
      const movementPath = firstFilled(layers.MOVEMENT_PATH, layers.MOVEMENT);
      const cameraAndLight = firstFilled(layers.CAMERA_LIGHT, layers.CAMERA_AND_LIGHT, layers.LIGHTING);
      const continuityLock = firstFilled(layers.CONTINUITY_LOCK, layers.CONTINUITY);
      const emotionCue = firstFilled(layers.EMOTION_CUE, layers.EMOTION);
      const subject = firstFilled(layers.CHARACTER, layers.SUBJECT);
      const propState = firstFilled(layers.PROP, layers.PROPS);
      const fallbackText = block.fallbackText;

      const startFramePrompt = firstFilled(
        actionLayer,
        subject && actionLayer ? `${subject}. ${actionLayer}` : undefined,
        fallbackText
      );
      const motionIntent = firstFilled(movementPath, cameraPhysics, actionLayer);
      const endFramePrompt = firstFilled(continuityLock, emotionCue, actionLayer);

      return [
        shot.A_Identity.shot_id,
        {
          shot_id: shot.A_Identity.shot_id,
          subject,
          action: actionLayer,
          pose: actionLayer,
          gaze: emotionCue,
          prop_state: propState,
          environment: block.envId,
          lighting: cameraAndLight,
          camera: cameraPhysics,
          start_frame_prompt: startFramePrompt,
          end_frame_prompt: endFramePrompt,
          motion_intent: motionIntent,
        },
      ];
    })
  );
}

function mergePayload(
  base: HydratedShotPayload | undefined,
  override: HydratedShotPayload | undefined
): HydratedShotPayload | undefined {
  if (!base) return override;
  if (!override) return base;

  const merged: HydratedShotPayload = { ...base };

  for (const [key, value] of Object.entries(override) as Array<[keyof HydratedShotPayload, string | undefined]>) {
    if (typeof value === 'string' && value.trim()) {
      merged[key] = value;
    }
  }

  return merged;
}

function mergeHydrationPatch(shot: ShotRuntime, patch: HydratedShotPayload | undefined): ShotRuntime {
  if (!patch) return shot;

  const subject = patch.subject?.trim() ?? '';
  const aiEnvironment = isFilled(patch.environment) ? patch.environment.trim() : '';
  const aiLighting = isFilled(patch.lighting) ? patch.lighting.trim() : '';
  const aiCamera = isFilled(patch.camera) ? patch.camera.trim() : '';
  const startFramePrompt = isFilled(patch.start_frame_prompt) ? patch.start_frame_prompt.trim() : '';
  const endFramePrompt = isFilled(patch.end_frame_prompt) ? patch.end_frame_prompt.trim() : '';
  const motionIntent = isFilled(patch.motion_intent) ? patch.motion_intent.trim() : '';
  const characterIds = subject.includes('MINA-01') ? ['MINA-01'] : shot.I_Character.character_ids;

  return {
    ...shot,
    B_Narrative: {
      ...shot.B_Narrative,
      narrative_intent: isFilled(patch.action)
        ? patch.action
        : shot.B_Narrative.narrative_intent,
    },
    D_Frames: {
      start_frame: {
        ...shot.D_Frames.start_frame,
        description: startFramePrompt || aiEnvironment || shot.D_Frames.start_frame.description,
        character_pose: isFilled(patch.pose)
          ? patch.pose
          : shot.D_Frames.start_frame.character_pose,
        gaze: isFilled(patch.gaze)
          ? patch.gaze
          : shot.D_Frames.start_frame.gaze,
        hand_action: isFilled(patch.action)
          ? patch.action
          : shot.D_Frames.start_frame.hand_action,
        prop_state: isFilled(patch.prop_state)
          ? patch.prop_state
          : shot.D_Frames.start_frame.prop_state,
      },
      end_frame: {
        ...shot.D_Frames.end_frame,
        description: endFramePrompt || aiEnvironment || shot.D_Frames.end_frame.description,
        character_pose: isFilled(patch.pose)
          ? patch.pose
          : shot.D_Frames.end_frame.character_pose,
        gaze: isFilled(patch.gaze)
          ? patch.gaze
          : shot.D_Frames.end_frame.gaze,
        hand_action: isFilled(patch.action)
          ? patch.action
          : shot.D_Frames.end_frame.hand_action,
        prop_state: isFilled(patch.prop_state)
          ? patch.prop_state
          : shot.D_Frames.end_frame.prop_state,
      },
    },
    E_Motion: {
      ...shot.E_Motion,
      main_action: motionIntent || (isFilled(patch.action) ? patch.action : shot.E_Motion.main_action),
      movement_start: startFramePrompt || (isFilled(patch.action) ? patch.action : shot.E_Motion.movement_start),
      movement_middle: motionIntent || (isFilled(patch.action) ? patch.action : shot.E_Motion.movement_middle),
      movement_end: endFramePrompt || (isFilled(patch.action) ? patch.action : shot.E_Motion.movement_end),
      start_frame_prompt: startFramePrompt || shot.E_Motion.start_frame_prompt,
      end_frame_prompt: endFramePrompt || shot.E_Motion.end_frame_prompt,
      motion_intent: motionIntent || shot.E_Motion.motion_intent,
    },
    G_Camera: {
      ...shot.G_Camera,
      camera_node: aiCamera ? 'ai_hydrated_camera' : shot.G_Camera.camera_node,
      camera_framing: aiCamera || shot.G_Camera.camera_framing,
      lens: aiCamera ? '' : shot.G_Camera.lens,
      height: aiCamera ? '' : shot.G_Camera.height,
      angle: aiCamera ? '' : shot.G_Camera.angle,
      movement: aiCamera ? '' : shot.G_Camera.movement,
      depth_of_field: aiCamera ? '' : shot.G_Camera.depth_of_field,
      camera_intent: aiCamera || shot.G_Camera.camera_intent,
    },
    H_Spatial: {
      ...shot.H_Spatial,
      env_id: aiEnvironment ? 'AI_HYDRATED_ENV' : shot.H_Spatial.env_id,
      location: aiEnvironment || shot.H_Spatial.location,
      planes_fg: aiEnvironment ? '' : shot.H_Spatial.planes_fg,
      planes_mg: aiEnvironment ? '' : shot.H_Spatial.planes_mg,
      planes_bg: aiEnvironment || shot.H_Spatial.planes_bg,
      topology_rules: aiEnvironment ? '' : shot.H_Spatial.topology_rules,
      negative_space_rules: aiEnvironment ? '' : shot.H_Spatial.negative_space_rules,
    },
    I_Character: {
      ...shot.I_Character,
      character_ids: characterIds,
      behavior_lock: isFilled(subject) ? subject : shot.I_Character.behavior_lock,
    },
    J_Props: {
      ...shot.J_Props,
      prop_arc_note: isFilled(patch.prop_state) ? patch.prop_state : shot.J_Props.prop_arc_note,
      prop_positions: isFilled(patch.prop_state) ? patch.prop_state : shot.J_Props.prop_positions,
    },
    K_Style: {
      ...shot.K_Style,
      override_lighting: aiLighting || shot.K_Style.override_lighting,
      override_look: aiLighting ? 'screenplay-specific look, no inherited default style' : shot.K_Style.override_look,
    },
  };
}

export async function hydrateShotsWithScreenplay(
  shots: ShotRuntime[],
  screenplayText: string
): Promise<ShotRuntime[]> {
  const structuredPatchesByShotId = buildStructuredPatches(shots, screenplayText);

  try {
    const response = await fetch('/api/hydrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        screenplayText,
        shots,
      }),
    });

    if (!response.ok) {
      throw new Error(`Hydrate API failed with status ${response.status}`);
    }

    const data = (await response.json()) as { shots?: HydratedShotPayload[] };
    const apiPatchesByShotId = new Map(
      (data.shots ?? []).map((patch) => [patch.shot_id, patch])
    );

    return shots.map((shot) =>
      mergeHydrationPatch(
        shot,
        mergePayload(
          structuredPatchesByShotId.get(shot.A_Identity.shot_id),
          apiPatchesByShotId.get(shot.A_Identity.shot_id)
        )
      )
    );
  } catch (error) {
    console.error('Hydration API failed, using structured screenplay layers where available:', error);
    return shots.map((shot) => {
      const structuredShot = mergeHydrationPatch(
        shot,
        structuredPatchesByShotId.get(shot.A_Identity.shot_id)
      );

      return {
        ...structuredShot,
        Q_RenderState: {
          ...structuredShot.Q_RenderState,
          export_status: 'DRAFT',
        },
        R_QAState: {
          ...structuredShot.R_QAState,
          issues: [
            ...structuredShot.R_QAState.issues,
            'Hydration API failed; structured screenplay layers were used as fallback.',
          ],
          fix_instructions: [
            ...structuredShot.R_QAState.fix_instructions,
            'Review structured layer hydration before production export.',
          ],
        },
      };
    });
  }
}
