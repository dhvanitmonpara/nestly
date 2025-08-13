import { Router } from 'express';
import { getParticipants, getToken } from '../controllers/videocall.controller';

const router = Router();
router.post('/get-token', getToken);
router.get('/get-participants/:room', getParticipants);

export default router;