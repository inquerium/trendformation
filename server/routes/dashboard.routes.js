import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/summary', (_req, res) => res.json({ success: true, data: {} }));
router.get('/correlations', (_req, res) => res.json({ success: true, data: { a: [], b: [] } }));

export default router;
