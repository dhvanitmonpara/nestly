import { useCallback, useEffect, useState } from "react";
import useSocket from "../socket/useSocket";
import { useNavigate, useParams } from "react-router-dom";
import useUserStore from "../store/userStore";
import useHandleAuthError from "../hooks/useHandleAuthError";
import type { AxiosError } from "axios";
import axios from "axios";
import env from "../conf/env";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import type { IUser } from "../types/IUser";
import type { IncomingMemberType } from "../types/IMember";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { HiDotsHorizontal } from "react-icons/hi";
import { IoMdClose, IoMdExit } from "react-icons/io";
import clsx from "clsx";

function Members({
  className,
  closeHandler,
}: {
  className?: string;
  closeHandler?: () => void;
}) {
  const [members, setMembers] = useState<IncomingMemberType[]>([]);
  const [loading, setLoading] = useState(true);

  const { socket } = useSocket();
  const user = useUserStore((s) => s.user);
  const navigate = useNavigate();
  const { serverId, conversationId } = useParams<{
    serverId: string;
    conversationId: string;
  }>();

  const { handleAuthError } = useHandleAuthError();

  const handleFetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setMembers([]);
      if (!socket) return;
      if (!serverId && !conversationId) return;

      const endpoint = serverId
        ? `${env.SERVER_ENDPOINT}/servers/members/${serverId}`
        : `${env.SERVER_ENDPOINT}/dms/messages/${conversationId}/users`;

      const res = await axios.get(endpoint, { withCredentials: true });

      if (res.status !== 200 && res.status !== 300) {
        toast.error("Failed to fetch members");
        return;
      }

      if (serverId) {
        const users = res.data.members.map((u: IncomingMemberType) => {
          if (u.userId === user?.id) {
            return { ...u, isOnline: true };
          }
          return u;
        });

        setMembers([
          ...users,
          {
            ...res.data.owner,
            isOwner: true,
            isOnline: user?.id === res.data.owner.userId,
          },
        ]);
        socket.emit("userOnline", { serverId });
      } else {
        const oppositeUser: IncomingMemberType = {
          user: res.data.users.find((u: IUser) => u.id !== user?.id),
          serverId: Number(conversationId ?? "0"),
          userId: res.data.users.find((u: IUser) => u.id !== user?.id)?.id,
          isOnline: false,
          isOwner: false,
        };
        if (oppositeUser) {
          setMembers([oppositeUser]);
        }
        socket.emit("userOnlineDM", { conversationId });
      }
    } catch (error) {
      handleAuthError(error as AxiosError);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId, socket, user?.id, conversationId]);

  useEffect(() => {
    handleFetchMembers();
  }, [handleFetchMembers]);

  useEffect(() => {
    if (!socket || (!serverId && !conversationId)) return;

    socket.on("previousOnlineUsers", (data: IncomingMemberType[]) => {
      setMembers((prev) =>
        prev.map((user) => {
          const found = data.find((u) => u.userId === user.userId);
          return found ? { ...user, isOnline: true } : user;
        })
      );
    });

    socket.on("userGotOffline", (data) => {
      setMembers((prev) =>
        prev.map((user) => {
          if (user.userId === data.userId) {
            return {
              ...user,
              isOnline: false,
            };
          }
          return user;
        })
      );
    });

    socket.on("userGotOnline", (data: IncomingMemberType) => {
      if (
        data.serverId.toString() === serverId ||
        data.serverId.toString() === conversationId
      ) {
        setMembers((prev) => [
          ...prev.map((user) => {
            if (user.userId !== data.userId) {
              return user;
            } else {
              return {
                ...user,
                isOnline: true,
              };
            }
          }),
        ]);
      }
    });

    socket.on("userGotOfflineDM", (data: IncomingMemberType) => {
      setMembers((prev) =>
        prev.map((user) => {
          if (user.userId !== data.userId) {
            return user;
          } else {
            return {
              ...user,
              isOnline: false,
            };
          }
        })
      );
    });

    socket.on("userGotOnlineDM", (data: IncomingMemberType) => {
      if (data.userId === user?.id) return; // Ignore own online status
      if (data.serverId.toString() === conversationId) {
        setMembers((prev) =>
          prev.map((user) => {
            if (user.userId === data.userId) {
              return {
                ...user,
                isOnline: true,
              };
            }
            return user;
          })
        );
      }
    });

    socket.on("userKicked", (data) => {
      setMembers((prev) => prev.filter((user) => user.userId !== data.userId));
      if (data.userId === user?.id) navigate("/");
    });

    return () => {
      socket.off("previousOnlineUsers");
      socket.off("userGotOnlineDM");
      socket.off("userGotOfflineDM");
      socket.off("userGotOnline");
      socket.off("userGotOffline");
      socket.off("userKicked");
    };
  }, [conversationId, navigate, serverId, socket, user?.id]);

  if (!socket || (!serverId && !conversationId)) return;

  return (
    <div className={clsx("h-full overflow-y-auto w-96 bg-zinc-800", className)}>
      <div className="p-4 font-semibold flex justify-between">
        <div className="flex">
          <span className="text-zinc-300">Members</span>
          {loading ? (
            <Skeleton className="bg-zinc-700 rounded-xl w-10 ml-2 tex`t-xs" />
          ) : (
            <span className="bg-zinc-900 rounded-xl w-10 ml-2 text-xs flex justify-center items-center">
              {members.length}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (closeHandler) closeHandler();
          }}
          className={`transition-all duration-300 text-zinc-400 hover:text-zinc-300 md:hidden cursor-pointer h-8 w-8 flex justify-center items-center rounded-full bg-zinc-700`}
        >
          <IoMdClose />
        </button>
      </div>
      {loading ? (
        <>
          <Skeleton className="h-4 w-24 mx-4 my-2 bg-zinc-700" />
          <UserCardSkeleton key={0} />
          <Skeleton className="h-4 w-24 mx-4 my-2 bg-zinc-700" />
          <UserCardSkeleton key={1} />
          <UserCardSkeleton key={2} />
        </>
      ) : members.length > 0 ? (
        <MemberList setMembers={setMembers} members={members} />
      ) : (
        <div className="h-40 flex justify-center items-center text-zinc-400 ">
          No users online
        </div>
      )}
    </div>
  );
}

function MemberList({
  members,
  setMembers,
}: {
  members: IncomingMemberType[];
  setMembers: React.Dispatch<React.SetStateAction<IncomingMemberType[]>>;
}) {
  // Split into groups
  const owners = members.filter((m) => m.isOwner);
  const online = members.filter((m) => !m.isOwner && m.isOnline);
  const offline = members.filter((m) => !m.isOwner && !m.isOnline);

  const user = useUserStore((s) => s.user);
  const isOwner =
    user?.id !== undefined && owners.some((o) => o.userId === user.id);

  return (
    <div>
      {/* Owners */}
      {owners.length > 0 && (
        <div className="border-b border-zinc-700">
          <h3 className="text-xs px-4 font-bold text-gray-500 mb-1">
            OWNER — {owners.length}
          </h3>
          {owners.map((user) => (
            <UserCard
              setMembers={setMembers}
              isOwner={false}
              key={user.userId}
              user={user}
            />
          ))}
        </div>
      )}

      {/* Online Members */}
      {online.length > 0 && (
        <div className="border-b border-zinc-700 mt-4">
          <h3 className="text-xs px-4 font-bold text-gray-500 mb-1">
            ONLINE — {online.length}
          </h3>
          {online.map((user) => (
            <UserCard
              setMembers={setMembers}
              isOwner={isOwner}
              key={user.userId}
              user={user}
            />
          ))}
        </div>
      )}

      {/* Offline Members */}
      {offline.length > 0 && (
        <div className="border-b border-zinc-700 mt-4">
          <h3 className="text-xs px-4 font-bold text-gray-500 mb-1">
            OFFLINE — {offline.length}
          </h3>
          {offline.map((user) => (
            <UserCard
              setMembers={setMembers}
              isOwner={isOwner}
              key={user.userId}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="px-4 py-2 border-b flex justify-start items-center space-x-2 border-zinc-700">
      {/* Avatar placeholder */}
      <div className="relative">
        <Skeleton className="rounded-full w-8 h-8 bg-zinc-700" />
      </div>

      {/* Username placeholder */}
      <Skeleton className="h-4 w-24 bg-zinc-700" />
    </div>
  );
}

const UserCard = ({
  user,
  isOwner,
  setMembers,
}: {
  user: IncomingMemberType;
  isOwner: boolean;
  setMembers: React.Dispatch<React.SetStateAction<IncomingMemberType[]>>;
}) => {
  const { serverId } = useParams();
  const { socket } = useSocket();

  const handleKickUser = async () => {
    if (!user || !isOwner || !socket) return;
    try {
      if (!serverId) return;
      const res = await axios.delete(
        `${env.SERVER_ENDPOINT}/servers/${serverId}/members/${user.userId}/kick`,
        { withCredentials: true }
      );
      if (res.status !== 200) {
        toast.error(`Failed to kick ${user.user.username}`);
        return;
      }

      socket.emit("userKicked", { userId: user.userId, serverId });

      toast.success(`Successfully kicked ${user.user.username}`);
      setMembers((prev) => prev.filter((m) => m.userId !== user.userId));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      key={user.userId}
      className="px-4 py-2 group flex justify-start space-x-2.5"
    >
      <div className="relative aspect-square z-10 font-semibold bg-zinc-900 rounded-full w-8 h-8 flex items-center justify-center">
        {user.user.username?.slice(0, 2)}
        {user.isOnline && (
          <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full"></span>
        )}
      </div>
      <div className="w-full h-8 flex items-center">
        <p>{user.user.displayName}</p>
      </div>
      {isOwner && (
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="hover:bg-zinc-300 hover:text-zinc-900 md:opacity-0 md:group-hover:opacity-100 transition-colors px-2 py-1 my-1 rounded-full cursor-pointer"
          >
            <HiDotsHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-zinc-800 text-zinc-300 border-zinc-800">
            <DropdownMenuItem
              variant="destructive"
              onClick={handleKickUser}
              className="text-zinc-100 flex justify-start items-center space-x-1"
            >
              <IoMdExit className="text-zinc-300" />
              <span className=" font-semibold text-zinc-300">Kick</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default Members;
