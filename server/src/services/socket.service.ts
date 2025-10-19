import { DefaultEventsMap, Server, Socket } from "socket.io";
import videocallService from "./videocall.service";
import { createDirectMessage, createMessage } from "./message.service";

type SocketType = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;

class SocketService {
  listenSocket = (socket: SocketType, io: Server) => {
    socket.userId = socket.handshake.auth.userId as string;
    socket.username = socket.handshake.auth.username as string;
    socket.accentColor = socket.handshake.auth.accentColor as string;
    socket.displayName = socket.handshake.auth.displayName as string;

    const handleUserGotOffline = () => {
      const serverIds = Array.from(socket.rooms);
      socket.to(serverIds).emit("userGotOffline", { userId: socket.userId });
    };

    socket.on("joinServer", (server_ids) => {
      socket.join(server_ids);
      socket.emit("serverJoined", server_ids);
    });

    socket.on("message", (msg) => {
      if (msg.user?.id) {
        createMessage(msg.content, msg.user.id, msg.channelId);
      } else {
        createDirectMessage(msg.content, msg.senderId, msg.conversationId);
      }
      socket.to(msg.serverId).emit("message", msg);
    });

    socket.on("userOnlineDM", ({ conversationId }) => {
      socket.join(conversationId);
      socket.to(conversationId).emit("userGotOnlineDM", {
        server_id: conversationId,
        user: {
          accentColor: socket.accentColor,
          displayName: socket.displayName,
          username: socket.username,
        },
        user_id: socket.userId,
        isOnline: true,
      });
      const onlineUsersSockets = io.sockets.adapter.rooms.get(conversationId);
      const onlineUsers = Array.from(onlineUsersSockets || []).map(
        (socketId) => {
          const sock = io.sockets.sockets.get(socketId); // socket instance
          if (sock && sock.userId) {
            return {
              server_id: Array.from(sock.rooms),
              user: {
                accentColor: sock.accentColor,
                displayName: sock.displayName,
                username: sock.username,
              },
              user_id: sock.userId,
              isOnline: true,
            };
          }
        }
      );
      socket.emit(
        "previousOnlineUsers",
        onlineUsers.filter((u) => u?.user_id !== socket.userId)
      );
    });

    socket.on("userGotOnlineDM", ({ conversationId }) => {
      socket.to(conversationId).emit("userGotOnlineDM", {
        server_id: conversationId,
        user: {
          accentColor: socket.accentColor,
          displayName: socket.displayName,
          username: socket.username,
        },
        user_id: socket.userId,
        isOnline: true,
      });
    });

    socket.on("userGotOfflineDM", ({ conversationId }) => {
      socket.to(conversationId).emit("userGotOfflineDM", {
        user_id: socket.userId,
        conversation_id: conversationId,
      });
    });

    socket.on("userOnline", ({ serverId }) => {
      socket.to(serverId).emit("userGotOnline", {
        server_id: serverId,
        user: {
          accentColor: socket.accentColor,
          displayName: socket.displayName,
          username: socket.username,
        },
        user_id: socket.userId,
        isOnline: true,
      });
      const onlineUsersSockets = io.sockets.adapter.rooms.get(serverId);
      const onlineUsers = Array.from(onlineUsersSockets || []).map(
        (socketId) => {
          const sock = io.sockets.sockets.get(socketId); // socket instance
          if (sock && sock.userId) {
            return {
              server_id: Array.from(sock.rooms),
              user: {
                accentColor: sock.accentColor,
                displayName: sock.displayName,
                username: sock.username,
              },
              user_id: sock.userId,
              isOnline: true,
            };
          }
        }
      );
      socket.emit(
        "previousOnlineUsers",
        onlineUsers.filter((u) => u?.user_id !== socket.userId)
      );
    });

    socket.on("disconnect", () => {
      handleUserGotOffline();
    });

    socket.on("typing", ({ channelId, serverId }) => {
      socket
        .to(serverId)
        .emit("user_typing", { username: socket.displayName, channelId });
    });

    socket.on("stop_typing", ({ channelId, serverId }) => {
      socket
        .to(serverId)
        .emit("user_stop_typing", { username: socket.displayName, channelId });
    });

    socket.on("userKicked", ({ userId, serverId }) => {
      socket.to(serverId).emit("userKicked", { userId });
    });

    socket.on("listRooms", async (roomNames: string[]) => {
      const rooms = await videocallService.listRooms();
      const participantsPerRoom = await rooms
        ?.filter((r) => roomNames.includes(r.name))
        .map((r) => ({ name: r.name, participantsCount: r.numParticipants }));
      socket.emit("roomsList", { rooms: participantsPerRoom });
    });

    socket.on("userJoined", ({ room, serverId }) => {
      socket.to(serverId).emit("notifyUserJoined", room);
    });

    socket.on("userLeft", ({ room, serverId }) => {
      socket.to(serverId).emit("notifyUserLeft", room);
    });

    socket.on("deleteRoom", (roomName) => {
      videocallService.deleteRoom(roomName);
    });

    socket.on("deleteMessage", ({ messageId, serverId, streamId }) => {
      socket.to(serverId).emit("deleteMessage", { messageId, streamId });
    });

    socket.on("updateMessage", ({ messageId, content, serverId, streamId }) => {
      socket
        .to(serverId)
        .emit("updateMessage", { messageId, content, streamId });
    });

    socket.on("serverChange", handleUserGotOffline);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  };
}

const socketService = new SocketService();

export { socketService };
