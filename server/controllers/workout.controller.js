import {
  getWorkoutSessions,
  getWorkoutSession,
  createWorkoutSession,
  updateWorkoutSession,
  deleteWorkoutSession,
} from '../services/workout.service.js';

export async function list(req, res, next) {
  try {
    const data = await getWorkoutSessions(req.user.id, req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const data = await getWorkoutSession(req.user.id, req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const data = await createWorkoutSession(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const data = await updateWorkoutSession(req.user.id, req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await deleteWorkoutSession(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
}
