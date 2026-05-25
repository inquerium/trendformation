CREATE TABLE IF NOT EXISTS nutrition_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  logged_at  DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_label TEXT,
  calories   INTEGER,
  protein_g  NUMERIC(6,2),
  carbs_g    NUMERIC(6,2),
  fats_g     NUMERIC(6,2),
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS nutrition_logs_user_date ON nutrition_logs (user_id, logged_at DESC);
