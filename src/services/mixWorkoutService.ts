/**
 * Mix Workout Service
 * -------------------
 * Calls the mix-workout edge function to generate AI-powered workout variations.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Exercise, WorkoutDay } from "@/lib/workoutData";
import { MIXIN_REPOSITORY } from "@/lib/mixinData";

/**
 * Generate a mixed workout by calling the AI edge function.
 * Falls back to the original baseline if the AI call fails.
 */
export async function generateMixedWorkout(day: WorkoutDay): Promise<Exercise[]> {
  // Filter mix-in repo to relevant muscle groups
  const relevantMixins = MIXIN_REPOSITORY.filter((cat) =>
    day.muscleGroups.some(
      (mg) =>
        cat.category.toLowerCase() === mg.toLowerCase() ||
        (mg === "Triceps" && cat.category === "Arms") ||
        (mg === "Biceps" && cat.category === "Arms") ||
        (mg === "Abs" && cat.category === "Arms")
    )
  );

  try {
    const { data, error } = await supabase.functions.invoke("mix-workout", {
      body: {
        baselineExercises: day.exercises,
        mixinRepository: relevantMixins,
        muscleGroups: day.muscleGroups,
        dayName: day.name,
      },
    });

    if (error) {
      console.warn("Mix workout edge function error:", error);
      return day.exercises;
    }

    if (data?.fallback || data?.error) {
      console.warn("AI fallback:", data.error);
      return day.exercises;
    }

    if (data?.exercises && Array.isArray(data.exercises)) {
      // Validate each exercise has required fields
      const valid = data.exercises.every(
        (ex: any) => ex.id && ex.name && ex.sets && ex.reps !== undefined
      );
      if (valid) return data.exercises as Exercise[];
    }

    return day.exercises;
  } catch (err) {
    console.warn("Mix workout service error:", err);
    return day.exercises;
  }
}
