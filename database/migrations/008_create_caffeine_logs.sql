CREATE TABLE IF NOT EXISTS caffeine_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  logged_at   DATE NOT NULL DEFAULT CURRENT_DATE,
  logged_time TIME,
  mg          INTEGER NOT NULL,
  source      TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS caffeine_logs_user_date ON caffeine_logs (user_id, logged_at DESC);
