import { Router } from 'express';
import { body } from 'express-validator';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  register,
  login,
  logout,
  refresh,
  getMe,
  patchMe,
} from '../controllers/auth.controller.js';

const router = Router();

router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').optional().trim().isLength({ max: 100 }),
  ],
  validate,
  register,
);

router.post(
  '/login',
  authLimiter,
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  login,
);

router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, patchMe);

export default router;
