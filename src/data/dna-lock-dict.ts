export interface DNALockConfig {
  lighting_style: string;
  key_light: string;
  color_temp: string;
  film_stock: string;
  base_model: string;
  default_loras: string[];
  negative_prompt_prefix: string;
}

export const DNALockDictionary: Record<string, DNALockConfig> = {
  "OCP1_NIGHT": {
    lighting_style: "Neon Noir, High Contrast, Cinematic",
    key_light: "Harsh directional neon (Red/Blue from off-screen)",
    color_temp: "Cool overall with aggressive warm accents (3200K - 6500K mixed)",
    film_stock: "Cinestill 800T, heavy grain, halation effect",
    base_model: "flux.1-dev",
    default_loras: ["g84_cyberpunk_v1", "g84_neon_contrast"],
    negative_prompt_prefix: "daylight, soft lighting, flat, bright, sunny, clean, smooth, overexposed",
  }
};
