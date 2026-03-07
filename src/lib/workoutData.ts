export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  unit: string;
  cue: string;
  perHand?: boolean;
}

export interface WorkoutDay {
  id: number;
  name: string;
  muscleGroups: string[];
  exercises: Exercise[];
}

export interface WorkoutLog {
  id: string;
  dayId: number;
  dayName: string;
  date: string;
  exercises: Exercise[];
}

export interface UserProfile {
  name: string;
  height: string;
  weight: string;
  age: number;
  objective: string;
  experience: string;
  units: string;
  weeklyGoal: string;
  restTimer: string;
}

export const USER_PROFILE: UserProfile = {
  name: "CC",
  height: "5' 9\"",
  weight: "150 lbs",
  age: 27,
  objective: "Muscle Growth",
  experience: "Intermediate",
  units: "Imperial",
  weeklyGoal: "3x a week",
  restTimer: "45s - 1m 30s",
};

export const WORKOUT_DAYS: WorkoutDay[] = [
  {
    id: 1,
    name: "Chest & Triceps",
    muscleGroups: ["Chest", "Triceps"],
    exercises: [
      { id: "inc-bench", name: "Incline Barbell Bench Press", sets: 5, reps: 5, weight: 100, unit: "lbs", cue: "Plant feet flat, slight arch, lower bar to upper chest." },
      { id: "db-bench", name: "Flat Dumbbell Bench Press", sets: 4, reps: 8, weight: 35, unit: "lbs", cue: "Control the descent, deep stretch, squeeze pecs.", perHand: true },
      { id: "inc-fly", name: "Incline Dumbbell Fly", sets: 4, reps: 8, weight: 25, unit: "lbs", cue: "Slight bend in elbows. Open arms like hugging a barrel.", perHand: true },
      { id: "skull", name: "Lying Tricep Extension", sets: 4, reps: 8, weight: 40, unit: "lbs", cue: "Elbows pointed to ceiling, hinge only at elbows." },
      { id: "rope-ext", name: "Cable Rope Extension", sets: 4, reps: 10, weight: 17.5, unit: "lbs", cue: "Upper arms glued to sides. Pull rope apart at bottom." },
    ],
  },
  {
    id: 2,
    name: "Back & Biceps",
    muscleGroups: ["Back", "Biceps", "Abs"],
    exercises: [
      { id: "lat-pull", name: "Lat Pulldown", sets: 4, reps: 8, weight: 110, unit: "lbs", cue: "Lean slightly back, pull to upper chest, squeeze shoulder blades." },
      { id: "db-row", name: "Dumbbell Row", sets: 4, reps: 8, weight: 50, unit: "lbs", cue: "Back flat, pull dumbbell toward hip, not chest." },
      { id: "db-curl", name: "Dumbbell Curl", sets: 4, reps: 10, weight: 17.5, unit: "lbs", cue: "Supinate wrists outward at top for max contraction.", perHand: true },
      { id: "hammer", name: "Hammer Curl", sets: 4, reps: 10, weight: 17.5, unit: "lbs", cue: "Palms facing each other. Squeeze at top.", perHand: true },
      { id: "knee-tuck", name: "Hanging Knee Tuck", sets: 4, reps: 10, weight: 0, unit: "BW", cue: "Engage core, pull knees to chest without momentum." },
    ],
  },
  {
    id: 3,
    name: "Legs, Shoulders, Back",
    muscleGroups: ["Legs", "Shoulders", "Back"],
    exercises: [
      { id: "squat", name: "Barbell Squat", sets: 5, reps: 5, weight: 125, unit: "lbs", cue: "Chest up, brace core, hips back like sitting in chair." },
      { id: "ohp", name: "Barbell Shoulder Press", sets: 5, reps: 5, weight: 70, unit: "lbs", cue: "Brace glutes and core. Press bar straight up, lock out." },
      { id: "db-shoulder", name: "Seated DB Shoulder Press", sets: 4, reps: 8, weight: 25, unit: "lbs", cue: "Lower to ear level, press up without clanking.", perHand: true },
      { id: "lunge", name: "DB Backwards Lunge", sets: 4, reps: 5, weight: 0, unit: "BW", cue: "Step back, drop back knee straight down, front shin vertical." },
      { id: "cable-hip", name: "Cable Hip Extension", sets: 4, reps: 8, weight: 0, unit: "Mod", cue: "Ankle cuff, leg straight, squeeze glute pulling leg back." },
    ],
  },
];

export function getNextRotation(): number {
  const last = localStorage.getItem("lastCompletedDay");
  if (!last) return 1;
  const lastDay = parseInt(last, 10);
  return lastDay >= 3 ? 1 : lastDay + 1;
}

export function logWorkout(log: WorkoutLog) {
  const logs = getWorkoutLogs();
  logs.unshift(log);
  localStorage.setItem("workoutLogs", JSON.stringify(logs));
  localStorage.setItem("lastCompletedDay", String(log.dayId));
}

export function getWorkoutLogs(): WorkoutLog[] {
  const raw = localStorage.getItem("workoutLogs");
  return raw ? JSON.parse(raw) : [];
}

export function adjustWeight(weight: number, direction: "up" | "down"): number {
  if (weight === 0) return 0;
  const factor = direction === "up" ? 1.05 : 0.9;
  return Math.round(weight * factor * 2) / 2; // round to nearest 0.5
}
