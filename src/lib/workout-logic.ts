/**
 * Workout Logic Module
 * --------------------
 * Equipment substitution logic and rolling-average progression engine.
 * Fully decoupled from UI — importable for self-hosted deployment.
 */

import type { Exercise } from "@/lib/workoutData";
import { getWorkoutHistory } from "@/services/workoutService";
import { setWeightOverride, getWeightOverrides } from "@/lib/trainer-logic";

// ─── Equipment Checklist ───

const EQUIPMENT_KEY = "equipmentChecklist";

export const ALL_EQUIPMENT = [
  "Barbell",
  "Dumbbells",
  "Adjustable Bench",
  "Cable Machine",
  "Pull-up Bar",
  "Squat Rack",
  "Leg Press",
] as const;

export type EquipmentItem = (typeof ALL_EQUIPMENT)[number];

/** Map exercise IDs to required equipment */
const EXERCISE_EQUIPMENT: Record<string, EquipmentItem[]> = {
  "inc-bench": ["Barbell", "Adjustable Bench"],
  "db-bench": ["Dumbbells", "Adjustable Bench"],
  "inc-fly": ["Dumbbells", "Adjustable Bench"],
  "skull": ["Barbell", "Adjustable Bench"],
  "rope-ext": ["Cable Machine"],
  "lat-pull": ["Cable Machine"],
  "db-row": ["Dumbbells"],
  "db-curl": ["Dumbbells"],
  "hammer": ["Dumbbells"],
  "knee-tuck": ["Pull-up Bar"],
  "squat": ["Barbell", "Squat Rack"],
  "ohp": ["Barbell"],
  "db-shoulder": ["Dumbbells", "Adjustable Bench"],
  "lunge": [],
  "cable-hip": ["Cable Machine"],
};

/** Substitution map: exerciseId → replacement exercise when equipment missing */
const SUBSTITUTIONS: Record<string, Exercise> = {
  "rope-ext": {
    id: "db-overhead-ext",
    name: "Dumbbell Overhead Extension",
    sets: 4, reps: 10, weight: 20, unit: "lbs",
    cue: "Hold one dumbbell overhead with both hands, lower behind head, extend.",
  },
  "lat-pull": {
    id: "band-pulldown",
    name: "Resistance Band Pulldown",
    sets: 4, reps: 10, weight: 0, unit: "BW",
    cue: "Anchor band overhead, pull down to chest squeezing lats.",
  },
  "knee-tuck": {
    id: "lying-knee-tuck",
    name: "Lying Knee Tuck",
    sets: 4, reps: 12, weight: 0, unit: "BW",
    cue: "Lie flat, pull knees to chest engaging lower abs.",
  },
  "cable-hip": {
    id: "glute-bridge",
    name: "Glute Bridge",
    sets: 4, reps: 10, weight: 0, unit: "BW",
    cue: "Feet flat, drive hips up squeezing glutes at top.",
  },
  "inc-bench": {
    id: "db-floor-press",
    name: "Dumbbell Floor Press",
    sets: 5, reps: 5, weight: 35, unit: "lbs",
    cue: "Lie on floor, press dumbbells up, elbows touch floor each rep.",
    perHand: true,
  },
  "db-bench": {
    id: "pushup-weighted",
    name: "Push-Up (Weighted)",
    sets: 4, reps: 10, weight: 0, unit: "BW",
    cue: "Maintain plank, full ROM, chest to floor.",
  },
  "inc-fly": {
    id: "floor-fly",
    name: "Floor Dumbbell Fly",
    sets: 4, reps: 8, weight: 20, unit: "lbs",
    cue: "Lie on floor, open arms wide, slight elbow bend.",
    perHand: true,
  },
  "skull": {
    id: "dips",
    name: "Bench Dips",
    sets: 4, reps: 10, weight: 0, unit: "BW",
    cue: "Hands on bench edge, lower body by bending elbows to 90°.",
  },
  "squat": {
    id: "db-goblet-squat",
    name: "Dumbbell Goblet Squat",
    sets: 5, reps: 8, weight: 40, unit: "lbs",
    cue: "Hold dumbbell at chest, squat deep, chest up.",
  },
  "db-shoulder": {
    id: "standing-db-press",
    name: "Standing DB Shoulder Press",
    sets: 4, reps: 8, weight: 25, unit: "lbs",
    cue: "Brace core, press overhead, control descent.",
    perHand: true,
  },
};

export function getEquipmentChecklist(): Record<EquipmentItem, boolean> {
  try {
    const raw = localStorage.getItem(EQUIPMENT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Default: all checked
  const defaults: Record<string, boolean> = {};
  ALL_EQUIPMENT.forEach((e) => (defaults[e] = true));
  return defaults as Record<EquipmentItem, boolean>;
}

export function setEquipmentChecklist(checklist: Record<EquipmentItem, boolean>): void {
  localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(checklist));
}

/** Check if an exercise can be performed with current equipment */
function isExerciseAvailable(exerciseId: string, checklist: Record<EquipmentItem, boolean>): boolean {
  const required = EXERCISE_EQUIPMENT[exerciseId] ?? [];
  return required.every((eq) => checklist[eq]);
}

/** Apply equipment substitutions to a list of exercises */
export function applyEquipmentSubstitutions(
  exercises: Exercise[],
  checklist: Record<EquipmentItem, boolean>
): Exercise[] {
  return exercises.map((ex) => {
    if (isExerciseAvailable(ex.id, checklist)) return ex;
    const sub = SUBSTITUTIONS[ex.id];
    return sub ? { ...sub } : ex; // fallback to original if no sub defined
  });
}

// ─── Rolling Average Progression Engine ───

const STRUGGLE_FLAGS_KEY = "struggleFlags";

interface SessionData {
  exerciseId: string;
  weight: number;
  weightChangeFlag: string | null;
}

/**
 * Calculate 3-session rolling average and apply automatic progression.
 * Call after logging a workout to update baselines.
 */
export async function evaluateProgression(): Promise<void> {
  try {
    const history = await getWorkoutHistory();
    if (history.length < 3) return;

    // Group exercise logs across sessions
    const exerciseHistory: Record<string, SessionData[]> = {};
    for (const workout of history) {
      const logs = (workout as any).exercise_logs ?? [];
      for (const log of logs) {
        if (!exerciseHistory[log.exercise_id]) {
          exerciseHistory[log.exercise_id] = [];
        }
        exerciseHistory[log.exercise_id].push({
          exerciseId: log.exercise_id,
          weight: log.weight,
          weightChangeFlag: log.weight_change_flag,
        });
      }
    }

    const overrides = getWeightOverrides();
    const struggleFlags = getStruggleFlags();

    for (const [exerciseId, sessions] of Object.entries(exerciseHistory)) {
      const recent = sessions.slice(0, 3); // most recent 3
      if (recent.length < 3) continue;

      // Count "Turn it Down" struggle flags in last 3 sessions
      const downCount = recent.filter(
        (s) => s.weightChangeFlag === "down" || s.weightChangeFlag === "decreased"
      ).length;

      if (downCount >= 2) {
        // Struggle detected: reduce baseline by 10%
        const currentWeight = overrides[exerciseId] ?? recent[0].weight;
        if (currentWeight > 0) {
          const reduced = Math.round(currentWeight * 0.9 * 2) / 2;
          setWeightOverride(exerciseId, reduced);
          struggleFlags[exerciseId] = (struggleFlags[exerciseId] ?? 0) + 1;
        }
      } else {
        // Check if RPE is consistently low (user keeps turning it up)
        const upCount = recent.filter(
          (s) => s.weightChangeFlag === "up" || s.weightChangeFlag === "increased"
        ).length;

        if (upCount >= 2) {
          // Auto-increase: +5 lbs
          const currentWeight = overrides[exerciseId] ?? recent[0].weight;
          if (currentWeight > 0) {
            const increased = currentWeight + 5;
            setWeightOverride(exerciseId, increased);
          }
        }
      }
    }

    setStruggleFlags(struggleFlags);
  } catch (err) {
    console.warn("Progression evaluation error:", err);
  }
}

function getStruggleFlags(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STRUGGLE_FLAGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStruggleFlags(flags: Record<string, number>): void {
  localStorage.setItem(STRUGGLE_FLAGS_KEY, JSON.stringify(flags));
}
