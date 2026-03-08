import { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, TrendingUp, Dumbbell, Calendar as CalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getWorkoutHistory } from "@/services/workoutService";
import { useNavigate } from "react-router-dom";

interface ExerciseLog {
  id: string;
  exercise_id: string;
  exercise_name: string;
  sets_completed: number;
  reps: number;
  weight: number;
  unit: string;
  per_hand: boolean;
  weight_change_flag: string | null;
}

interface WorkoutRecord {
  id: string;
  day_id: number;
  day_name: string;
  date: string;
  duration_minutes: number | null;
  muscle_groups: string[];
  exercise_logs: ExerciseLog[];
}

export default function History() {
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutRecord | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getWorkoutHistory().then((data) => {
      setWorkouts(data as WorkoutRecord[]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 py-4 px-4 shrink-0 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold">Workout History</h1>
          <p className="text-xs text-muted-foreground">{workouts.length} sessions logged</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Dumbbell className="h-6 w-6 text-muted-foreground animate-pulse" />
          </div>
        ) : workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <CalIcon className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No workouts logged yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Rotation</TableHead>
                  <TableHead className="text-muted-foreground">Muscles</TableHead>
                  <TableHead className="text-muted-foreground">Exercises</TableHead>
                  <TableHead className="text-muted-foreground">Progression</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workouts.map((w) => {
                  const hasProgression = w.exercise_logs?.some((e) => e.weight_change_flag);
                  return (
                    <TableRow
                      key={w.id}
                      className="border-border cursor-pointer hover:bg-card/80 transition-colors"
                      onClick={() => setSelectedWorkout(w)}
                    >
                      <TableCell className="text-sm text-foreground whitespace-nowrap">
                        {new Date(w.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-foreground">
                          R{w.day_id}: {w.day_name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {w.muscle_groups?.map((g) => (
                            <Badge
                              key={g}
                              className="bg-secondary text-secondary-foreground border-0 text-[10px] px-1.5 py-0"
                            >
                              {g}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {w.exercise_logs?.length ?? 0}
                      </TableCell>
                      <TableCell>
                        {hasProgression && (
                          <Badge className="bg-primary/20 text-primary border-0 text-[10px] gap-1">
                            <TrendingUp className="h-3 w-3" /> +5 lbs
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <Dialog open={!!selectedWorkout} onOpenChange={() => setSelectedWorkout(null)}>
        <DialogContent className="bg-card border-border max-w-md mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {selectedWorkout?.day_name} — {selectedWorkout && new Date(selectedWorkout.date).toLocaleDateString()}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedWorkout?.exercise_logs?.map((ex) => (
              <div key={ex.id} className="bg-secondary/50 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{ex.exercise_name}</p>
                  {ex.weight_change_flag && (
                    <Badge className="bg-primary/20 text-primary border-0 text-[10px]">
                      {ex.weight_change_flag}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {ex.weight > 0
                    ? `${ex.weight} ${ex.unit}${ex.per_hand ? "/hand" : ""}`
                    : "Bodyweight"}{" "}
                  × {ex.reps} reps × {ex.sets_completed} sets
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
