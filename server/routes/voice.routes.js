import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { parseTranscript } from '../services/voice.service.js';

const router = Router();
router.use(requireAuth);

router.post(
  '/parse',
  [body('transcript').notEmpty().trim().isLength({ max: 2000 })],
  validate,
  async (req, res, next) => {
    try {
      const data = await parseTranscript(req.body.transcript);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
);

export default router;
