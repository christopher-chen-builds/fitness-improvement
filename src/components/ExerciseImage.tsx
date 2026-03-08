/**
 * Shared ExerciseImage component.
 * Uses the cached AI image pipeline — no redundant API calls.
 */
import { useState, useEffect } from "react";
import { Dumbbell } from "lucide-react";
import { generateExerciseImage, getCachedExerciseImage } from "@/services/exerciseImages";

interface Props {
  exerciseId: string;
  exerciseName: string;
  className?: string;
  size?: "sm" | "lg";
}

export default function ExerciseImage({ exerciseId, exerciseName, className = "", size = "sm" }: Props) {
  const [imgSrc, setImgSrc] = useState<string | null>(getCachedExerciseImage(exerciseId));
  const [loading, setLoading] = useState(!imgSrc);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!imgSrc && !failed) {
      setLoading(true);
      generateExerciseImage(exerciseId, exerciseName).then((url) => {
        if (url) setImgSrc(url);
        else setFailed(true);
        setLoading(false);
      });
    }
  }, [exerciseId, exerciseName, imgSrc, failed]);

  const sizeClasses = size === "lg" ? "w-full h-48" : "w-16 h-16";
  const iconSize = size === "lg" ? "h-12 w-12" : "h-7 w-7";

  return (
    <div className={`bg-secondary rounded-lg overflow-hidden ${sizeClasses} ${className}`}>
      {imgSrc && !failed ? (
        <img src={imgSrc} alt={exerciseName} className="w-full h-full object-cover" loading="lazy" />
      ) : loading ? (
        <div className="w-full h-full flex items-center justify-center animate-pulse">
          <Dumbbell className={`${iconSize} text-muted-foreground/40`} />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-card">
          <Dumbbell className={`${iconSize} text-primary/70`} />
        </div>
      )}
    </div>
  );
}
