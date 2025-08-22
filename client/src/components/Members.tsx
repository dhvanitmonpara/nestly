import { useCallback, useEffect, useState } from "react";
import useSocket from "../socket/useSocket";
import { useParams } from "react-router-dom";
import useUserStore from "../store/userStore";
import useHandleAuthError from "../hooks/useHandleAuthError";
import type { AxiosError } from "axios";
import axios from "axios";
import env from "../conf/env";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import type { IUser } from "../types/IUser";
import type { IncomingMemberType } from "../types/IMember";

function Members() {
  const [members, setMembers] = useState<IncomingMemberType[]>([]);
  const [loading, setLoading] = useState(true);

  const socket = useSocket();
  const user = useUserStore((s) => s.user);
  const { serverId, conversationId } = useParams<{
    serverId: string;
    conversationId: string;
  }>();

  const { handleAuthError } = useHandleAuthError();

  const handleFetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setMembers([]);
      if (!socket.socket) return;
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
          if (u.user_id === user?.id) {
            return { ...u, isOnline: true };
          }
          return u;
        });

        setMembers([
          ...users,
          {
            ...res.data.owner,
            isOwner: true,
            isOnline: user?.id === res.data.owner.user_id,
          },
        ]);
        socket.socket.emit("userOnline", { serverId });
      } else {
        const oppositeUser: IncomingMemberType = {
          user: res.data.users.find((u: IUser) => u.id !== user?.id),
          server_id: Number(conversationId ?? "0"),
          user_id: res.data.users.find((u: IUser) => u.id !== user?.id)?.id,
          isOnline: false,
          isOwner: false,
        };
        if (oppositeUser) {
          setMembers([oppositeUser]);
        }
        socket.socket.emit("userOnlineDM", { conversationId });
      }
    } catch (error) {
      handleAuthError(error as AxiosError);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId, socket.socket, user?.id, conversationId]);

  useEffect(() => {
    handleFetchMembers();
  }, [handleFetchMembers]);

  useEffect(() => {
    if (!socket.socket || (!serverId && !conversationId)) return;

    const s = socket.socket;

    s.on("previousOnlineUsers", (data: IncomingMemberType[]) => {
      setMembers((prev) =>
        prev.map((user) => {
          const found = data.find((u) => u.user_id === user.user_id);
          return found ? { ...user, isOnline: true } : user;
        })
      );
    });

    s.on("userGotOffline", (data) => {
      setMembers((prev) =>
        prev.map((user) => {
          if (user.user_id === data.userId) {
            return {
              ...user,
              isOnline: false,
            };
          }
          return user;
        })
      );
    });

    s.on("userGotOnline", (data: IncomingMemberType) => {
      if (
        data.server_id.toString() === serverId ||
        data.server_id.toString() === conversationId
      ) {
        setMembers((prev) => [
          ...prev.map((user) => {
            if (user.user_id !== data.user_id) {
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

    s.on("userGotOfflineDM", (data: IncomingMemberType) => {
      setMembers((prev) =>
        prev.map((user) => {
          if (user.user_id !== data.user_id) {
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

    s.on("userGotOnlineDM", (data: IncomingMemberType) => {
      if (data.user_id === user?.id) return; // Ignore own online status
      if (data.server_id.toString() === conversationId) {
        setMembers((prev) =>
          prev.map((user) => {
            if (user.user_id === data.user_id) {
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

    return () => {
      s.off("previousOnlineUsers");
      s.off("userGotOnlineDM");
      s.off("userGotOfflineDM");
      s.off("userGotOnline");
      s.off("userGotOffline");
    };
  }, [conversationId, serverId, socket.socket, user?.id]);

  if (!socket.socket || (!serverId && !conversationId)) return;

  return (
    <div className="h-full overflow-y-auto w-96 bg-zinc-800">
      <div className="p-4 font-semibold flex">
        <span className="text-zinc-300">Members</span>
        {loading ? (
          <Skeleton className="bg-zinc-700 rounded-xl w-10 ml-2 text-xs" />
        ) : (
          <span className="bg-zinc-900 rounded-xl w-10 ml-2 text-xs flex justify-center items-center">
            {members.length}
          </span>
        )}
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
        <MemberList members={members} />
      ) : (
        <div className="h-40 flex justify-center items-center text-zinc-400 text-sm">
          No users online
        </div>
      )}
    </div>
  );
}

function MemberList({ members }: { members: IncomingMemberType[] }) {
  // Split into groups
  const owners = members.filter((m) => m.isOwner);
  const online = members.filter((m) => !m.isOwner && m.isOnline);
  const offline = members.filter((m) => !m.isOwner && !m.isOnline);

  return (
    <div>
      {/* Owners */}
      {owners.length > 0 && (
        <div>
          <h3 className="text-xs px-4 font-bold text-gray-500 mb-1">
            OWNER — {owners.length}
          </h3>
          {owners.map((user) => (
            <UserCard key={user.user_id} user={user} />
          ))}
        </div>
      )}

      {/* Online Members */}
      {online.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs px-4 font-bold text-gray-500 mb-1">
            ONLINE — {online.length}
          </h3>
          {online.map((user) => (
            <UserCard key={user.user_id} user={user} />
          ))}
        </div>
      )}

      {/* Offline Members */}
      {offline.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs px-4 font-bold text-gray-500 mb-1">
            OFFLINE — {offline.length}
          </h3>
          {offline.map((user) => (
            <UserCard key={user.user_id} user={user} />
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

const UserCard = ({ user }: { user: IncomingMemberType }) => {
  return (
    <div
      key={user.user_id}
      className="px-4 py-2 border-b flex justify-start space-x-2 border-zinc-700"
    >
      <div className="relative font-semibold bg-zinc-900 rounded-full w-8 h-8 flex items-center justify-center">
        {user.user.username?.slice(0, 2)}
        {user.isOnline && (
          <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full"></span>
        )}
      </div>
      <div>{user.user.username}</div>
    </div>
  );
};

export default Members;
