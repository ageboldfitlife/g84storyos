import OpenAI from 'openai';
import { NextResponse } from 'next/server';
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

interface HydrateRequestBody {
  screenplayText?: string;
  shots?: ShotRuntime[];
}

const SYSTEM_PROMPT = `You are a Data Hydrator for a film studio.
Based on the provided Screenplay Text, analyze each skeleton shot and return a strict JSON object with a "shots" array.
For each shot, fill these fields: shot_id, subject, action, pose, gaze, prop_state, environment, lighting, camera, start_frame_prompt, end_frame_prompt, motion_intent.
All field values MUST be 100% English.
The start_frame_prompt must describe the static image at the first second of the shot.
The end_frame_prompt must describe the static image at the final second of the shot.
The motion_intent must describe the movement, pacing, and emotional transition connecting the two frames.
IMPORTANT: You must infer and CREATE COMPLETELY NEW values for environment, lighting, and camera based on the screenplay. NEVER leave these fields empty and never rely on default skeleton values. If the screenplay describes silent darkness, lighting must be "pitch black, single warm light source" and must not mention "Neon Noir", "red/blue neon", or any inherited default look.
Do not add markdown. Do not add explanation. Return only JSON.`;

function isConfiguredApiKey(apiKey: string | undefined): apiKey is string {
  return Boolean(apiKey && apiKey.trim() && apiKey !== 'your-openai-api-key-here');
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HydrateRequestBody;
    const screenplayText = body.screenplayText?.trim();
    const shots = body.shots ?? [];

    if (!screenplayText) {
      return NextResponse.json({ error: 'screenplayText is required' }, { status: 400 });
    }

    if (!Array.isArray(shots) || shots.length === 0) {
      return NextResponse.json({ error: 'shots array is required' }, { status: 400 });
    }

    if (!isConfiguredApiKey(process.env.OPENAI_API_KEY)) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const shotBrief = shots.map((shot) => ({
      shot_id: shot.A_Identity.shot_id,
      shot_type: shot.A_Identity.shot_type,
      position_in_pattern: shot.C_PatternRef.position_in_pattern,
      allowed_duration_sec: shot.F_EditorHandles.duration_target_sec,
    }));

    const completion = await openai.chat.completions.create({
      model: 'gpt-5.4-mini',
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'hydrated_shot_runtime_motion_layers',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              shots: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    shot_id: { type: 'string' },
                    subject: { type: 'string' },
                    action: { type: 'string' },
                    pose: { type: 'string' },
                    gaze: { type: 'string' },
                    prop_state: { type: 'string' },
                    environment: { type: 'string' },
                    lighting: { type: 'string' },
                    camera: { type: 'string' },
                    start_frame_prompt: { type: 'string' },
                    end_frame_prompt: { type: 'string' },
                    motion_intent: { type: 'string' },
                  },
                  required: [
                    'shot_id',
                    'subject',
                    'action',
                    'pose',
                    'gaze',
                    'prop_state',
                    'environment',
                    'lighting',
                    'camera',
                    'start_frame_prompt',
                    'end_frame_prompt',
                    'motion_intent',
                  ],
                },
              },
            },
            required: ['shots'],
          },
        },
      },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            screenplayText,
            shots: shotBrief,
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'OpenAI returned an empty response' }, { status: 502 });
    }

    const parsed = JSON.parse(content) as { shots?: HydratedShotPayload[] };
    return NextResponse.json({ shots: parsed.shots ?? [] });
  } catch (error: any) {
    console.error("🔥 LỖI OPENAI API NÈ SẾP:", error?.response?.data || error.message || error);

    const message = error?.response?.data?.error?.message || error.message || 'Unknown hydrate error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
