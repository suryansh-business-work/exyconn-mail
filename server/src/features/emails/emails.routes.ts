import { Router } from 'express';
import { emailsController } from './emails.controllers';

const router = Router();

router.post('/send', emailsController.send);
router.get('/', emailsController.getAll);
router.get('/:id', emailsController.getById);
router.put('/:id', emailsController.update);
router.delete('/:id', emailsController.delete);
router.post('/:id/trash', emailsController.moveToTrash);
router.post('/:id/star', emailsController.toggleStar);
router.post('/:id/reply', emailsController.reply);

export const emailsRouter = router;
