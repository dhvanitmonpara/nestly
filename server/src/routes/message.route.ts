import { Router } from 'express';
import { createMessage, deleteMessage, generateSuggestion, loadMessages, updateMessage } from '../controllers/message.controller';

const router = Router();
router.post('/create', createMessage);
router.delete('/delete/:id', deleteMessage);
router.put('/update/:id', updateMessage);
router.get('/chat/:userId/:channelId', loadMessages);
router.post('/suggest', generateSuggestion);

export default router;