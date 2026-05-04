/**
 * Mix-In Repository
 * -----------------
 * Variation exercises grouped by muscle category.
 * The AI edge function references this data to substitute
 * 1-2 baseline exercises with contextually appropriate alternatives.
 */

import type { Exercise } from "@/lib/workoutData";

export interface MixInCategory {
  category: string;
  exercises: Exercise[];
}

export const MIXIN_REPOSITORY: MixInCategory[] = [
  {
    category: "Chest",
    exercises: [
      { id: "pushups", name: "Push-ups (Weighted)", sets: 4, reps: 12, weight: 0, unit: "BW", cue: "Full ROM, chest to floor, maintain rigid plank." },
      { id: "cable-cross", name: "Cable Crossovers", sets: 4, reps: 10, weight: 15, unit: "lbs", cue: "Step forward, cross hands at bottom, squeeze chest.", perHand: true },
      { id: "machine-press", name: "Machine Chest Press", sets: 4, reps: 10, weight: 80, unit: "lbs", cue: "Plant feet, push handles forward, control the return." },
      { id: "dips", name: "Dips", sets: 4, reps: 8, weight: 0, unit: "BW", cue: "Lean slightly forward, elbows back, lower until stretch in chest." },
    ],
  },
  {
    category: "Back",
    exercises: [
      { id: "pullups", name: "Pull-ups", sets: 4, reps: 6, weight: 0, unit: "BW", cue: "Dead hang, pull chin over bar, squeeze lats at top." },
      { id: "seated-row", name: "Seated Cable Rows", sets: 4, reps: 10, weight: 70, unit: "lbs", cue: "Pull handle to lower chest, squeeze shoulder blades together." },
      { id: "face-pulls", name: "Face Pulls", sets: 4, reps: 12, weight: 20, unit: "lbs", cue: "Pull rope to face, externally rotate shoulders at end." },
      { id: "straight-arm-pull", name: "Straight-Arm Pulldowns", sets: 4, reps: 10, weight: 30, unit: "lbs", cue: "Keep arms straight, pull bar to thighs, squeeze lats." },
    ],
  },
  {
    category: "Shoulders",
    exercises: [
      { id: "lat-raise", name: "Dumbbell Lateral Raises", sets: 4, reps: 12, weight: 12.5, unit: "lbs", cue: "Slight bend in elbows, raise to shoulder height, control descent.", perHand: true },
      { id: "front-raise", name: "Front Raises", sets: 4, reps: 10, weight: 12.5, unit: "lbs", cue: "Alternate arms, raise to eye level, don't swing.", perHand: true },
      { id: "arnold", name: "Arnold Press", sets: 4, reps: 8, weight: 25, unit: "lbs", cue: "Start palms facing you, rotate as you press overhead.", perHand: true },
      { id: "rev-pec-deck", name: "Reverse Pec-Deck", sets: 4, reps: 12, weight: 40, unit: "lbs", cue: "Squeeze rear delts, hold peak contraction for a beat." },
    ],
  },
  {
    category: "Legs",
    exercises: [
      { id: "leg-press", name: "Leg Press", sets: 4, reps: 10, weight: 180, unit: "lbs", cue: "Feet shoulder width, lower platform until 90° knee bend." },
      { id: "rdl", name: "Romanian Deadlifts", sets: 4, reps: 8, weight: 95, unit: "lbs", cue: "Hinge at hips, keep bar close to shins, feel hamstring stretch." },
      { id: "leg-ext", name: "Leg Extensions", sets: 4, reps: 12, weight: 60, unit: "lbs", cue: "Squeeze quads at top, slow controlled descent." },
      { id: "ham-curl", name: "Hamstring Curls", sets: 4, reps: 10, weight: 50, unit: "lbs", cue: "Curl pad toward glutes, squeeze at top." },
    ],
  },
  {
    category: "Biceps",
    exercises: [
      { id: "preacher", name: "Preacher Curls", sets: 4, reps: 10, weight: 30, unit: "lbs", cue: "Press armpits into pad, lower fully, curl to top." },
      { id: "cable-curl", name: "Cable Bicep Curls", sets: 4, reps: 10, weight: 25, unit: "lbs", cue: "Constant tension, squeeze at top, slow negative." },
    ],
  },
  {
    category: "Triceps",
    exercises: [
      { id: "oh-tri-ext", name: "Overhead Tricep Extensions", sets: 4, reps: 10, weight: 25, unit: "lbs", cue: "Hold dumbbell overhead, lower behind head, extend fully." },
      { id: "tri-kickback", name: "Tricep Kickbacks", sets: 4, reps: 10, weight: 12.5, unit: "lbs", cue: "Hinge forward, extend arm fully behind you, squeeze tricep.", perHand: true },
    ],
  },
];

/**
 * Maps each baseline exercise ID to the mix-in category it can be swapped with.
 * This ensures swaps stay within the correct muscle group per exercise.
 */
export const EXERCISE_CATEGORY_MAP: Record<string, string> = {
  // Day 1: Chest & Triceps
  "inc-bench": "Chest",
  "db-bench": "Chest",
  "inc-fly": "Chest",
  "skull": "Triceps",
  "rope-ext": "Triceps",
  // Day 2: Back & Biceps
  "lat-pull": "Back",
  "db-row": "Back",
  "db-curl": "Biceps",
  "hammer": "Biceps",
  "knee-tuck": "", // No swaps for abs
  // Day 3: Legs, Shoulders, Back
  "squat": "Legs",
  "ohp": "Shoulders",
  "db-shoulder": "Shoulders",
  "lunge": "Legs",
  "cable-hip": "Legs",
};
