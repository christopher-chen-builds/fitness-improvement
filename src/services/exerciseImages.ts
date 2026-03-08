/**
 * AI-powered exercise image generation service.
 * Uses Lovable AI gateway via edge function.
 * Caches results in localStorage to minimize API calls.
 */

import { supabase } from "@/integrations/supabase/client";

const CACHE_PREFIX = "exercise-img-";

// In-flight request deduplication
const pendingRequests = new Map<string, Promise<string | null>>();

/**
 * Get a cached image URL from localStorage.
 */
function getCachedImage(exerciseId: string): string | null {
  try {
    return localStorage.getItem(CACHE_PREFIX + exerciseId);
  } catch {
    return null;
  }
}

/**
 * Save an image URL to localStorage cache.
 */
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

      // Cache for future use
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
