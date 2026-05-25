import { supabase } from '../config/supabase.js';

export async function getCalorieLogs(userId, { from, to, limit = 365 } = {}) {
  let q = supabase
    .from('calorie_burn_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(Number(limit));
  if (from) q = q.gte('logged_at', from);
  if (to) q = q.lte('logged_at', to);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function createCalorieLog(userId, fields) {
  const { data, error } = await supabase
    .from('calorie_burn_logs')
    .insert({ user_id: userId, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCalorieLog(userId, id, fields) {
  const { data, error } = await supabase
    .from('calorie_burn_logs')
    .update(fields)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  if (!data) { const e = new Error('Not found'); e.status = 404; throw e; }
  return data;
}

export async function deleteCalorieLog(userId, id) {
  const { error } = await supabase
    .from('calorie_burn_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}
