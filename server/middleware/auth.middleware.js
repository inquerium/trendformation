import { verifySupabaseJwt } from '../config/supabase.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided', code: 'NO_TOKEN' });
  }
  try {
    const payload = verifySupabaseJwt(header.slice(7));
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (_) {
    return res
      .status(401)
      .json({ success: false, error: 'Token expired or invalid', code: 'INVALID_TOKEN' });
  }
}
