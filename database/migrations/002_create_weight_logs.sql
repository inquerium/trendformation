CREATE TABLE IF NOT EXISTS weight_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  logged_at  DATE NOT NULL DEFAULT CURRENT_DATE,
  weight     NUMERIC(6,2) NOT NULL,
  unit       TEXT DEFAULT 'lbs',
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS weight_logs_user_date ON weight_logs (user_id, logged_at DESC);
