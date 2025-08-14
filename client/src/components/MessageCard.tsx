import { MdDelete, MdEdit } from "react-icons/md";
import formatTimestamp from "../utils/formatTimeStampt";

function MessageCard({
  id,
  username,
  accent_color,
  content,
  createdAt,
  continuesMessage = false,
}: {
  id: string;
  username: string;
  accent_color: string;
  content: string;
  createdAt: string | null;
  continuesMessage?: boolean;
}) {
  const color = `#${accent_color}`;
  return (
    <div
      className={`flex space-x-2 ${
        continuesMessage ? "py-0.5" : "pt-2 mt-2 border-t border-zinc-800"
      } mx-6 group`}
      key={id}
    >
      {continuesMessage ? (
        <div className="w-8 text-[0.60rem] opacity-0 group-hover:opacity-100 text-gray-400 line-clamp-1">
          {createdAt ? formatTimestamp(createdAt) : ""}
        </div>
      ) : (
        <div
          className="flex justify-center items-center bg-zinc-800 h-8 w-8 rounded-full font-semibold text-sm"
          style={{ color }}
        >
          {username.slice(0, 2)}
        </div>
      )}
      <div className="w-full">
        {!continuesMessage && (
          <div className={`text-sm flex justify-start items-center space-x-2`}>
            <span
              className="text-xs"
              style={{
                color: color,
              }}
            >
              {username || "Unknown"}
            </span>
            <div className="space-x-3 flex items-center justify-between w-full">
              <span className="text-[0.70rem] text-zinc-500">
                {createdAt ? formatTimestamp(createdAt) : ""}
              </span>
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
        )}
        <div className="text-zinc-200 text-sm flex justify-between">
          <span>{content}</span>
          {continuesMessage && (
            <div className="space-x-3 flex items-center">
              <div className="divide-x divide-zinc-700">
                <button className="text-zinc-500 text-xs hover:text-zinc-300 p-1 rounded-l-md opacity-0 group-hover:opacity-100 transition-all bg-zinc-800 hover:bg-zinc-700 cursor-pointer">
                  <MdEdit />
                </button>
                <button className="text-zinc-500 text-xs hover:text-zinc-300 p-1 rounded-r-md opacity-0 group-hover:opacity-100 transition-all bg-zinc-800 hover:bg-red-500 cursor-pointer">
                  <MdDelete />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageCard;
