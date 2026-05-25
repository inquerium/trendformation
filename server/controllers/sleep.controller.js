import {
  getSleepLogs,
  createSleepLog,
  updateSleepLog,
  deleteSleepLog,
} from '../services/sleep.service.js';

export async function list(req, res, next) {
  try {
    const data = await getSleepLogs(req.user.id, req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const data = await createSleepLog(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const data = await updateSleepLog(req.user.id, req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await deleteSleepLog(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
}
