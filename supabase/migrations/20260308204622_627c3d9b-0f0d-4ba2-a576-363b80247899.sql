
CREATE TABLE public.workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_id INTEGER NOT NULL,
  day_name TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_minutes INTEGER,
  muscle_groups TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.exercise_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  sets_completed INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'lbs',
  per_hand BOOLEAN NOT NULL DEFAULT false,
  weight_change_flag TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read workouts" ON public.workouts FOR SELECT USING (true);
CREATE POLICY "Allow public insert workouts" ON public.workouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read exercise_logs" ON public.exercise_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert exercise_logs" ON public.exercise_logs FOR INSERT WITH CHECK (true);
