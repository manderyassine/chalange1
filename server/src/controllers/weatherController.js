import axios from 'axios';

const API = 'https://api.openweathermap.org/data/2.5/weather';

export async function getByCity(req, res) {
  const { q } = req.query; // city name
  if (!q) return res.status(400).json({ error: 'Missing city query' });
  const params = { q, appid: process.env.OPENWEATHER_API_KEY, units: 'metric' };
  try {
    const { data } = await axios.get(API, { params });
    res.json(data);
  } catch (e) {
    const status = e.response?.status || 500;
    res.status(status).json({ error: e.response?.data || e.message });
  }
}
