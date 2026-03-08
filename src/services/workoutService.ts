/**
 * Centralized workout logging and retrieval service.
 * Decouples persistence logic from UI components.
 */

import type { WorkoutLog } from "@/lib/workoutData";
import { setLastCompletedDay, setWeightOverride } from "@/lib/trainer-logic";

const LOGS_KEY = "workoutLogs";

export function getWorkoutLogs(): WorkoutLog[] {
  const raw = localStorage.getItem(LOGS_KEY);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Log a completed workout and persist weight overrides
 * so that adjustments carry into future sessions.
 */
export function logWorkout(log: WorkoutLog): void {
  const logs = getWorkoutLogs();
  logs.unshift(log);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  setLastCompletedDay(log.dayId);

  // Persist per-exercise weight overrides for progression tracking
  log.exercises.forEach((ex) => {
    if (ex.weight > 0) {
      setWeightOverride(ex.id, ex.weight);
    }
  });
}

export { getNextRotation } from "@/lib/trainer-logic";

export function clearWorkoutLogs(): void {
  localStorage.removeItem(LOGS_KEY);
  localStorage.removeItem("lastCompletedDay");
}
