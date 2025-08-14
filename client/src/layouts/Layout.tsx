import axios, { AxiosError } from "axios";
import { useCallback, useEffect } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useParams,
} from "react-router-dom";
import useUserStore from "../store/userStore";
import ProfileButton from "../components/ProfileButton";
import env from "../conf/env";
import CreateChannelForm from "../components/CreateServerForm";
import useServerStore from "../store/serverStore";
import useHandleAuthError from "../hooks/useHandleAuthError";
import { Toaster } from "sonner";
import useSocket from "../socket/useSocket";
import ServerIcon from "../components/ServerIcon";
import Channels from "../components/Channels";
import { Separator } from "../components/ui/separator";
import { FaMessage } from "react-icons/fa6";
import Conversations from "../components/Conversations";
import UpdateServerForm from "../components/UpdateServerForm";

function Layout() {
  const user = useUserStore((s) => s.user);
  const servers = useServerStore((s) => s.servers);
  const setServers = useServerStore((s) => s.setServers);
  const setRooms = useServerStore((s) => s.setRooms);
  const addRoomParticipant = useServerStore((s) => s.addRoomParticipant);
  const removeRoomParticipant = useServerStore((s) => s.removeRoomParticipant);
  const socket = useSocket();
  const { serverId } = useParams();
  const location = useLocation().pathname;

  const { handleAuthError } = useHandleAuthError();

  const fetchServers = useCallback(async () => {
    try {
      if (!user) return;
      const servers = await axios.get(
        `${env.SERVER_ENDPOINT}/servers/joined/${user.id}`,
        { withCredentials: true }
      );
      setServers(servers.data.servers);
    } catch (error) {
      handleAuthError(error as AxiosError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setServers, user]);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  useEffect(() => {
    if (!socket.connected || !socket.socket || !servers || !serverId) return;

    const s = socket.socket;

    // const handleIncomingMessage = (message: IMessageWithUser) => {
    //   if (serverId) return
    //   setChannels((prev) => {
    //     return {
    //       ...prev,
    //       messages: prev ? [
    //         ...prev.messages,
    //         message
    //       ] : message
    //     } as IChannelWithMessage
    //   })
    // }

    s.on("serverJoined", (serverId) => {
      console.log(`✅ Joined server: ${serverId}`);
    });

    s.on("roomsList", ({ rooms }) => {
      setRooms(rooms);
    });

    s.on("notifyUserJoined", (room) => {
      console.log(`User joined room: ${room}`);
      addRoomParticipant(room);
    });

    s.on("notifyUserLeft", (room) => {
      removeRoomParticipant(room);
    });

    const serverIds = servers.map((s) => s.id.toString());
    s.emit("joinServer", serverIds);
    // s.on("message", handleIncomingMessage)

    return () => {
      if (socket.socket) {
        // socket.socket.off("message", handleIncomingMessage)
        s.off("serverJoined");
        s.off("roomsList");
        s.off("notifyUserJoined");
        s.off("notifyUserLeft");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId, servers, socket]);

  return (
    <div>
      <div className="flex w-full h-screen max-h-screen overflow-hidden bg-zinc-900 text-zinc-100">
        <section className="p-1 space-y-1">
          <NavLink
            to="/dm"
            className={({ isActive }) =>
              `flex items-center justify-center select-none h-10 w-10 mt-1 transition-all duration-50 font-semibold ${
                isActive
                  ? "bg-violet-500 rounded-xl"
                  : "bg-zinc-700/50 rounded-full text-zinc-300 hover:rounded-xl"
              }  cursor-pointer`
            }
          >
            <FaMessage />
          </NavLink>
          {servers.length > 0 &&
            servers.map(({ id, name, owner_id }) => (
              <ServerIcon
                id={id}
                key={id}
                name={name}
                isOwner={owner_id?.toString() === user?.id.toString()}
              />
            ))}
          <Separator className="bg-zinc-800 mt-1.5" />
          <CreateChannelForm />
        </section>
        <div className="w-[250px] py-6 px-4 bg-zinc-800/50 relative">
          <Link
            className="text-xl font-semibold flex justify-between items-center group"
            to={location.includes("/dm") ? "/dm" : `/s/${serverId}`}
          >
            <span className="inline-block">
              {servers.find((s) => s.id.toString() === serverId)?.name ||
                (location.includes("/dm") ? "Direct Messages" : "TechyScord")}
            </span>
            {serverId && (
              <span className="inline-block">
                <UpdateServerForm
                  id={Number(serverId)}
                  name={
                    servers.find((s) => s.id.toString() === serverId)?.name ||
                    ""
                  }
                />
              </span>
            )}
          </Link>
          <input
            type="text"
            placeholder="Search a channel"
            className="my-4 w-full py-2 px-4 bg-zinc-700/50 rounded-md"
          />
          {location.includes("/dm") ? <Conversations /> : <Channels />}
          <ProfileButton />
        </div>
        <div className="w-full">
          <Outlet />
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default Layout;
