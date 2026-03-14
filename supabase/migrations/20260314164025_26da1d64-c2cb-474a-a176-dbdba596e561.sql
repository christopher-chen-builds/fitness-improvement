
-- 1. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Add user_id to workouts
ALTER TABLE public.workouts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Add user_id to exercise_logs
ALTER TABLE public.exercise_logs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Drop old permissive policies
DROP POLICY IF EXISTS "Allow public insert workouts" ON public.workouts;
DROP POLICY IF EXISTS "Allow public read workouts" ON public.workouts;
DROP POLICY IF EXISTS "Allow public insert exercise_logs" ON public.exercise_logs;
DROP POLICY IF EXISTS "Allow public read exercise_logs" ON public.exercise_logs;

-- 5. Create user-scoped RLS policies for workouts
CREATE POLICY "Users can insert own workouts" ON public.workouts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own workouts" ON public.workouts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 6. Create user-scoped RLS policies for exercise_logs
CREATE POLICY "Users can insert own exercise_logs" ON public.exercise_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own exercise_logs" ON public.exercise_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
