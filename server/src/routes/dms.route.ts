import { Router } from 'express';
import { createDirectConversation, deleteDirectConversation, getDirectConversationMessages, listDirectConversations } from '../controllers/dms.controller';

const router = Router();
router.post('/create', createDirectConversation);
router.get('/list/:userId', listDirectConversations);
router.delete('/delete/:id', deleteDirectConversation);
router.get('/messages/:id', getDirectConversationMessages);

export default router;