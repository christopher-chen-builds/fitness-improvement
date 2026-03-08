/**
 * Trainer Logic Module
 * --------------------
 * All workout rotation, weight progression, and difficulty adjustment
 * logic lives here — fully decoupled from UI components.
 */

// ─── Weight Adjustment ───

const WEIGHT_INCREMENT_LBS = 5; // flat increment per spec (2.5–5 lbs range)
const WEIGHT_OVERRIDES_KEY = "weightOverrides"; // persisted per-exercise overrides

/**
 * Adjust weight by a flat ±5 lbs (or ±2.5 for lighter lifts ≤ 20 lbs).
 * Returns the new weight, rounded to the nearest 0.5.
 */
export function adjustWeight(
  weight: number,
  direction: "up" | "down"
): number {
  if (weight === 0) return 0;
  const increment = weight <= 20 ? 2.5 : WEIGHT_INCREMENT_LBS;
  const raw = direction === "up" ? weight + increment : weight - increment;
  return Math.max(0, Math.round(raw * 2) / 2);
}

/**
 * Get persisted weight overrides for exercises.
 * These track weight changes from difficulty feedback across sessions.
 */
export function getWeightOverrides(): Record<string, number> {
  try {
    const raw = localStorage.getItem(WEIGHT_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Persist a weight override for a specific exercise.
 * Called when the user provides difficulty feedback ("Too Easy" / "Too Hard").
 */
export function setWeightOverride(exerciseId: string, newWeight: number): void {
  const overrides = getWeightOverrides();
  overrides[exerciseId] = newWeight;
  localStorage.setItem(WEIGHT_OVERRIDES_KEY, JSON.stringify(overrides));
}

/**
 * Apply persisted weight overrides to a list of exercises.
 * Used when loading exercises for a new session so past feedback carries forward.
 */
export function applyWeightOverrides<T extends { id: string; weight: number }>(
  exercises: T[]
): T[] {
  const overrides = getWeightOverrides();
  return exercises.map((ex) => ({
    ...ex,
    weight: overrides[ex.id] !== undefined ? overrides[ex.id] : ex.weight,
  }));
}

// ─── Rotation Logic ───

const TOTAL_ROTATIONS = 3;
const LAST_DAY_KEY = "lastCompletedDay";

/**
 * Determine the next workout rotation based on the last completed day.
 * Cycles 1 → 2 → 3 → 1 → …
 */
export function getNextRotation(): number {
  const last = localStorage.getItem(LAST_DAY_KEY);
  if (!last) return 1;
  const lastDay = parseInt(last, 10);
  if (isNaN(lastDay) || lastDay < 1 || lastDay > TOTAL_ROTATIONS) return 1;
  return lastDay >= TOTAL_ROTATIONS ? 1 : lastDay + 1;
}

/**
 * Record the last completed rotation day.
 */
export function setLastCompletedDay(dayId: number): void {
  localStorage.setItem(LAST_DAY_KEY, String(dayId));
}
