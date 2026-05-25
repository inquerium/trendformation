import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { list, create, update, remove } from '../controllers/caffeine.controller.js';

const router = Router();
router.use(requireAuth);

const fields = [
  body('logged_at').optional().isDate(),
  body('mg').isInt({ min: 1, max: 10000 }),
  body('source').optional().trim().isLength({ max: 100 }),
  body('logged_time').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/),
  body('notes').optional().trim().isLength({ max: 1000 }),
];

router.get('/', list);
router.post('/', fields, validate, create);
router.put('/:id', fields, validate, update);
router.delete('/:id', remove);

export default router;
