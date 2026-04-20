-- Canonical exercises table
CREATE TABLE public.exercises (
  id TEXT PRIMARY KEY,
  exercise_name TEXT NOT NULL UNIQUE,
  muscle_group TEXT NOT NULL,
  equipment TEXT,
  image_status TEXT NOT NULL DEFAULT 'pending',
  image_url TEXT,
  image_prompt TEXT,
  image_last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Public read (exercise library is shared content)
CREATE POLICY "Anyone can read exercises"
  ON public.exercises FOR SELECT
  USING (true);

-- Only authenticated users can write (admin seeding)
CREATE POLICY "Authenticated can insert exercises"
  ON public.exercises FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update exercises"
  ON public.exercises FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_exercises_updated_at
BEFORE UPDATE ON public.exercises
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed canonical exercise library
INSERT INTO public.exercises (id, exercise_name, muscle_group, equipment) VALUES
  -- Chest & Triceps baseline
  ('inc-bench', 'Incline Barbell Bench Press', 'Chest', 'Barbell'),
  ('db-bench', 'Flat Dumbbell Bench Press', 'Chest', 'Dumbbell'),
  ('inc-fly', 'Incline Dumbbell Fly', 'Chest', 'Dumbbell'),
  ('skull', 'Lying Tricep Extension', 'Triceps', 'Barbell'),
  ('rope-ext', 'Cable Rope Tricep Extension', 'Triceps', 'Cable'),
  -- Back & Biceps baseline
  ('lat-pull', 'Lat Pulldown', 'Back', 'Cable'),
  ('db-row', 'Single-Arm Dumbbell Row', 'Back', 'Dumbbell'),
  ('db-curl', 'Dumbbell Curl', 'Biceps', 'Dumbbell'),
  ('hammer', 'Dumbbell Hammer Curl', 'Biceps', 'Dumbbell'),
  ('knee-tuck', 'Hanging Knee Tuck', 'Abs', 'Bodyweight'),
  -- Legs/Shoulders/Back baseline
  ('squat', 'Barbell Squat', 'Legs', 'Barbell'),
  ('ohp', 'Barbell Shoulder Press', 'Shoulders', 'Barbell'),
  ('db-shoulder', 'Seated Dumbbell Shoulder Press', 'Shoulders', 'Dumbbell'),
  ('lunge', 'Dumbbell Backwards Lunge', 'Legs', 'Dumbbell'),
  ('cable-hip', 'Cable Hip Extension', 'Glutes', 'Cable'),
  -- Mix-in repository: Chest
  ('pushups', 'Push-ups', 'Chest', 'Bodyweight'),
  ('cable-cross', 'Cable Crossovers', 'Chest', 'Cable'),
  ('machine-press', 'Machine Chest Press', 'Chest', 'Machine'),
  ('dips', 'Dips', 'Chest', 'Bodyweight'),
  -- Mix-in: Back
  ('pullups', 'Pull-ups', 'Back', 'Bodyweight'),
  ('assisted-pullups', 'Assisted Pull-ups', 'Back', 'Machine'),
  ('seated-row', 'Seated Cable Rows', 'Back', 'Cable'),
  ('face-pulls', 'Face Pulls', 'Back', 'Cable'),
  ('straight-arm-pull', 'Straight-Arm Pulldowns', 'Back', 'Cable'),
  -- Mix-in: Shoulders
  ('lat-raise', 'Dumbbell Lateral Raises', 'Shoulders', 'Dumbbell'),
  ('front-raise', 'Front Raises', 'Shoulders', 'Dumbbell'),
  ('arnold', 'Arnold Press', 'Shoulders', 'Dumbbell'),
  ('rev-pec-deck', 'Reverse Pec-Deck', 'Shoulders', 'Machine'),
  -- Mix-in: Legs
  ('leg-press', 'Leg Press', 'Legs', 'Machine'),
  ('rdl', 'Romanian Deadlifts', 'Legs', 'Barbell'),
  ('leg-ext', 'Leg Extensions', 'Legs', 'Machine'),
  ('ham-curl', 'Hamstring Curls', 'Legs', 'Machine'),
  ('calf-raise', 'Calf Raises', 'Legs', 'Bodyweight'),
  -- Mix-in: Arms
  ('preacher', 'Preacher Curls', 'Biceps', 'Barbell'),
  ('cable-curl', 'Cable Bicep Curls', 'Biceps', 'Cable'),
  ('oh-tri-ext', 'Overhead Tricep Extensions', 'Triceps', 'Dumbbell'),
  ('tri-kickback', 'Tricep Kickbacks', 'Triceps', 'Dumbbell')
ON CONFLICT (id) DO NOTHING;

-- Public storage bucket for exercise images
INSERT INTO storage.buckets (id, name, public)
VALUES ('exercise-images', 'exercise-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view exercise images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'exercise-images');

CREATE POLICY "Authenticated can upload exercise images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'exercise-images');

CREATE POLICY "Authenticated can update exercise images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'exercise-images');

CREATE POLICY "Authenticated can delete exercise images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'exercise-images');