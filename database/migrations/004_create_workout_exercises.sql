CREATE TABLE IF NOT EXISTS workout_exercises (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise    TEXT NOT NULL,
  sets        INTEGER NOT NULL,
  reps        INTEGER,
  weight      NUMERIC(6,2),
  weight_unit TEXT DEFAULT 'lbs',
  rpe         NUMERIC(3,1),
  notes       TEXT,
  order_index INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS workout_exercises_session ON workout_exercises (session_id);
CREATE INDEX IF NOT EXISTS workout_exercises_user_exercise ON workout_exercises (user_id, exercise);
