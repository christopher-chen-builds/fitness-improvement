/**
 * Centralized workout logging and retrieval service.
 * Persists to both localStorage (offline) and database (history).
 */

import type { WorkoutLog } from "@/lib/workoutData";
import { setLastCompletedDay, setWeightOverride } from "@/lib/trainer-logic";
import { supabase } from "@/integrations/supabase/client";

const LOGS_KEY = "workoutLogs";

export function getWorkoutLogs(): WorkoutLog[] {
  const raw = localStorage.getItem(LOGS_KEY);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Log a completed workout: persist locally + to database.
 */
export async function logWorkout(log: WorkoutLog): Promise<void> {
  // 1. Local persistence (instant, offline-first)
  const logs = getWorkoutLogs();
  logs.unshift(log);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  setLastCompletedDay(log.dayId);

  // 2. Persist per-exercise weight overrides
  const weightFlags: Record<string, string> = {};
  log.exercises.forEach((ex) => {
    if (ex.weight > 0) {
      setWeightOverride(ex.id, ex.weight);
    }
  });

  // 3. Database persistence (async, best-effort)
  try {
    const muscleGroups = getMuscleGroupsForDay(log.dayId);
    const { data: workout, error: wErr } = await supabase
      .from("workouts")
      .insert({
        day_id: log.dayId,
        day_name: log.dayName,
        date: log.date,
        muscle_groups: muscleGroups,
      })
      .select("id")
      .single();

    if (wErr || !workout) {
      console.warn("Failed to persist workout to DB:", wErr);
      return;
    }

    const exerciseLogs = log.exercises.map((ex) => ({
      workout_id: workout.id,
      exercise_id: ex.id,
      exercise_name: ex.name,
      sets_completed: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      unit: ex.unit,
      per_hand: ex.perHand ?? false,
      weight_change_flag: weightFlags[ex.id] || null,
    }));

    const { error: eErr } = await supabase.from("exercise_logs").insert(exerciseLogs);
    if (eErr) console.warn("Failed to persist exercise logs:", eErr);
  } catch (err) {
    console.warn("DB persistence error:", err);
  }
}

function getMuscleGroupsForDay(dayId: number): string[] {
  // Inline import avoided — use the static data directly
  const DAYS: Record<number, string[]> = {
    1: ["Chest", "Triceps"],
    2: ["Back", "Biceps", "Abs"],
    3: ["Legs", "Shoulders", "Back"],
  };
  return DAYS[dayId] ?? [];
}

export { getNextRotation } from "@/lib/trainer-logic";

export function clearWorkoutLogs(): void {
  localStorage.removeItem(LOGS_KEY);
  localStorage.removeItem("lastCompletedDay");
}

/**
 * Fetch workout history from the database with exercise details.
 */
export async function getWorkoutHistory() {
  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("*, exercise_logs(*)")
    .order("date", { ascending: false })
    .limit(50);

  if (error) {
    console.warn("Failed to fetch workout history:", error);
    return [];
  }
  return workouts ?? [];
}
