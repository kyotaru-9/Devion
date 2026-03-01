import { Router } from 'express';
import { snippetController } from '../controllers/snippetController.js';

const router = Router();

router.get('/', snippetController.getSnippets);
router.post('/', snippetController.createSnippet);
router.put('/:id', snippetController.updateSnippet);
router.delete('/:id', snippetController.deleteSnippet);

export default router;
