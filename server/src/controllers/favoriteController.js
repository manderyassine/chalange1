import FavoriteCity from '../models/FavoriteCity.js';

export async function listFavorites(req, res) {
  const cities = await FavoriteCity.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(cities);
}

export async function addFavorite(req, res) {
  const { name, country, lat, lon } = req.body;
  if (!name) return res.status(400).json({ error: 'City name required' });
  try {
    const fav = await FavoriteCity.create({ user: req.user.id, name, country, lat, lon });
    res.status(201).json(fav);
  } catch (e) {
    // Handle duplicate
    if (e.code === 11000) return res.status(409).json({ error: 'Already in favorites' });
    res.status(500).json({ error: e.message });
  }
}

export async function removeFavorite(req, res) {
  const { id } = req.params;
  const fav = await FavoriteCity.findOneAndDelete({ _id: id, user: req.user.id });
  if (!fav) return res.status(404).json({ error: 'Favorite not found' });
  res.json({ ok: true });
}
