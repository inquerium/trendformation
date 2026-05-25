import { supabase } from '../config/supabase.js';

export async function getDashboardSummary(userId) {
  const today = new Date().toISOString().split('T')[0];
  const d30 = new Date(); d30.setDate(d30.getDate() - 30);
  const from30 = d30.toISOString().split('T')[0];

  const [weightRes, sleepRes, caffeineRes, nutritionRes, calorieRes, workoutRes] =
    await Promise.all([
      supabase.from('weight_logs').select('logged_at,weight,unit').eq('user_id', userId).gte('logged_at', from30).order('logged_at'),
      supabase.from('sleep_logs').select('logged_at,hours_slept,sleep_score').eq('user_id', userId).gte('logged_at', from30).order('logged_at'),
      supabase.from('caffeine_logs').select('mg').eq('user_id', userId).eq('logged_at', today),
      supabase.from('nutrition_logs').select('calories,protein_g,carbs_g,fats_g').eq('user_id', userId).eq('logged_at', today).maybeSingle(),
      supabase.from('calorie_burn_logs').select('active_calories,passive_calories').eq('user_id', userId).eq('logged_at', today).maybeSingle(),
      supabase.from('workout_sessions').select('logged_at,name,duration_min').eq('user_id', userId).order('logged_at', { ascending: false }).limit(5),
    ]);

  const weightLogs = weightRes.data ?? [];
  const sleepLogs = sleepRes.data ?? [];
  const latest = weightLogs[weightLogs.length - 1] ?? null;
  const prev = weightLogs[weightLogs.length - 2] ?? null;

  const recent7 = sleepLogs.slice(-7);
  const avgHours = recent7.length
    ? (recent7.reduce((s, l) => s + Number(l.hours_slept), 0) / recent7.length).toFixed(1)
    : null;
  const scored = recent7.filter((l) => l.sleep_score != null);
  const avgScore = scored.length
    ? Math.round(scored.reduce((s, l) => s + Number(l.sleep_score), 0) / scored.length)
    : null;

  return {
    weight: {
      current: latest ? { value: Number(latest.weight), unit: latest.unit } : null,
      change: latest && prev ? Number((Number(latest.weight) - Number(prev.weight)).toFixed(1)) : null,
      history: weightLogs.map((l) => ({ date: l.logged_at, value: Number(l.weight) })),
    },
    sleep: {
      avgHours,
      avgScore,
      history: sleepLogs.map((l) => ({
        date: l.logged_at,
        hours: Number(l.hours_slept),
        score: l.sleep_score,
      })),
    },
    caffeine: { todayMg: (caffeineRes.data ?? []).reduce((s, l) => s + Number(l.mg), 0) },
    nutrition: { today: nutritionRes.data ?? null },
    calories: { today: calorieRes.data ?? null },
    recentWorkouts: workoutRes.data ?? [],
  };
}

// Daily aggregation helper for caffeine / multi-row-per-day metrics
async function fetchDailySeries(userId, metric, from, to) {
  const range = (q) => {
    if (from) q = q.gte('logged_at', from);
    if (to) q = q.lte('logged_at', to);
    return q.order('logged_at');
  };

  switch (metric) {
    case 'weight': {
      const { data } = await range(supabase.from('weight_logs').select('logged_at,weight').eq('user_id', userId));
      return (data ?? []).map((d) => ({ date: d.logged_at, value: Number(d.weight) }));
    }
    case 'sleep_score': {
      const { data } = await range(supabase.from('sleep_logs').select('logged_at,sleep_score').eq('user_id', userId));
      return (data ?? []).filter((d) => d.sleep_score != null).map((d) => ({ date: d.logged_at, value: Number(d.sleep_score) }));
    }
    case 'hours_slept': {
      const { data } = await range(supabase.from('sleep_logs').select('logged_at,hours_slept').eq('user_id', userId));
      return (data ?? []).map((d) => ({ date: d.logged_at, value: Number(d.hours_slept) }));
    }
    case 'caffeine_mg': {
      const { data } = await range(supabase.from('caffeine_logs').select('logged_at,mg').eq('user_id', userId));
      // sum per day
      const byDay = {};
      for (const row of data ?? []) {
        byDay[row.logged_at] = (byDay[row.logged_at] ?? 0) + Number(row.mg);
      }
      return Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }));
    }
    case 'calories_in': {
      const { data } = await range(supabase.from('nutrition_logs').select('logged_at,calories').eq('user_id', userId));
      return (data ?? []).filter((d) => d.calories != null).map((d) => ({ date: d.logged_at, value: Number(d.calories) }));
    }
    case 'protein_g': {
      const { data } = await range(supabase.from('nutrition_logs').select('logged_at,protein_g').eq('user_id', userId));
      return (data ?? []).filter((d) => d.protein_g != null).map((d) => ({ date: d.logged_at, value: Number(d.protein_g) }));
    }
    case 'active_calories': {
      const { data } = await range(supabase.from('calorie_burn_logs').select('logged_at,active_calories').eq('user_id', userId));
      return (data ?? []).filter((d) => d.active_calories != null).map((d) => ({ date: d.logged_at, value: Number(d.active_calories) }));
    }
    default:
      return [];
  }
}

export async function getCorrelations(userId, { metricA, metricB, from, to } = {}) {
  const [a, b] = await Promise.all([
    fetchDailySeries(userId, metricA, from, to),
    fetchDailySeries(userId, metricB, from, to),
  ]);
  return { a, b };
}
