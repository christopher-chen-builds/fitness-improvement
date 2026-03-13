/**
 * Centralized configuration service.
 * All environment-dependent values are pulled from import.meta.env here.
 * When self-hosting, set these in your .env file at the project root.
 *
 * Required env vars:
 *   VITE_SUPABASE_URL            — Your Supabase project URL
 *   VITE_SUPABASE_PUBLISHABLE_KEY — Your Supabase anon/public key
 *
 * Optional:
 *   VITE_AI_IMAGE_ENABLED        — Set to "false" to disable AI image generation
 */

export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL as string,
    anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
  },
  features: {
    aiImages: import.meta.env.VITE_AI_IMAGE_ENABLED !== "false",
  },
} as const;

/**
 * Validate that required config values are present.
 * Call this at app startup to fail fast with a helpful message.
 */
export function validateConfig(): void {
  const missing: string[] = [];
  if (!config.supabase.url) missing.push("VITE_SUPABASE_URL");
  if (!config.supabase.anonKey) missing.push("VITE_SUPABASE_PUBLISHABLE_KEY");
  if (missing.length > 0) {
    console.error(
      `[PrecisionFit] Missing required environment variables: ${missing.join(", ")}. ` +
      `Create a .env file in the project root with these values.`
    );
  }
}
