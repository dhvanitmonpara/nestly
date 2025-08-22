import { Router } from 'express';
import { createDirectConversation, deleteDirectConversation, deleteDirectMessage, getConversationUser, getDirectConversationMessages, listDirectConversations, updateDirectMessage } from '../controllers/dms.controller';

const router = Router();
router.post('/create', createDirectConversation);
router.get('/list/:userId', listDirectConversations);
router.delete('/delete/:id', deleteDirectConversation);
router.get('/messages/:id', getDirectConversationMessages);
router.delete('/messages/:id', deleteDirectMessage);
router.put('/messages/:id', updateDirectMessage);
router.get('/messages/:id/users', getConversationUser);

export default router;