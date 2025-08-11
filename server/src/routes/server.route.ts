import { Router } from 'express';
import { createServer, joinServer, leaveServer, getJoinedServer, getServerDetailsById, deleteServer } from '../controllers/server.controller';

const router = Router();
router.post('/create', createServer);
router.post('/join', joinServer);
router.post('/leave', leaveServer);
router.get('/joined/:userId', getJoinedServer);
router.delete('/delete/:serverId', deleteServer);
router.get('/id/:serverId', getServerDetailsById);

export default router;