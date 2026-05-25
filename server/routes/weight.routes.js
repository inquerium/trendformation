import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { list, create, update, remove } from '../controllers/weight.controller.js';

const router = Router();
router.use(requireAuth);

const fields = [
  body('weight').isFloat({ min: 0.1, max: 2000 }),
  body('unit').optional().isIn(['lbs', 'kg']),
  body('logged_at').optional().isDate(),
  body('note').optional().trim().isLength({ max: 500 }),
];

router.get('/', list);
router.post('/', fields, validate, create);
router.put('/:id', fields, validate, update);
router.delete('/:id', remove);

export default router;
