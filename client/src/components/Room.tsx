import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
} from '@livekit/components-react';
import { Room, Track } from 'livekit-client';
import '@livekit/components-styles';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import env from '../conf/env';
import useUserStore from '../store/userStore';
import { Loader2 } from 'lucide-react';
import useSocket from '../socket/useSocket';
import useServerStore from '../store/serverStore';

export default function App() {
  const [loading, setLoading] = useState(true)
  const [room] = useState(() => new Room({
    // Optimize video quality for each participant's screen
    adaptiveStream: true,
    // Enable automatic audio/video quality optimization
    dynacast: true,
  }));

  const { channelId, serverId } = useParams()
  const user = useUserStore(s => s.user)
  const addRoomParticipant = useServerStore(s => s.addRoomParticipant)
  const removeRoomParticipant = useServerStore(s => s.removeRoomParticipant)
  const socket = useSocket()

  // Connect to room
  useEffect(() => {
    if (!user?.username || !channelId || !socket.socket || !serverId) return;

    const s = socket.socket;
    let mounted = true;

    const connect = async () => {
      setLoading(true);

      const res = await axios.post(`${env.SERVER_ENDPOINT}/videocall/get-token`, {
        room: channelId,
        identity: user?.username
      }, { withCredentials: true });

      const token = await res.data.token;

      if (mounted) {
        await room.connect(env.LIVEKIT_URL, token);
        setLoading(false);
        s.emit('userJoined', { room: channelId, serverId });
        addRoomParticipant(channelId);
      }

    };
    connect();

    return () => {
      s.emit("userLeft", { room: channelId, serverId });
      removeRoomParticipant(channelId);
      mounted = false;
      room.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, room, serverId, socket.socket, user?.username]);

  if (loading) return <div className='h-full w-full p-4 bg-zinc-900/10'>
    <div className='h-full w-full flex justify-center items-center rounded-xl bg-zinc-800/80'>
      <p className='text-zinc-300 flex space-x-2'>
        <Loader2 className='animate-spin' />
        <span>Joining...</span>
      </p>
    </div>
  </div>;

  return (
    <RoomContext.Provider value={room}>
      <div data-lk-theme="default" style={{ height: '100vh' }}>
        {/* Your custom component with basic video conferencing functionality. */}
        <MyVideoConference />
        {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
        <RoomAudioRenderer />
        {/* Controls for the user to start/stop audio, video, and screen share tracks */}
        <ControlBar />
      </div>
    </RoomContext.Provider>
  );
}

function MyVideoConference() {
  // `useTracks` returns all camera and screen share tracks. If a user
  // joins without a published camera track, a placeholder track is returned.
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );
  return (
    <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
      {/* The GridLayout accepts zero or one child. The child is used
      as a template to render all passed in tracks. */}
      <ParticipantTile />
    </GridLayout>
  );
}