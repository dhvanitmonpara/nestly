import { Router } from 'express';
import { createChannel, deleteChannel, getChannelById, getChannelByServer, updateChannel } from '../controllers/channel.controller';

const router = Router();
router.post('/create', createChannel);
router.get('/id/:id', getChannelById);
router.get('/server/:serverId', getChannelByServer);
router.delete('/id/:id', deleteChannel);
router.patch('/update/:channelId', updateChannel);

export default router;