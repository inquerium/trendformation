import {
  registerUser,
  loginUser,
  refreshSession,
  getProfileById,
  updateProfile,
} from '../services/auth.service.js';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;
    const result = await registerUser(email, password, name);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTS);
    res.status(201).json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTS);
    res.json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req, res) {
  res.clearCookie('refreshToken', { path: '/' });
  res.json({ success: true });
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, error: 'No refresh token', code: 'NO_REFRESH_TOKEN' });
    }
    const accessToken = await refreshSession(token);
    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const profile = await getProfileById(req.user.id);
    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          name: profile?.name ?? null,
          weightUnit: profile?.weight_unit ?? 'lbs',
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function patchMe(req, res, next) {
  try {
    const profile = await updateProfile(req.user.id, req.body);
    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          name: profile.name,
          weightUnit: profile.weight_unit,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
