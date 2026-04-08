-- Add UPDATE and DELETE policies for exercise_logs
CREATE POLICY "Users can update own exercise_logs"
  ON exercise_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercise_logs"
  ON exercise_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add UPDATE and DELETE policies for workouts
CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);