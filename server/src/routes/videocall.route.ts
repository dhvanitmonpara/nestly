import { Router } from 'express';
import { getToken } from '../controllers/videocall.controller';

const router = Router();
router.post('/get-token', getToken);

export default router;