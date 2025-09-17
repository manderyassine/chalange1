import { Router } from 'express';
import { login, register, refresh, logout, me } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', auth, me);

export default router;
