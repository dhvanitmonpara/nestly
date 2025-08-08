import { Router } from 'express';
import { createMessage, loadMessages } from '../controllers/message.controller';

const router = Router();
router.post('/create', createMessage);
router.get('/chat/:userId/:channelId', loadMessages);

export default router;