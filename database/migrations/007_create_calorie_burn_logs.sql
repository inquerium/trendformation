CREATE TABLE IF NOT EXISTS calorie_burn_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  logged_at        DATE NOT NULL DEFAULT CURRENT_DATE,
  active_calories  INTEGER,
  passive_calories INTEGER,
  activity_type    TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS calorie_burn_logs_user_date ON calorie_burn_logs (user_id, logged_at DESC);
