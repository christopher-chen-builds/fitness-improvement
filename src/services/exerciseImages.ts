/**
 * Static exercise image lookup.
 * Reads image_url from the `exercises` table — no runtime AI generation.
 * Cached in-memory + localStorage to minimize DB hits.
 */
import { supabase } from "@/integrations/supabase/client";

const CACHE_PREFIX = "exercise-img-url-";
const memCache = new Map<string, string | null>();
let allLoaded = false;
let loadPromise: Promise<void> | null = null;

function readCache(id: string): string | null | undefined {
  if (memCache.has(id)) return memCache.get(id);
  try {
    const v = localStorage.getItem(CACHE_PREFIX + id);
    if (v) {
      memCache.set(id, v);
      return v;
    }
  } catch {}
  return undefined;
}

function writeCache(id: string, url: string | null) {
  memCache.set(id, url);
  try {
    if (url) localStorage.setItem(CACHE_PREFIX + id, url);
  } catch {}
}

async function loadAll(): Promise<void> {
  if (allLoaded) return;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    const { data, error } = await supabase.from("exercises").select("id, image_url");
    if (!error && data) {
      for (const row of data) writeCache(row.id, row.image_url);
      allLoaded = true;
    }
  })();
  return loadPromise;
}

/** Get a stored exercise image URL. Never calls AI generation. */
export async function getExerciseImageUrl(exerciseId: string): Promise<string | null> {
  const cached = readCache(exerciseId);
  if (cached !== undefined) return cached;
  await loadAll();
  return readCache(exerciseId) ?? null;
}

/** Synchronous cache check (used for first paint). */
export function getCachedExerciseImage(exerciseId: string): string | null {
  const v = readCache(exerciseId);
  return v ?? null;
}

/** Backwards-compat shim — no longer triggers generation, just looks up the stored URL. */
export async function generateExerciseImage(exerciseId: string): Promise<string | null> {
  return getExerciseImageUrl(exerciseId);
}

/** Clear caches (used after admin re-seed). */
export function clearExerciseImageCache() {
  memCache.clear();
  allLoaded = false;
  loadPromise = null;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(CACHE_PREFIX)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {}
}
