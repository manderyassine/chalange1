import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { listNotes, createNote, updateNote, deleteNote } from '../controllers/noteController.js';

const router = Router();

router.use(auth);

router.get('/', listNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
