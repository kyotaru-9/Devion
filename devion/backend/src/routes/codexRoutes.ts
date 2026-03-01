import { Router } from 'express';
import { codexController } from '../controllers/codexController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.get('/courses', codexController.getCourses);
router.get('/courses/:id', codexController.getCourse);
router.get('/courses/:courseId/modules', codexController.getModules);
router.get('/modules/:moduleId/lessons', codexController.getLessons);
router.get('/lessons/:id', codexController.getLesson);
router.get('/exercises/:id', codexController.getExercise);
router.post('/exercises/:id/submit', authenticate, codexController.submitExercise);
router.get('/users/:id/progress', authenticate, codexController.getUserProgress);

export default router;
