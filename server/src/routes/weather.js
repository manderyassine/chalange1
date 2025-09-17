import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { getByCity } from '../controllers/weatherController.js';

const router = Router();

router.use(auth);

router.get('/', getByCity);

export default router;
