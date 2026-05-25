import { supabase } from '../config/supabase.js';

export async function registerUser(email, password, name) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    const err = new Error(error.message);
    err.status = error.status ?? 400;
    err.code = error.code ?? 'REGISTER_ERROR';
    throw err;
  }

  const userId = data.user.id;

  await supabase.from('users').insert({ id: userId, name });

  const { data: session, error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInErr) throw signInErr;

  return {
    user: { id: userId, email, name, weightUnit: 'lbs' },
    accessToken: session.session.access_token,
    refreshToken: session.session.refresh_token,
  };
}

export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  const profile = await getProfileById(data.user.id);

  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      name: profile?.name ?? null,
      weightUnit: profile?.weight_unit ?? 'lbs',
    },
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  };
}

export async function refreshSession(refreshToken) {
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error) {
    const err = new Error('Session expired');
    err.status = 401;
    err.code = 'REFRESH_FAILED';
    throw err;
  }
  return data.session.access_token;
}

export async function getProfileById(id) {
  const { data } = await supabase.from('users').select('name, weight_unit').eq('id', id).maybeSingle();
  return data;
}

export async function updateProfile(id, fields) {
  const allowed = {};
  if (fields.name !== undefined) allowed.name = fields.name;
  if (fields.weightUnit !== undefined) allowed.weight_unit = fields.weightUnit;
  allowed.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('users')
    .upsert({ id, ...allowed })
    .select('name, weight_unit')
    .single();
  if (error) throw error;

  if (fields.password) {
    await supabase.auth.admin.updateUserById(id, { password: fields.password });
  }

  return data;
}
