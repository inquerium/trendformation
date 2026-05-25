import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { list, create, update, remove } from '../controllers/nutrition.controller.js';

const router = Router();
router.use(requireAuth);

const fields = [
  body('logged_at').optional().isDate(),
body('calories').optional({ nullable: true }).isInt({ min: 0 }),
  body('protein_g').optional({ nullable: true }).isFloat({ min: 0 }),
  body('carbs_g').optional({ nullable: true }).isFloat({ min: 0 }),
  body('fats_g').optional({ nullable: true }).isFloat({ min: 0 }),
  body('notes').optional().trim().isLength({ max: 1000 }),
];

router.get('/', list);
router.post('/', fields, validate, create);
router.put('/:id', fields, validate, update);
router.delete('/:id', remove);

export default router;
