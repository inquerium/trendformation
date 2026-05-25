import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getDashboardSummary, getCorrelations } from '../services/dashboard.service.js';

const router = Router();
router.use(requireAuth);

router.get('/summary', async (req, res, next) => {
  try {
    const data = await getDashboardSummary(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/correlations', async (req, res, next) => {
  try {
    const data = await getCorrelations(req.user.id, req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
