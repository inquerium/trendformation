CREATE TABLE IF NOT EXISTS sleep_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  logged_at   DATE NOT NULL DEFAULT CURRENT_DATE,
  hours_slept NUMERIC(4,2) NOT NULL,
  sleep_score INTEGER CHECK (sleep_score BETWEEN 0 AND 100),
  bed_time    TIME,
  wake_time   TIME,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sleep_logs_user_date ON sleep_logs (user_id, logged_at DESC);
