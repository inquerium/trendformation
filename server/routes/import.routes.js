import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth.middleware.js';
import { bulkImport } from '../services/import.service.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  [
    body('category').isIn(['weight', 'sleep', 'caffeine', 'nutrition', 'calories']),
    body('rows').isArray({ min: 1, max: 1000 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

      const { category, rows } = req.body;
      const result = await bulkImport(req.user.id, category, rows);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
