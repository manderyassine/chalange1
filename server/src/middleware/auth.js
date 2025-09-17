import jwt from 'jsonwebtoken';

export function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change_me');
    req.user = { id: decoded.id };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
