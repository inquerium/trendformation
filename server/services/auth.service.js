import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import { signAccess, signRefresh } from '../config/jwt.js';

function makeTokens(user) {
  const payload = { sub: user.id, email: user.email };
  return {
    accessToken: signAccess(payload),
    refreshToken: signRefresh(payload),
  };
}

export async function registerUser(email, password, name) {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    err.code = 'EMAIL_TAKEN';
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 12);
  const { data: user, error } = await supabase
    .from('users')
    .insert({ email, password_hash, name })
    .select('id, email, name, weight_unit, created_at')
    .single();

  if (error) throw error;
  return { user, ...makeTokens(user) };
}

export async function loginUser(email, password) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, weight_unit, password_hash')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;

  const valid = user && (await bcrypt.compare(password, user.password_hash));
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  const { password_hash: _ph, ...safeUser } = user;
  return { user: safeUser, ...makeTokens(user) };
}

export async function getUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, weight_unit')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateUser(id, fields) {
  const allowed = {};
  if (fields.name !== undefined) allowed.name = fields.name;
  if (fields.weightUnit !== undefined) allowed.weight_unit = fields.weightUnit;
  if (fields.password) {
    allowed.password_hash = await bcrypt.hash(fields.password, 12);
  }
  allowed.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('users')
    .update(allowed)
    .eq('id', id)
    .select('id, email, name, weight_unit')
    .single();
  if (error) throw error;
  return data;
}
