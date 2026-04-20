/**
 * Hidden admin page for one-time exercise image seeding.
 * Route: /admin/exercise-images  (intentionally not linked from nav).
 * Requires the user to be signed in.
 *
 * NOTE: For solo use only — no role check yet. To add roles later,
 * gate this route on a `has_role(auth.uid(), 'admin')` check via a
 * future user_roles table.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Sparkles, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { clearExerciseImageCache } from "@/services/exerciseImages";

interface ExerciseRow {
  id: string;
  exercise_name: string;
  muscle_group: string;
  equipment: string | null;
  image_status: string;
  image_url: string | null;
  image_last_generated_at: string | null;
}

export default function AdminExerciseImages() {
  const [rows, setRows] = useState<ExerciseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("exercises")
      .select("id, exercise_name, muscle_group, equipment, image_status, image_url, image_last_generated_at")
      .order("muscle_group")
      .order("exercise_name");
    if (error) {
      toast({ title: "Failed to load exercises", description: error.message, variant: "destructive" });
    } else {
      setRows((data ?? []) as ExerciseRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const invokeSeed = async (
    label: string,
    body: { mode: "missing" | "all" | "single"; exerciseId?: string },
    busyKey: string,
  ) => {
    setWorking(busyKey);
    toast({ title: `${label} started`, description: "This may take a minute…" });
    const { data, error } = await supabase.functions.invoke("seed-exercise-images", { body });
    setWorking(null);
    if (error) {
      toast({ title: `${label} failed`, description: error.message, variant: "destructive" });
      return;
    }
    const okCount = data?.results?.filter((r: any) => r.ok).length ?? 0;
    const failCount = (data?.processed ?? 0) - okCount;
    toast({
      title: `${label} complete`,
      description: `${okCount} succeeded${failCount ? `, ${failCount} failed` : ""}`,
    });
    clearExerciseImageCache();
    await load();
  };

  const total = rows.length;
  const ready = rows.filter((r) => r.image_url).length;
  const missing = total - ready;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Admin · Exercise Images</h1>
            <p className="text-xs text-muted-foreground">
              {ready}/{total} images ready · {missing} missing
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-4 space-y-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Seeding actions
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => invokeSeed("Seed missing images", { mode: "missing" }, "missing")}
              disabled={working !== null || missing === 0}
            >
              {working === "missing" ? "Working…" : `Seed missing (${missing})`}
            </Button>
            <Button
              variant="outline"
              onClick={() => invokeSeed("Regenerate all", { mode: "all" }, "all")}
              disabled={working !== null}
            >
              {working === "all" ? "Working…" : "Regenerate all"}
            </Button>
            <Button variant="ghost" onClick={load} disabled={loading || working !== null}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Generated images are stored permanently. Normal app usage will not call AI again.
          </p>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rows.map((r) => (
            <Card key={r.id} className="p-3 flex gap-3">
              <div className="w-20 h-20 rounded-md bg-secondary overflow-hidden flex items-center justify-center shrink-0">
                {r.image_url ? (
                  <img src={r.image_url} alt={r.exercise_name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{r.exercise_name}</p>
                <p className="text-xs text-muted-foreground">
                  {r.muscle_group}
                  {r.equipment ? ` · ${r.equipment}` : ""}
                </p>
                <Badge
                  variant={r.image_url ? "secondary" : "outline"}
                  className="mt-1 text-[10px]"
                >
                  {r.image_url ? "ready" : r.image_status}
                </Badge>
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    disabled={working !== null}
                    onClick={() =>
                      invokeSeed(
                        `Regenerate ${r.exercise_name}`,
                        { mode: "single", exerciseId: r.id },
                        r.id,
                      )
                    }
                  >
                    {working === r.id ? "Working…" : r.image_url ? "Regenerate" : "Generate"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}