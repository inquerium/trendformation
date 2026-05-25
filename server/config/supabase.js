import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

export function verifySupabaseJwt(token) {
  return jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
}
