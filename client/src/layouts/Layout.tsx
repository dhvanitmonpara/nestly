import axios, { AxiosError } from "axios";
import { useCallback, useEffect } from "react";
import { Outlet, useParams, useSearchParams } from "react-router-dom";
import useUserStore from "../store/userStore";
import env from "../conf/env";
import useServerStore from "../store/serverStore";
import useHandleAuthError from "../hooks/useHandleAuthError";
import { toast, Toaster } from "sonner";
import useSocket from "../socket/useSocket";
import type { IServer } from "../types/IServer";
import Members from "../components/Members";
import Sidebar from "../components/Sidebar";
import { IoMenu } from "react-icons/io5";
import useFeatureStore from "../store/featureStore";
import Overlay from "../components/Overlay";

function Layout() {
  const user = useUserStore((s) => s.user);
  const servers = useServerStore((s) => s.servers);
  const setServers = useServerStore((s) => s.setServers);
  const setRooms = useServerStore((s) => s.setRooms);
  const addRoomParticipant = useServerStore((s) => s.addRoomParticipant);
  const removeRoomParticipant = useServerStore((s) => s.removeRoomParticipant);
  const socket = useSocket();
  const { serverId } = useParams();
  const [searchParams] = useSearchParams();
  const joinedServerId = searchParams.get("joinServer");

  const { handleAuthError } = useHandleAuthError();

  const fetchJoinedServerDetails = async (servers: IServer[]) => {
    if (!joinedServerId) return null;
    if (servers.find((s) => s.id.toString() === joinedServerId)) return null;
    try {
      const res = await axios.get(
        `${env.SERVER_ENDPOINT}/servers/id/${joinedServerId}`,
        { withCredentials: true }
      );

      if (res.status !== 200) {
        toast.error("Failed to get joined server");
        return;
      }

      return res.data.server;
    } catch (error) {
      handleAuthError(error as AxiosError);
    }
  };

  const fetchServers = useCallback(async () => {
    try {
      if (!user) return;
      const res = await axios.get(
        `${env.SERVER_ENDPOINT}/servers/joined/${user.id}`,
        { withCredentials: true }
      );

      const servers = res.data.servers;
      const joinedServer = await fetchJoinedServerDetails(servers);

      setServers(joinedServer ? [...servers, joinedServer] : servers);
    } catch (error) {
      handleAuthError(error as AxiosError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setServers, user, joinedServerId]);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  useEffect(() => {
    if (!socket.connected || !socket.socket || !servers || !serverId) return;

    const s = socket.socket;

    s.on("serverJoined", (serverId) => {
      console.log(`✅ Joined server: ${serverId}`);
    });

    s.on("roomsList", ({ rooms }) => {
      setRooms(rooms);
    });

    s.on("notifyUserJoined", (room) => {
      addRoomParticipant(room);
    });

    s.on("notifyUserLeft", (room) => {
      removeRoomParticipant(room);
    });

    const serverIds = servers.map((s) => s.id.toString());
    s.emit("joinServer", serverIds);

    return () => {
      if (socket.socket) {
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
        <Sidebar className="hidden sm:flex" />
        <div className="w-full">
          <Menu />
          <Outlet />
        </div>
        <Members className="hidden md:block" />
      </div>
      <Toaster />
    </div>
  );
}

const Menu = () => {
  const open = useFeatureStore((s) => s.sidebarOpen);
  const setOpen = useFeatureStore((s) => s.setSidebarOpen);
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="h-12 w-12 cursor-pointer sm:hidden z-50 fixed top-4 left-4 aspect-square flex justify-center items-center bg-zinc-800 hover:bg-zinc-700 transition-colors duration-300 rounded-md mr-2"
      >
        <IoMenu />
      </button>
      {open && <Overlay closeHandler={() => setOpen(false)} />}
      <Sidebar
        className={`flex sm:hidden fixed top-0 left-0 z-50 transition-all duration-300 h-full w-full xs:w-fit bg-zinc-900 ${
          open ? "" : "-translate-x-full"
        }`}
      />
    </>
  );
};

export default Layout;
