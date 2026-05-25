import { supabase } from '../config/supabase.js';

export async function getSleepLogs(userId, { from, to, limit = 365 } = {}) {
  let q = supabase
    .from('sleep_logs')
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

export async function createSleepLog(userId, fields) {
  const { data, error } = await supabase
    .from('sleep_logs')
    .insert({ user_id: userId, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSleepLog(userId, id, fields) {
  const { data, error } = await supabase
    .from('sleep_logs')
    .update(fields)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  if (!data) { const e = new Error('Not found'); e.status = 404; throw e; }
  return data;
}

export async function deleteSleepLog(userId, id) {
  const { error } = await supabase
    .from('sleep_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}
