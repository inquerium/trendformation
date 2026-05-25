import {
  getCaffeineLogs,
  createCaffeineLog,
  updateCaffeineLog,
  deleteCaffeineLog,
} from '../services/caffeine.service.js';

export async function list(req, res, next) {
  try {
    const data = await getCaffeineLogs(req.user.id, req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const data = await createCaffeineLog(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const data = await updateCaffeineLog(req.user.id, req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await deleteCaffeineLog(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
}
