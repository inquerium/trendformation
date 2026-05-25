CREATE TABLE IF NOT EXISTS workout_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  logged_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  name         TEXT,
  duration_min INTEGER,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS workout_sessions_user_date ON workout_sessions (user_id, logged_at DESC);
