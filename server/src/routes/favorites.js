import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { listFavorites, addFavorite, removeFavorite } from '../controllers/favoriteController.js';

const router = Router();

router.use(auth);

router.get('/', listFavorites);
router.post('/', addFavorite);
router.delete('/:id', removeFavorite);

export default router;
