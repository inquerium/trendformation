import {
  getNutritionLogs,
  createNutritionLog,
  updateNutritionLog,
  deleteNutritionLog,
} from '../services/nutrition.service.js';

export async function list(req, res, next) {
  try {
    const data = await getNutritionLogs(req.user.id, req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const data = await createNutritionLog(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const data = await updateNutritionLog(req.user.id, req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await deleteNutritionLog(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
}
