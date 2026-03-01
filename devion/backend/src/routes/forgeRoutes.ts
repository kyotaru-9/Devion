import { Router } from 'express';
import { forgeController } from '../controllers/forgeController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.get('/challenges', forgeController.getChallenges);
router.get('/challenges/:id', forgeController.getChallenge);
router.post('/challenges/:id/submit', authenticate, forgeController.submitChallenge);

export default router;
