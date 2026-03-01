import { Router } from 'express';
import { riftController } from '../controllers/riftController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.get('/challenges', riftController.getChallenges);
router.get('/challenges/:id', riftController.getChallenge);
router.post('/challenges/:id/submit', authenticate, riftController.submitChallenge);
router.get('/projects', riftController.getProjects);
router.post('/projects', authenticate, riftController.createProject);
router.post('/projects/:id/like', authenticate, riftController.likeProject);

export default router;
