/**
 * Centralized exercise image service.
 * Uses hardcoded URLs for baseline exercises to conserve Unsplash API calls.
 * Falls back to Unsplash search for "Mix-In" exercises.
 */

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || "";

// High-quality placeholder images for core baseline exercises (royalty-free Unsplash URLs)
const BASELINE_IMAGES: Record<string, string> = {
  "inc-bench":
    "https://images.unsplash.com/photo-1534368786749-b63e05c92717?w=400&h=400&fit=crop&q=80",
  "db-bench":
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop&q=80",
  "inc-fly":
    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop&q=80",
  skull:
    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=400&fit=crop&q=80",
  "rope-ext":
    "https://images.unsplash.com/photo-1598971639058-a4c3e1e7e6d6?w=400&h=400&fit=crop&q=80",
  "lat-pull":
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop&q=80",
  "db-row":
    "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400&h=400&fit=crop&q=80",
  "db-curl":
    "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=400&h=400&fit=crop&q=80",
  hammer:
    "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=400&fit=crop&q=80",
  "knee-tuck":
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&q=80",
  squat:
    "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=400&fit=crop&q=80",
  ohp:
    "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&h=400&fit=crop&q=80",
  "db-shoulder":
    "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=400&fit=crop&q=80",
  lunge:
    "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=400&fit=crop&q=80",
  "cable-hip":
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=400&fit=crop&q=80",
};

// In-memory cache for dynamic fetches
const imageCache = new Map<string, string>();

/**
 * Get exercise image URL. Returns baseline image if available,
 * otherwise fetches from Unsplash (for Mix-In exercises).
 */
export async function getExerciseImage(
  exerciseId: string,
  exerciseName: string
): Promise<string> {
  // 1. Check hardcoded baselines
  if (BASELINE_IMAGES[exerciseId]) {
    return BASELINE_IMAGES[exerciseId];
  }

  // 2. Check runtime cache
  if (imageCache.has(exerciseId)) {
    return imageCache.get(exerciseId)!;
  }

  // 3. Fetch from Unsplash if key is available
  if (UNSPLASH_ACCESS_KEY) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          exerciseName + " exercise gym"
        )}&per_page=1&orientation=squarish`,
        {
          headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results?.[0]?.urls?.small) {
          const url = data.results[0].urls.small;
          imageCache.set(exerciseId, url);
          return url;
        }
      }
    } catch {
      // Fallback silently
    }
  }

  // 4. Generic fallback
  return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop&q=80";
}

/**
 * Synchronous getter for baseline images (no API call).
 * Returns URL or undefined.
 */
export function getBaselineImage(exerciseId: string): string | undefined {
  return BASELINE_IMAGES[exerciseId] || imageCache.get(exerciseId);
}
