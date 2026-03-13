/**
 * AI-powered exercise image generation service.
 * Uses a backend edge function (configurable AI endpoint).
 * Caches results in localStorage to minimize API calls.
 */

import { supabase } from "@/integrations/supabase/client";
import { config } from "@/lib/config";

const CACHE_PREFIX = "exercise-img-";

// In-flight request deduplication
const pendingRequests = new Map<string, Promise<string | null>>();

function getCachedImage(exerciseId: string): string | null {
  try {
    return localStorage.getItem(CACHE_PREFIX + exerciseId);
  } catch {
    return null;
  }
}

function setCachedImage(exerciseId: string, url: string): void {
  try {
    localStorage.setItem(CACHE_PREFIX + exerciseId, url);
  } catch {
    // Storage full — silently fail
  }
}

/**
 * Generate an exercise image via the AI edge function.
 * Returns the base64 data URL on success, or null on failure.
 * Results are cached in localStorage.
 */
export async function generateExerciseImage(
  exerciseId: string,
  exerciseName: string
): Promise<string | null> {
  // Skip if AI images are disabled via env var
  if (!config.features.aiImages) return null;

  // 1. Check localStorage cache
  const cached = getCachedImage(exerciseId);
  if (cached) return cached;

  // 2. Deduplicate in-flight requests
  if (pendingRequests.has(exerciseId)) {
    return pendingRequests.get(exerciseId)!;
  }

  const request = (async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-exercise-image",
        { body: { exerciseName } }
      );

      if (error || !data?.imageUrl) {
        console.warn(`Image generation failed for ${exerciseName}:`, error);
        return null;
      }

      setCachedImage(exerciseId, data.imageUrl);
      return data.imageUrl;
    } catch (err) {
      console.warn(`Image generation error for ${exerciseName}:`, err);
      return null;
    } finally {
      pendingRequests.delete(exerciseId);
    }
  })();

  pendingRequests.set(exerciseId, request);
  return request;
}

/**
 * Synchronous check for cached image (no API call).
 */
export function getCachedExerciseImage(exerciseId: string): string | null {
  return getCachedImage(exerciseId);
}
