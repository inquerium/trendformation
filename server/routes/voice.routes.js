import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.post('/parse', (_req, res) => res.json({ success: true, data: { category: 'unknown', message: 'Voice service coming in Phase 7.' } }));

export default router;
