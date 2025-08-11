import { Router } from 'express';
import { createServer, joinServer, leaveServer, getJoinedServer, getServerDetailsById, deleteServer, updateServer } from '../controllers/server.controller';

const router = Router();
router.post('/create', createServer);
router.post('/join', joinServer);
router.post('/leave', leaveServer);
router.get('/joined/:userId', getJoinedServer);
router.delete('/delete/:serverId', deleteServer);
router.put('/update/:serverId', updateServer);
router.get('/id/:serverId', getServerDetailsById);

export default router;