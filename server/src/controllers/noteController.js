import Note from '../models/Note.js';

export async function listNotes(req, res) {
  const { q, tags } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
  const sortBy = (req.query.sortBy || 'updatedAt');
  const sortOrder = (req.query.sortOrder || 'desc').toLowerCase() === 'asc' ? 1 : -1;

  const allowedSort = new Set(['createdAt', 'updatedAt', 'title']);
  const sortField = allowedSort.has(sortBy) ? sortBy : 'updatedAt';
  const sort = { [sortField]: sortOrder };

  const filter = { user: req.user.id };
  if (q) filter.$text = { $search: q };
  if (tags) {
    const tagList = Array.isArray(tags) ? tags : String(tags).split(',').map((t) => t.trim()).filter(Boolean);
    if (tagList.length) filter.tags = { $all: tagList };
  }

  const total = await Note.countDocuments(filter);
  const items = await Note.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ items, total, page, pages: Math.ceil(total / limit) });
}

export async function createNote(req, res) {
  const { title, content = '', tags = [] } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const note = await Note.create({ user: req.user.id, title, content, tags });
  res.status(201).json(note);
}

export async function updateNote(req, res) {
  const { id } = req.params;
  const { title, content, tags } = req.body;
  const note = await Note.findOneAndUpdate(
    { _id: id, user: req.user.id },
    { title, content, tags },
    { new: true }
  );
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
}

export async function deleteNote(req, res) {
  const { id } = req.params;
  const note = await Note.findOneAndDelete({ _id: id, user: req.user.id });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json({ ok: true });
}
