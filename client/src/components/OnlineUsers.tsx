import { useEffect, useState } from "react"
import useSocket from "../socket/useSocket";
import { useParams } from "react-router-dom";
import useUserStore from "../store/userStore";

type IncomingUserType = { userId: string, username: string, channelId: string, serverIds: string[] }


function OnlineUsers() {

    const [onlineUsers, setOnlineUsers] = useState<IncomingUserType[]>([])
    const socket = useSocket()
    const user = useUserStore(s => s.user)
    const { channelId, serverId } = useParams<{ channelId: string, serverId: string }>()

    useEffect(() => {
        setOnlineUsers([]);
        if (!socket.socket || !channelId || !serverId) return;

        const s = socket.socket;

        s.on("previousOnlineUsers", (data) => {
            const users = data.filter((u: IncomingUserType) => u.serverIds.includes(serverId) && u.channelId === channelId);
            console.log("Previous online users:", data, users);
            setOnlineUsers(users);
        });

        s.on("userGotOffline", (data) => {
            console.log("User got offline:", data);
            setOnlineUsers((prev) => prev.filter((user) => user.userId !== data.userId));
        });

        s.on("userGotOnline", (data) => {
            console.log("User got online:", data);
            if (data.userId === user?.id) return; // Ignore own online status
            if (data.serverId === serverId && data.channelId === channelId) {
                setOnlineUsers((prev) => [...prev, { userId: data.userId, username: data.username, channelId, serverIds: [serverId] }]);
            }
        });

        return () => {
            s.off("previousOnlineUsers");
            s.off("userGotOffline");
            s.off("userGotOnline");
        };
    }, [channelId, serverId, socket.socket, user?.id]);

    return (
        <div className="h-full overflow-y-auto w-96 bg-zinc-800">
            <div className="p-4 font-semibold text-lg flex">
                <span>
                    Online Users
                </span>
                <span className="bg-zinc-900 rounded-xl w-10 ml-2 text-xs flex justify-center items-center">{onlineUsers.length}</span>
            </div>
            {onlineUsers.length > 0 ? onlineUsers.map((user) => (
                <div key={user.userId} className="px-4 py-2 border-b flex justify-start space-x-2 border-zinc-700">
                    <div className="font-semibold bg-zinc-900 rounded-full w-8 h-8 flex items-center justify-center">
                        {user.username.slice(0, 2)}
                    </div>
                    <div>
                        {user.username}
                    </div>
                </div>
            )) : <div className="h-40 flex justify-center items-center text-zinc-400 text-sm">No users online</div>}
        </div>
    )
}

export default OnlineUsers