import { supabase } from '../config/supabase.js';

async function fetchSession(userId, id) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*, workout_exercises(*)')
    .eq('id', id)
    .eq('user_id', userId)
    .order('order_index', { referencedTable: 'workout_exercises', ascending: true })
    .single();
  if (error || !data) { const e = new Error('Not found'); e.status = 404; throw e; }
  return data;
}

// Client sends: exercises: [{ exercise: "Bench Press", sets: [{ reps, weight, weight_unit }] }]
// Each set becomes its own DB row. `sets` column stores the set number (1, 2, 3…).
function flattenExercises(exercises, sessionId, userId) {
  const rows = [];
  let orderIdx = 0;
  for (const ex of exercises) {
    const setList = Array.isArray(ex.sets) ? ex.sets : [];
    setList.forEach((set, sIdx) => {
      rows.push({
        session_id: sessionId,
        user_id: userId,
        exercise: ex.exercise,
        sets: sIdx + 1,
        reps: set.reps || null,
        weight: set.weight || null,
        weight_unit: set.weight_unit || 'lbs',
        order_index: orderIdx++,
      });
    });
  }
  return rows;
}

export async function getWorkoutSessions(userId, { from, to, limit = 50 } = {}) {
  let q = supabase
    .from('workout_sessions')
    .select('*, workout_exercises(*)')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .order('order_index', { referencedTable: 'workout_exercises', ascending: true })
    .limit(Number(limit));
  if (from) q = q.gte('logged_at', from);
  if (to) q = q.lte('logged_at', to);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function getWorkoutSession(userId, id) {
  return fetchSession(userId, id);
}

export async function createWorkoutSession(userId, { exercises = [], ...sessionFields }) {
  const { data: session, error: sErr } = await supabase
    .from('workout_sessions')
    .insert({ user_id: userId, ...sessionFields })
    .select()
    .single();
  if (sErr) throw sErr;

  const rows = flattenExercises(exercises, session.id, userId);
  if (rows.length > 0) {
    const { error: eErr } = await supabase.from('workout_exercises').insert(rows);
    if (eErr) throw eErr;
  }

  return fetchSession(userId, session.id);
}

export async function updateWorkoutSession(userId, id, { exercises, ...sessionFields }) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .update(sessionFields)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  if (!data) { const e = new Error('Not found'); e.status = 404; throw e; }

  if (exercises !== undefined) {
    await supabase.from('workout_exercises').delete().eq('session_id', id);
    const rows = flattenExercises(exercises, id, userId);
    if (rows.length > 0) {
      await supabase.from('workout_exercises').insert(rows);
    }
  }

  return fetchSession(userId, id);
}

export async function deleteWorkoutSession(userId, id) {
  const { error } = await supabase
    .from('workout_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}
