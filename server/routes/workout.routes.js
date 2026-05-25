import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { list, getOne, create, update, remove } from '../controllers/workout.controller.js';

const router = Router();
router.use(requireAuth);

const sessionFields = [
  body('logged_at').optional().isDate(),
  body('name').optional().trim().isLength({ max: 100 }),
  body('duration_min').optional({ nullable: true }).isInt({ min: 0 }),
  body('notes').optional().trim().isLength({ max: 1000 }),
  body('exercises').optional().isArray(),
  body('exercises.*.exercise').notEmpty().trim().isLength({ max: 100 }),
  body('exercises.*.sets').isArray(),
  body('exercises.*.sets.*.reps').optional({ nullable: true }).isInt({ min: 0 }),
  body('exercises.*.sets.*.weight').optional({ nullable: true }).isFloat({ min: 0 }),
  body('exercises.*.sets.*.weight_unit').optional().isIn(['lbs', 'kg']),
];

router.get('/', list);
router.post('/', sessionFields, validate, create);
router.get('/:id', getOne);
router.put('/:id', sessionFields, validate, update);
router.delete('/:id', remove);

export default router;
