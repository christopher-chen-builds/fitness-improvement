/**
 * Centralized workout logging and retrieval service.
 * Decouples persistence logic from UI components.
 */

import type { WorkoutLog } from "@/lib/workoutData";

const LOGS_KEY = "workoutLogs";
const LAST_DAY_KEY = "lastCompletedDay";

export function getWorkoutLogs(): WorkoutLog[] {
  const raw = localStorage.getItem(LOGS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function logWorkout(log: WorkoutLog): void {
  const logs = getWorkoutLogs();
  logs.unshift(log);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  localStorage.setItem(LAST_DAY_KEY, String(log.dayId));
}

export function getNextRotation(): number {
  const last = localStorage.getItem(LAST_DAY_KEY);
  if (!last) return 1;
  const lastDay = parseInt(last, 10);
  return lastDay >= 3 ? 1 : lastDay + 1;
}

export function clearWorkoutLogs(): void {
  localStorage.removeItem(LOGS_KEY);
  localStorage.removeItem(LAST_DAY_KEY);
}
