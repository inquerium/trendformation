import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { list, create, update, remove } from '../controllers/sleep.controller.js';

const router = Router();
router.use(requireAuth);

const fields = [
  body('logged_at').optional().isDate(),
  body('hours_slept').isFloat({ min: 0, max: 24 }),
  body('sleep_score').optional({ nullable: true }).isInt({ min: 0, max: 100 }),
  body('bed_time').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/),
  body('wake_time').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/),
  body('notes').optional().trim().isLength({ max: 1000 }),
];

router.get('/', list);
router.post('/', fields, validate, create);
router.put('/:id', fields, validate, update);
router.delete('/:id', remove);

export default router;
