import axios, { AxiosError } from "axios"
import { useCallback, useEffect } from "react"
import { Link, Outlet, useParams } from "react-router-dom"
import useUserStore from "../store/userStore"
import ProfileButton from "../components/ProfileButton"
import env from "../conf/env"
import CreateChannelForm from "../components/CreateChannelForm"
import useChannelStore from "../store/channelStore"
import ChannelCard from "../components/ChannelCard"
import useHandleAuthError from "../hooks/useHandleAuthError"
import { Toaster } from "sonner"
import useSocket from "../socket/useSocket"
import type { IMessageWithUser } from "../types/IMessage"
import type { IChannelWithMessage } from "../types/IChannel"

function Layout() {

  const user = useUserStore(s => s.user)
  const channels = useChannelStore(s => s.channels)
  const setChannels = useChannelStore(s => s.setChannels)
  const socket = useSocket()
  const { channelId } = useParams()

  const { handleAuthError } = useHandleAuthError()

  const fetchChannels = useCallback(async () => {
    try {
      if (!user) return
      const channels = await axios.get(`${env.SERVER_ENDPOINT}/channels/joined/${user.id}`, { withCredentials: true })
      setChannels(channels.data.channels)
    } catch (error) {
      handleAuthError(error as AxiosError)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setChannels, user])

  useEffect(() => {
    fetchChannels()
  }, [fetchChannels])

  useEffect(() => {
    if (!socket.connected || !socket.socket || !channels) return

    // const handleIncomingMessage = (message: IMessageWithUser) => {
    //   if (channelId) return
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

    const channelIds = channels.map(c => c.id.toString())
    socket.socket.emit("joinChannel", channelIds)
    // socket.socket.on("message", handleIncomingMessage)

    return () => {
      if (socket.socket) {
        // socket.socket.off("message", handleIncomingMessage)
        socket.socket.off("channelJoined");
      }
    }
  }, [channels, socket])

  return (
    <div>
      <div className="flex w-full h-screen max-h-screen overflow-hidden bg-zinc-900 text-zinc-100">
        <div className="w-[250px] py-6 px-4 bg-zinc-800/50">
          <h3 className="flex justify-between items-center">
            <Link className="text-2xl font-semibold" to="/">TechyScord</Link>
            <CreateChannelForm />
          </h3>
          <input type="text" placeholder="Search a channel" className="my-4 w-full py-2 px-4 bg-zinc-700/50 rounded-md" />
          <section>
            {channels.length > 0 && channels.map(({ id, name, owner_id }) => (
              <ChannelCard id={id} key={id} name={name} isOwner={owner_id?.toString() === user?.id.toString()} />
            ))}
          </section>
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