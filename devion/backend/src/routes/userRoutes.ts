import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.get('/:id/stats', authenticate, userController.getStats);
router.get('/leaderboard', userController.getLeaderboard);
router.put('/:id/stats', authenticate, userController.updateStats);

export default router;
