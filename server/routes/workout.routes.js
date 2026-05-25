import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', (_req, res) => res.json({ success: true, data: [] }));
router.post('/', (_req, res) => res.status(201).json({ success: true, data: {} }));
router.get('/:id', (_req, res) => res.json({ success: true, data: {} }));
router.put('/:id', (_req, res) => res.json({ success: true, data: {} }));
router.delete('/:id', (_req, res) => res.json({ success: true }));

export default router;
