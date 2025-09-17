import Task from '../models/Task.js';

export async function listTasks(req, res) {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
  const sortBy = (req.query.sortBy || 'createdAt');
  const sortOrder = (req.query.sortOrder || 'desc').toLowerCase() === 'asc' ? 1 : -1;

  const allowedSort = new Set(['createdAt', 'updatedAt', 'title', 'completed']);
  const sortField = allowedSort.has(sortBy) ? sortBy : 'createdAt';
  // Deterministic sorting: primary field then _id desc
  const sort = { [sortField]: sortOrder, _id: -1 };

  const filter = { user: req.user.id };

  const total = await Task.countDocuments(filter);
  const items = await Task.find(filter)
    .collation({ locale: 'en', strength: 2 })
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ items, total, page, pages: Math.ceil(total / limit) });
}

export async function createTask(req, res) {
  const { title, completed } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const task = await Task.create({ user: req.user.id, title, completed: Boolean(completed) });
  res.status(201).json(task);
}

export async function updateTask(req, res) {
  const { id } = req.params;
  const { title, completed } = req.body;
  const set = {};
  if (typeof title !== 'undefined') set.title = title;
  if (typeof completed !== 'undefined') set.completed = completed;
  const task = await Task.findOneAndUpdate(
    { _id: id, user: req.user.id },
    { $set: set, $currentDate: { updatedAt: true } },
    { new: true, runValidators: true }
  );
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
}

export async function deleteTask(req, res) {
  const { id } = req.params;
  const task = await Task.findOneAndDelete({ _id: id, user: req.user.id });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json({ ok: true });
}
