import { MdDelete, MdEdit } from "react-icons/md"
import type { IMessage } from "../types/IMessage"
import formatTimestamp from "../utils/formatTimeStampt"

function MessageCard({ chat }: { chat: IMessage }) {
    const color = `#${chat.user?.accent_color}`
    return (
        <div className="flex space-x-2 py-2 mx-6 group" key={chat.id}>
            {/* <img src={chat.user?.username.slice(0, 2)} alt={chat.user?.username} className="w-10 h-10 rounded-full" /> */}
            <div className="flex justify-center items-center bg-zinc-800 h-8 w-8 rounded-full font-semibold text-sm" style={{ color }}>
                {chat.user?.username.slice(0, 2)}
            </div>
            <div className="w-full">
                <div
                    className={`text-sm flex justify-start items-center space-x-2`}
                >
                    <span
                        className="text-xs"
                        style={{
                            color: color
                        }}
                    >
                        {chat.user?.username || "Unknown"}
                    </span>
                    <div className="space-x-3 flex items-center">
                        <span className="text-[0.70rem] text-zinc-500">{chat.createdAt ? formatTimestamp(chat.createdAt) : ""}</span>
                        <div className="divide-x divide-zinc-700">
                            <button className="text-zinc-500 text-xs hover:text-zinc-300 p-1 rounded-l-md opacity-0 group-hover:opacity-100 transition-all bg-zinc-800 hover:bg-zinc-700 cursor-pointer">
                                <MdEdit />
                            </button>
                            <button className="text-zinc-500 text-xs hover:text-zinc-300 p-1 rounded-r-md opacity-0 group-hover:opacity-100 transition-all bg-zinc-800 hover:bg-red-500 cursor-pointer">
                                <MdDelete />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="text-zinc-200 text-sm">{chat.content}</div>
            </div>
        </div>
    )
}

export default MessageCard