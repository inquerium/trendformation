import {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
} from '../services/auth.service.js';
import { verifyRefresh, signAccess } from '../config/jwt.js';

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
    if (!token) return res.status(401).json({ success: false, error: 'No refresh token', code: 'NO_REFRESH_TOKEN' });
    const payload = verifyRefresh(token);
    const accessToken = signAccess({ sub: payload.sub, email: payload.email });
    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await getUserById(req.user.id);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function patchMe(req, res, next) {
  try {
    const user = await updateUser(req.user.id, req.body);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}
