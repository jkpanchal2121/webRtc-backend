import { Router } from 'express';
import { getAllUsers } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.get('/', protect, getAllUsers);

export default router;
