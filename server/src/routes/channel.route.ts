import { Router } from 'express';
import { createChannel, deleteChannel, getChannelDetailsById, getJoinedChannel, joinChannel, leaveChannel } from '../controllers/channel.controller';

const router = Router();
router.post('/create', createChannel);
router.post('/join', joinChannel);
router.post('/leave', leaveChannel);
router.get('/joined/:userId', getJoinedChannel);
router.delete('/delete/:channelId', deleteChannel);
router.get('/id/:channelId', getChannelDetailsById);

export default router;