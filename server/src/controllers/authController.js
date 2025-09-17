import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function signToken(user) {
  const payload = { id: user._id, email: user.email };
  const secret = process.env.JWT_SECRET || 'change_me';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

function signRefreshToken(user) {
  const payload = { id: user._id, tokenVersion: user.tokenVersion };
  const secret = process.env.JWT_SECRET || 'change_me';
  return jwt.sign(payload, secret, { expiresIn: '30d' });
}

function setRefreshCookie(res, token) {
  const secure = process.env.SECURE_COOKIES === 'true' || process.env.NODE_ENV === 'production';
  res.cookie('jid', token, {
    httpOnly: true,
    sameSite: secure ? 'none' : 'lax', // 'none' required for cross-site cookies
    secure, // must be true for SameSite=None over https
    path: '/api/auth/refresh',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
}

export async function register(req, res) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already in use' });
    const user = new User({ email, name, passwordHash: '' });
    await user.setPassword(password);
    await user.save();
    const token = signToken(user);
    const refresh = signRefreshToken(user);
    setRefreshCookie(res, refresh);
    res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const valid = await user.validatePassword(password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
    const token = signToken(user);
    const refresh = signRefreshToken(user);
    setRefreshCookie(res, refresh);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function refresh(req, res) {
  const token = req.cookies?.jid;
  if (!token) return res.status(401).json({ error: 'No refresh token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'change_me');
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (user.tokenVersion !== payload.tokenVersion) return res.status(401).json({ error: 'Token revoked' });
    const access = signToken(user);
    const refreshNew = signRefreshToken(user);
    setRefreshCookie(res, refreshNew);
    res.json({ token: access });
  } catch (e) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
}

export async function logout(req, res) {
  res.clearCookie('jid', { path: '/api/auth/refresh' });
  res.json({ ok: true });
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).select('_id email name createdAt');
    res.json({ user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
