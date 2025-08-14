import { Router } from 'express';
import { createMessage, deleteMessage, loadMessages, updateMessage } from '../controllers/message.controller';

const router = Router();
router.post('/create', createMessage);
router.delete('/delete/:id', deleteMessage);
router.put('/update/:id', updateMessage);
router.get('/chat/:userId/:channelId', loadMessages);

export default router;