import { supabase } from '../config/supabase.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided', code: 'NO_TOKEN' });
  }
  const { data: { user }, error } = await supabase.auth.getUser(header.slice(7));
  if (error || !user) {
    return res
      .status(401)
      .json({ success: false, error: 'Token expired or invalid', code: 'INVALID_TOKEN' });
  }
  req.user = { id: user.id, email: user.email };
  next();
}
