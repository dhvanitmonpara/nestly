import { Router } from 'express';
import { createChannel, deleteChannel, getChannelById, getChannelByServer } from '../controllers/channel.controller';

const router = Router();
router.post('/create', createChannel);
router.get('/id/:id', getChannelById);
router.get('/server/:serverId', getChannelByServer);
router.delete('/id/:id', deleteChannel);

export default router;