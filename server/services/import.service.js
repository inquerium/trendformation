import { supabase } from '../config/supabase.js';

const TABLE = {
  weight: 'weight_logs',
  sleep: 'sleep_logs',
  caffeine: 'caffeine_logs',
  nutrition: 'nutrition_logs',
  calories: 'calorie_burn_logs',
};

const ALLOWED_FIELDS = {
  weight: ['logged_at', 'weight', 'unit'],
  sleep: ['logged_at', 'hours_slept', 'sleep_score', 'bed_time', 'wake_time'],
  caffeine: ['logged_at', 'mg', 'source', 'time_of_day'],
  nutrition: ['logged_at', 'calories', 'protein_g', 'carbs_g', 'fats_g'],
  calories: ['logged_at', 'active_calories', 'passive_calories', 'activity_type'],
};

function sanitize(category, row) {
  const allowed = ALLOWED_FIELDS[category];
  const clean = { logged_at: row.logged_at ?? row.date };
  for (const key of allowed) {
    if (key === 'logged_at') continue;
    if (row[key] != null && row[key] !== '') {
      const num = ['weight', 'hours_slept', 'sleep_score', 'mg', 'calories', 'protein_g', 'carbs_g', 'fats_g', 'active_calories', 'passive_calories'];
      clean[key] = num.includes(key) ? Number(row[key]) : row[key];
    }
  }
  return clean;
}

export async function bulkImport(userId, category, rows) {
  const table = TABLE[category];
  if (!table) throw new Error(`Unknown category: ${category}`);

  const records = rows
    .filter((r) => r.logged_at || r.date)
    .map((r) => ({ user_id: userId, ...sanitize(category, r) }));

  if (!records.length) return { inserted: 0 };

  const { data, error } = await supabase.from(table).insert(records).select('id');
  if (error) throw error;
  return { inserted: data.length };
}
