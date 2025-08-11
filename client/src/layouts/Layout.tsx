import axios, { AxiosError } from "axios"
import { useCallback, useEffect } from "react"
import { Link, Outlet, useParams } from "react-router-dom"
import useUserStore from "../store/userStore"
import ProfileButton from "../components/ProfileButton"
import env from "../conf/env"
import CreateChannelForm from "../components/CreateServerForm"
import useServerStore from "../store/serverStore"
import useHandleAuthError from "../hooks/useHandleAuthError"
import { Toaster } from "sonner"
import useSocket from "../socket/useSocket"
import ServerIcon from "../components/ServerIcon"
import Channels from "../components/Channels"

function Layout() {

  const user = useUserStore(s => s.user)
  const servers = useServerStore(s => s.servers)
  const setServers = useServerStore(s => s.setServers)
  const socket = useSocket()
  const { serverId } = useParams()

  const { handleAuthError } = useHandleAuthError()

  const fetchServers = useCallback(async () => {
    try {
      if (!user) return
      const servers = await axios.get(`${env.SERVER_ENDPOINT}/servers/joined/${user.id}`, { withCredentials: true })
      setServers(servers.data.servers)
    } catch (error) {
      handleAuthError(error as AxiosError)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setServers, user])

  useEffect(() => {
    fetchServers()
  }, [fetchServers])

  useEffect(() => {
    if (!socket.connected || !socket.socket || !servers) return

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

    socket.socket.on("channelJoined", (channelId) => {
      console.log(`✅ Joined channel: ${channelId}`);
    });

    const channelIds = servers.flatMap(s => s?.channels?.map(c => c.id.toString()))
    socket.socket.emit("joinChannel", channelIds)
    // socket.socket.on("message", handleIncomingMessage)

    return () => {
      if (socket.socket) {
        // socket.socket.off("message", handleIncomingMessage)
        socket.socket.off("channelJoined");
      }
    }
  }, [servers, socket])

  return (
    <div>
      <div className="flex w-full h-screen max-h-screen overflow-hidden bg-zinc-900 text-zinc-100">
        <section className="p-1 space-y-1">
          {servers.length > 0 && servers.map(({ id, name, owner_id }) => (
            <ServerIcon id={id} key={id} name={name} isOwner={owner_id?.toString() === user?.id.toString()} />
          ))}
          <CreateChannelForm />
        </section>
        <div className="w-[250px] py-6 px-4 bg-zinc-800/50">
          <h3 className="flex justify-between items-center">
            <Link className="text-xl font-semibold" to="/">{servers.find(s => s.id.toString() === serverId)?.name || "TechyScord"}</Link>
          </h3>
          <input type="text" placeholder="Search a channel" className="my-4 w-full py-2 px-4 bg-zinc-700/50 rounded-md" />
          <Channels />
        </div>
        <div className="w-full">
          <Outlet />
        </div>
        <ProfileButton />
      </div>
      <Toaster />
    </div>
  )
}

export default Layout