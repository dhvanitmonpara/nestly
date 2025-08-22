import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import env from "../conf/env";
import { toast } from "sonner";
import type { IChannel } from "../types/IChannel";
import ChannelCard from "./ChannelCard";
import useUserStore from "../store/userStore";
import useServerStore from "../store/serverStore";
import { Separator } from "../components/ui/separator";
import CreateChannelForm from "./CreateChannelForm";
import useSocket from "../socket/useSocket";

function Channels() {
  const [channels, setChannels] = useState<IChannel[]>([]);
  const [loading, setLoading] = useState(true);

  const socket = useSocket();
  const { serverId } = useParams();
  const user = useUserStore((s) => s.user);
  const rooms = useServerStore((s) => s.rooms);
  const server = useServerStore((s) =>
    s.servers.find((s) => s.id.toString() === serverId)
  );

  useEffect(() => {
    if(!socket.socket)return
    const s = socket.socket;

    const fetchChannels = async () => {
      try {
        setLoading(true);
        if (!serverId || !user) return;
        const res = await axios.get(
          `${env.SERVER_ENDPOINT}/channels/server/${serverId}`,
          { withCredentials: true }
        );
        if (res.status !== 200 && res.status !== 304) {
          toast.error("Failed to fetch channels");
          return;
        }
        setChannels(res.data.channels);

        if (s && res.data.channels.length > 0) {
          s.emit(
            "listRooms",
            res.data.channels
              .filter((c: IChannel) => c.type === "voice")
              .map((c: IChannel) => c.id.toString())
          );
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();

    return () => {
        s.emit("serverChange", { serverId });
    }
  }, [serverId, socket.socket, user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-1">
      {serverId && user?.id === server?.owner_id && (
        <CreateChannelForm setChannel={setChannels} />
      )}
      <Separator className="bg-zinc-800" />
      {serverId && channels.length > 0 ? (
        channels.map((channel) => {
          const count =
            rooms.find((r) => r.name === channel.id.toString())
              ?.participantsCount ?? 0;
          return (
            <ChannelCard
              key={channel.id}
              id={channel.id}
              name={channel.name}
              roomParticipantsCount={count}
              type={channel.type}
              setChannel={setChannels}
              isOwner={user?.id === server?.owner_id}
            />
          );
        })
      ) : (
        <div className="h-96 flex justify-center items-center">
          <p className="text-zinc-400 text-sm">No channels exists.</p>
        </div>
      )}
    </div>
  );
}

export default Channels;
