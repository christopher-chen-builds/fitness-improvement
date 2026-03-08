import { useState, useCallback, useEffect } from "react";
import { Dumbbell, Calendar, User, Play, ChevronUp, ChevronDown, Check, MoreHorizontal, SlidersHorizontal, Plus, Star, Clock, Target, BarChart3, Timer, Dice5, Zap, Weight, Ruler, Globe, Wrench, Heart, Shield } from "lucide-react";
import WorkoutCalendar from "@/components/WorkoutCalendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  WORKOUT_DAYS,
  USER_PROFILE,
  type Exercise,
  type WorkoutDay,
} from "@/lib/workoutData";
import { adjustWeight, applyWeightOverrides } from "@/lib/trainer-logic";
import { logWorkout as logWorkoutService, getWorkoutLogs, getNextRotation } from "@/services/workoutService";
import { generateExerciseImage, getCachedExerciseImage } from "@/services/exerciseImages";

type Tab = "workout" | "planning" | "profile";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("workout");
  const [activeWorkout, setActiveWorkout] = useState(false);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [sessionExercises, setSessionExercises] = useState<Exercise[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const nextRotation = getNextRotation();
  const currentDay = WORKOUT_DAYS.find((d) => d.id === nextRotation)!;

  const startWorkout = useCallback(() => {
    const withOverrides = applyWeightOverrides(currentDay.exercises.map((e) => ({ ...e })));
    setSessionExercises(withOverrides);
    setActiveWorkout(true);
    setCurrentExerciseIdx(0);
    setCurrentSet(1);
  }, [currentDay]);

  const adjustCurrentWeight = (dir: "up" | "down") => {
    setSessionExercises((prev) =>
      prev.map((ex, i) =>
        i === currentExerciseIdx ? { ...ex, weight: adjustWeight(ex.weight, dir) } : ex
      )
    );
  };

  const completeSet = () => {
    const ex = sessionExercises[currentExerciseIdx];
    if (currentSet < ex.sets) {
      setCurrentSet((s) => s + 1);
    } else if (currentExerciseIdx < sessionExercises.length - 1) {
      setCurrentExerciseIdx((i) => i + 1);
      setCurrentSet(1);
    } else {
      setShowLogModal(true);
    }
  };

  const confirmLog = () => {
    logWorkoutService({
      id: Date.now().toString(),
      dayId: currentDay.id,
      dayName: currentDay.name,
      date: new Date().toISOString(),
      exercises: sessionExercises,
    });
    setShowLogModal(false);
    setActiveWorkout(false);
    setCurrentExerciseIdx(0);
    setCurrentSet(1);
  };

  const formatWeight = (ex: Exercise) => {
    if (ex.weight === 0) return `${ex.reps} reps × ${ex.sets} sets`;
    return `${ex.weight} ${ex.unit}${ex.perHand ? "/hand" : ""} × ${ex.reps} reps × ${ex.sets} sets`;
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground max-w-md mx-auto relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-center py-4 px-4 relative shrink-0">
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-foreground">Precision</span>
            <span className="text-primary">Fit</span>
          </h1>
          <p className="text-xs text-primary font-semibold tracking-wider">AI TRAINER</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-24">
        {activeTab === "workout" && !activeWorkout && (
          <WorkoutPreview day={currentDay} formatWeight={formatWeight} onStart={startWorkout} />
        )}
        {activeTab === "workout" && activeWorkout && (
          <ActiveWorkout
            exercises={sessionExercises}
            currentIdx={currentExerciseIdx}
            currentSet={currentSet}
            formatWeight={formatWeight}
            onAdjust={adjustCurrentWeight}
            onComplete={completeSet}
          />
        )}
        {activeTab === "planning" && <PlanningTab />}
        {activeTab === "profile" && <ProfileTab />}
      </main>

      {/* Bottom Nav */}
      <nav className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around py-2 pb-4">
          {([
            { id: "workout" as Tab, icon: Dumbbell, label: "Workout" },
            { id: "planning" as Tab, icon: Calendar, label: "Planning" },
            { id: "profile" as Tab, icon: User, label: "Profile" },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Log Modal */}
      <Dialog open={showLogModal} onOpenChange={setShowLogModal}>
        <DialogContent className="bg-card border-border max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Log Workout</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Great session! You completed <span className="text-primary font-semibold">{currentDay.name}</span>. Save this workout to track your progress?
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowLogModal(false); setActiveWorkout(false); }}>
              Discard
            </Button>
            <Button onClick={confirmLog} className="bg-primary text-primary-foreground">
              Log Workout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ─── Workout Preview ─── */
function WorkoutPreview({ day, formatWeight, onStart }: { day: WorkoutDay; formatWeight: (e: Exercise) => string; onStart: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 bg-secondary rounded-xl py-3 text-sm font-medium text-secondary-foreground">
          <SlidersHorizontal className="h-4 w-4" /> Equipment
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 bg-secondary rounded-xl py-3 text-sm font-medium text-secondary-foreground">
          <Plus className="h-4 w-4" /> Muscle Groups
        </button>
      </div>

      <h2 className="text-lg font-bold">{day.exercises.length} Exercises — {day.name}</h2>

      <div className="space-y-2">
        {day.exercises.map((ex) => (
          <ExerciseCard key={ex.id} exercise={ex} formatWeight={formatWeight} />
        ))}
      </div>

      <Button onClick={onStart} className="w-full bg-primary text-primary-foreground py-6 rounded-2xl text-base font-semibold gap-2">
        <Play className="h-5 w-5 fill-current" /> Start Workout
      </Button>

      {/* History Calendar */}
      <div className="space-y-2 pt-2">
        <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">History</p>
        <WorkoutCalendar />
      </div>
    </div>
  );
}

/* ─── Exercise Card ─── */
function ExerciseCard({ exercise, formatWeight }: { exercise: Exercise; formatWeight: (e: Exercise) => string }) {
  const [imgSrc, setImgSrc] = useState<string | null>(
    getCachedExerciseImage(exercise.id)
  );
  const [loading, setLoading] = useState(!imgSrc);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!imgSrc && !failed) {
      setLoading(true);
      generateExerciseImage(exercise.id, exercise.name).then((url) => {
        if (url) {
          setImgSrc(url);
        } else {
          setFailed(true);
        }
        setLoading(false);
      });
    }
  }, [exercise.id, exercise.name, imgSrc, failed]);

  return (
    <div className="flex items-center bg-card rounded-xl p-3 gap-4">
      <div className="w-16 h-16 bg-secondary rounded-lg shrink-0 overflow-hidden">
        {imgSrc && !failed ? (
          <img
            src={imgSrc}
            alt={exercise.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : loading ? (
          <div className="w-full h-full flex items-center justify-center animate-pulse">
            <Dumbbell className="h-7 w-7 text-muted-foreground/40" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Dumbbell className="h-7 w-7 text-primary/70" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">{exercise.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{formatWeight(exercise)}</p>
        <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate italic">{exercise.cue}</p>
      </div>
      <button className="text-muted-foreground shrink-0">
        <MoreHorizontal className="h-5 w-5" />
      </button>
    </div>
  );
}

/* ─── Active Workout ─── */
function ActiveWorkout({
  exercises, currentIdx, currentSet, formatWeight, onAdjust, onComplete
}: {
  exercises: Exercise[];
  currentIdx: number;
  currentSet: number;
  formatWeight: (e: Exercise) => string;
  onAdjust: (d: "up" | "down") => void;
  onComplete: () => void;
}) {
  const ex = exercises[currentIdx];
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Exercise {currentIdx + 1} of {exercises.length}</p>
        <h2 className="text-2xl font-bold text-foreground">{ex.name}</h2>
        <p className="text-primary font-semibold">Set {currentSet} of {ex.sets}</p>
      </div>

      <div className="bg-card rounded-2xl p-6 text-center space-y-4">
        <p className="text-4xl font-extrabold text-foreground">
          {ex.weight > 0 ? `${ex.weight} ${ex.unit}` : "Bodyweight"}
        </p>
        <p className="text-muted-foreground text-sm">{ex.reps} reps</p>

        {ex.weight > 0 && (
          <div className="flex gap-3 justify-center">
            <Button variant="outline" size="sm" onClick={() => onAdjust("down")} className="gap-1 border-border text-muted-foreground hover:text-foreground">
              <ChevronDown className="h-4 w-4" /> Turn it Down
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAdjust("up")} className="gap-1 border-border text-muted-foreground hover:text-foreground">
              <ChevronUp className="h-4 w-4" /> Turn it Up
            </Button>
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Form Cue</p>
        <p className="text-sm text-foreground leading-relaxed">{ex.cue}</p>
      </div>

      <Button onClick={onComplete} className="w-full bg-primary text-primary-foreground py-6 rounded-2xl text-base font-semibold gap-2">
        <Check className="h-5 w-5" /> Complete Set
      </Button>

      {/* Progress */}
      <div className="flex gap-1.5 justify-center">
        {exercises.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${i < currentIdx ? "w-6 bg-primary" : i === currentIdx ? "w-6 bg-primary/60" : "w-3 bg-secondary"}`} />
        ))}
      </div>
    </div>
  );
}

/* ─── Planning Tab ─── */
function PlanningTab() {
  return (
    <div className="space-y-6">
      {WORKOUT_DAYS.map((day) => (
        <div key={day.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">Day {day.id}</h3>
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {day.muscleGroups.map((g) => (
              <Badge key={g} className="bg-secondary text-secondary-foreground border-0 rounded-full px-4 py-1.5 text-sm font-medium">{g}</Badge>
            ))}
          </div>
        </div>
      ))}

      <p className="text-primary text-sm font-medium">+ Day 4</p>

      <div className="space-y-1 pt-4">
        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-3">Training</p>
        {([
          { icon: Calendar, label: "Routine", value: "3 Day Classic" },
          { icon: Clock, label: "Duration", value: "40 min" },
          { icon: Star, label: "Objective", value: USER_PROFILE.objective },
          { icon: SlidersHorizontal, label: "Equipment", value: "Edit" },
          { icon: Zap, label: "Rep Ranges", value: "Normal" },
          { icon: Target, label: "Weekly Goal", value: USER_PROFILE.weeklyGoal },
          { icon: BarChart3, label: "Experience", value: USER_PROFILE.experience },
          { icon: Timer, label: "Rest Timer", value: USER_PROFILE.restTimer },
          { icon: Dice5, label: "Randomness", value: "50%" },
        ]).map((item) => (
          <div key={item.label} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <item.icon className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground">{item.label}</span>
            </div>
            <span className="text-sm text-primary font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Profile Tab ─── */
function ProfileTab() {
  const logs = getWorkoutLogs();
  const nextRotation = getNextRotation();
  const nextDay = WORKOUT_DAYS.find((d) => d.id === nextRotation)!;

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-5 text-center space-y-3">
        <div className="w-16 h-16 bg-secondary rounded-full mx-auto flex items-center justify-center">
          <User className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-lg font-bold">{USER_PROFILE.name}</h2>
        <p className="text-xs text-muted-foreground">{USER_PROFILE.objective} • {USER_PROFILE.experience}</p>
      </div>

      <div className="space-y-1">
        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-3">You</p>
        {([
          { icon: Weight, label: "Weight", value: USER_PROFILE.weight },
          { icon: Ruler, label: "Height", value: USER_PROFILE.height },
          { icon: Globe, label: "Units", value: USER_PROFILE.units },
          { icon: User, label: "Age", value: String(USER_PROFILE.age) },
          { icon: Wrench, label: "Gender", value: "Male" },
        ]).map((item) => (
          <div key={item.label} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <item.icon className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground">{item.label}</span>
            </div>
            <span className="text-sm text-primary font-medium">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Consistency Calendar */}
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Consistency</p>
        <WorkoutCalendar />
      </div>

      {logs.length > 0 && (
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs uppercase tracking-wider">Recent Workouts</p>
          {logs.slice(0, 5).map((log) => (
            <div key={log.id} className="bg-card rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-foreground">{log.dayName}</p>
                <p className="text-xs text-muted-foreground">{new Date(log.date).toLocaleDateString()}</p>
              </div>
              <Check className="h-4 w-4 text-primary" />
            </div>
          ))}
        </div>
      )}

      {/* Next Up Widget */}
      <div className="bg-card rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Next Up</p>
          <p className="text-sm font-semibold text-primary mt-1">Next: {nextDay.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{nextDay.muscleGroups.join(", ")}</p>
        </div>
        <Dumbbell className="h-6 w-6 text-primary/50" />
      </div>
    </div>
  );
}

export default Index;
