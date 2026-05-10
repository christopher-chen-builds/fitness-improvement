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
      { id: "decline-db-bench", name: "Decline Dumbbell Bench Press", sets: 4, reps: 10, weight: 35, unit: "lbs", cue: "Slight decline, press up and in to bias lower chest.", perHand: true },
      { id: "neutral-db-bench", name: "Neutral-Grip Dumbbell Bench Press", sets: 4, reps: 10, weight: 35, unit: "lbs", cue: "Palms facing each other; shoulder-friendly press.", perHand: true },
      { id: "low-high-fly", name: "Low-to-High Cable Fly", sets: 4, reps: 12, weight: 15, unit: "lbs", cue: "Cables low; sweep handles up and in to upper chest.", perHand: true },
      { id: "pushup-db", name: "Push-Up on Dumbbells", sets: 4, reps: 12, weight: 0, unit: "BW", cue: "Hands on DBs to drop deeper; rigid plank, full ROM." },
    ],
  },
  {
    category: "Back",
    exercises: [
      { id: "pullups", name: "Pull-ups", sets: 4, reps: 6, weight: 0, unit: "BW", cue: "Dead hang, pull chin over bar, squeeze lats at top." },
      { id: "seated-row", name: "Seated Cable Rows", sets: 4, reps: 10, weight: 70, unit: "lbs", cue: "Pull handle to lower chest, squeeze shoulder blades together." },
      { id: "face-pulls", name: "Face Pulls", sets: 4, reps: 12, weight: 20, unit: "lbs", cue: "Pull rope to face, externally rotate shoulders at end." },
      { id: "straight-arm-pull", name: "Straight-Arm Pulldowns", sets: 4, reps: 10, weight: 30, unit: "lbs", cue: "Keep arms straight, pull bar to thighs, squeeze lats." },
      { id: "wide-lat-pull", name: "Wide-Grip Lat Pulldown", sets: 4, reps: 10, weight: 80, unit: "lbs", cue: "Wide overhand grip; pull to upper chest, flare lats." },
      { id: "close-lat-pull", name: "Close-Grip Lat Pulldown", sets: 4, reps: 10, weight: 80, unit: "lbs", cue: "Neutral V-bar; pull low to upper chest, elbows to ribs." },
      { id: "single-cable-row", name: "Single-Arm Cable Row", sets: 4, reps: 10, weight: 35, unit: "lbs", cue: "Half-kneel; row one arm at a time toward your hip.", perHand: true },
      { id: "chest-supp-row", name: "Chest-Supported Row", sets: 4, reps: 10, weight: 60, unit: "lbs", cue: "Chest on pad; pull elbows back, pause at top." },
      { id: "inverted-row", name: "Inverted Rows", sets: 4, reps: 10, weight: 0, unit: "BW", cue: "Bar at hip height; row chest to bar, body straight." },
      { id: "rev-cable-fly", name: "Reverse Cable Fly", sets: 4, reps: 12, weight: 15, unit: "lbs", cue: "Light weight; arms slightly bent, pull out and back.", perHand: true },
    ],
  },
  {
    category: "Shoulders",
    exercises: [
      { id: "lat-raise", name: "Dumbbell Lateral Raises", sets: 4, reps: 12, weight: 12.5, unit: "lbs", cue: "Slight bend in elbows, raise to shoulder height, control descent.", perHand: true },
      { id: "front-raise", name: "Front Raises", sets: 4, reps: 10, weight: 12.5, unit: "lbs", cue: "Alternate arms, raise to eye level, don't swing.", perHand: true },
      { id: "arnold", name: "Arnold Press", sets: 4, reps: 8, weight: 25, unit: "lbs", cue: "Start palms facing you, rotate as you press overhead.", perHand: true },
      { id: "rev-pec-deck", name: "Reverse Pec-Deck", sets: 4, reps: 12, weight: 40, unit: "lbs", cue: "Squeeze rear delts, hold peak contraction for a beat." },
      { id: "push-press", name: "Push Press", sets: 4, reps: 6, weight: 75, unit: "lbs", cue: "Small leg drive into an overhead press for heavier loads." },
      { id: "single-db-press", name: "Single-Arm Dumbbell Shoulder Press", sets: 4, reps: 10, weight: 25, unit: "lbs", cue: "Standing; brace core to resist leaning, press straight up.", perHand: true },
      { id: "cable-lat-raise", name: "Cable Lateral Raise", sets: 4, reps: 12, weight: 10, unit: "lbs", cue: "Cable behind low; raise out to side, slight elbow bend.", perHand: true },
      { id: "inc-rev-fly", name: "Dumbbell Reverse Fly (Incline)", sets: 4, reps: 12, weight: 12.5, unit: "lbs", cue: "Chest on incline bench; raise DBs out to hit rear delts.", perHand: true },
    ],
  },
  {
    category: "Legs",
    exercises: [
      { id: "leg-press", name: "Leg Press", sets: 4, reps: 10, weight: 180, unit: "lbs", cue: "Feet shoulder width, lower platform until 90° knee bend." },
      { id: "rdl", name: "Romanian Deadlifts", sets: 4, reps: 8, weight: 95, unit: "lbs", cue: "Hinge at hips, keep bar close to shins, feel hamstring stretch." },
      { id: "leg-ext", name: "Leg Extensions", sets: 4, reps: 12, weight: 60, unit: "lbs", cue: "Squeeze quads at top, slow controlled descent." },
      { id: "ham-curl", name: "Hamstring Curls", sets: 4, reps: 10, weight: 50, unit: "lbs", cue: "Curl pad toward glutes, squeeze at top." },
      { id: "walking-lunge", name: "Walking Lunges", sets: 4, reps: 10, weight: 25, unit: "lbs", cue: "Long strides; controlled knee track, alternate legs.", perHand: true },
      { id: "bulgarian-split", name: "Bulgarian Split Squat", sets: 4, reps: 8, weight: 25, unit: "lbs", cue: "Back foot elevated; rear knee straight down, front leg works.", perHand: true },
      { id: "goblet-squat", name: "Goblet Squat", sets: 4, reps: 10, weight: 35, unit: "lbs", cue: "DB at chest; stay upright, sit between knees." },
      { id: "step-up", name: "Step-Ups", sets: 4, reps: 10, weight: 25, unit: "lbs", cue: "Drive through full foot on top; control eccentric.", perHand: true },
      { id: "hip-thrust", name: "Hip Thrust", sets: 4, reps: 10, weight: 95, unit: "lbs", cue: "Upper back on bench; drive hips up, squeeze glutes." },
      { id: "single-rdl", name: "Single-Leg Romanian Deadlift", sets: 4, reps: 8, weight: 20, unit: "lbs", cue: "Soft knee; hinge on one leg, keep hips square.", perHand: true },
    ],
  },
  {
    category: "Biceps",
    exercises: [
      { id: "preacher", name: "Preacher Curls", sets: 4, reps: 10, weight: 30, unit: "lbs", cue: "Press armpits into pad, lower fully, curl to top." },
      { id: "cable-curl", name: "Cable Bicep Curls", sets: 4, reps: 10, weight: 25, unit: "lbs", cue: "Constant tension, squeeze at top, slow negative." },
      { id: "inc-db-curl", name: "Incline Dumbbell Curl", sets: 4, reps: 10, weight: 20, unit: "lbs", cue: "Lie back on incline; let arms hang, curl without swinging.", perHand: true },
      { id: "conc-curl", name: "Concentration Curl", sets: 4, reps: 10, weight: 20, unit: "lbs", cue: "Elbow braced on inner thigh; curl up and squeeze.", perHand: true },
      { id: "cross-hammer", name: "Alternating Cross-Body Hammer Curl", sets: 4, reps: 10, weight: 25, unit: "lbs", cue: "Hammer grip, curl across body to opposite pec.", perHand: true },
      { id: "ez-curl", name: "EZ-Bar Curl", sets: 4, reps: 10, weight: 45, unit: "lbs", cue: "Elbows pinned to sides, full range, no swing." },
    ],
  },
  {
    category: "Triceps",
    exercises: [
      { id: "oh-tri-ext", name: "Overhead Tricep Extensions", sets: 4, reps: 10, weight: 25, unit: "lbs", cue: "Hold dumbbell overhead, lower behind head, extend fully." },
      { id: "tri-kickback", name: "Tricep Kickbacks", sets: 4, reps: 10, weight: 12.5, unit: "lbs", cue: "Hinge forward, extend arm fully behind you, squeeze tricep.", perHand: true },
      { id: "close-bench", name: "Close-Grip Bench Press", sets: 4, reps: 8, weight: 95, unit: "lbs", cue: "Grip just inside shoulders; elbows tucked, press to lockout." },
      { id: "inc-tri-ext", name: "Incline Dumbbell Tricep Extension", sets: 4, reps: 10, weight: 20, unit: "lbs", cue: "On incline; lower DBs behind head, then extend." },
      { id: "single-oh-tri", name: "Single-Arm Overhead Tricep Extension", sets: 4, reps: 10, weight: 15, unit: "lbs", cue: "One arm; elbow close to head, full stretch and lockout.", perHand: true },
      { id: "bench-dip", name: "Bench Dips", sets: 4, reps: 12, weight: 0, unit: "BW", cue: "Hands on bench behind; bend elbows straight back." },
      { id: "cable-kickback", name: "Cable Kickback", sets: 4, reps: 12, weight: 15, unit: "lbs", cue: "Hinge forward; upper arm parallel, extend elbow fully.", perHand: true },
    ],
  },
  {
    category: "Abs",
    exercises: [
      { id: "hang-leg-raise", name: "Hanging Leg Raise", sets: 4, reps: 10, weight: 0, unit: "BW", cue: "Straight legs; slow controlled lift, no swinging." },
      { id: "hang-knee-twist", name: "Hanging Knee Raise with Twist", sets: 4, reps: 10, weight: 0, unit: "BW", cue: "Alternate knees toward each side to hit obliques." },
      { id: "captains-chair", name: "Captain's Chair Knee Raise", sets: 4, reps: 12, weight: 0, unit: "BW", cue: "Drive knees up, back pressed into the pad." },
      { id: "plank", name: "Plank", sets: 3, reps: 45, weight: 0, unit: "BW", cue: "Forearms down; ribs down, glutes tight, straight line." },
      { id: "side-plank", name: "Side Plank", sets: 3, reps: 30, weight: 0, unit: "BW", cue: "Stack feet; elbow under shoulder, hips high.", perHand: true },
    ],
  },
  {
    category: "Glutes",
    exercises: [
      { id: "hip-thrust", name: "Hip Thrust", sets: 4, reps: 10, weight: 95, unit: "lbs", cue: "Upper back on bench; drive hips up, squeeze glutes." },
      { id: "cable-hip", name: "Cable Hip Extension", sets: 4, reps: 12, weight: 30, unit: "lbs", cue: "Drive heel back, squeeze glute at top.", perHand: true },
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
  "knee-tuck": "Abs",
  // Day 3: Legs, Shoulders, Back
  "squat": "Legs",
  "ohp": "Shoulders",
  "db-shoulder": "Shoulders",
  "lunge": "Legs",
  "cable-hip": "Legs",
};
