import express from "express";
import { env } from "./conf/env";
import { createDirectMessage, createMessage } from "./services/message.service";
import { Server, Socket } from "socket.io";
import cors, { CorsOptions } from "cors";
import http from "http";

// Extend Socket type to include userId
declare module "socket.io" {
  interface Socket {
    userId?: string;
    username?: string;
    channel?: string;
  }
}
import healthRouter from "./routes/health.route";
import messageRouter from "./routes/message.route";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route";
import channelRouter from "./routes/channel.route";
import serverRouter from "./routes/server.route";
import dmsRouter from "./routes/dms.route";
import videocallRoute from "./routes/videocall.route";
import { verifyUserJWT } from "./middlewares/auth.middleware";
import VideocallService from "./services/videocall.service";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.ACCESS_CONTROL_ORIGIN,
    methods: ["GET", "POST"],
  },
  transports: ["websocket"],
});

const corsOptions: CorsOptions = {
  origin: env.ACCESS_CONTROL_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

const videocall = new VideocallService();

io.on("connection", (socket) => {
  socket.userId = socket.handshake.auth.userId as string;
  socket.username = socket.handshake.auth.username as string;
  socket.channel = socket.handshake.auth.channel as string;

  const handleChannelChange = (channelId: string | null) => {
    const serverIds = Array.from(socket.rooms);
    socket.channel = channelId ?? "";
    socket.to(serverIds).emit("userGotOffline", { userId: socket.userId });
  };

  // Join channel-specific room
  socket.on("joinServer", (server_ids) => {
    socket.join(server_ids);
    console.log(`User ${socket.id} joined server ${server_ids}`);
    socket.emit("serverJoined", server_ids); // Notify client
  });

  socket.on("message", (msg) => {
    if (msg.user?.id) {
      createMessage(msg.content, msg.user.id, msg.channel_id);
    } else {
      createDirectMessage(msg.content, msg.sender_id, msg.conversation_id);
    }
    socket.to(msg.serverId).emit("message", msg);
  });

  socket.on("directMessage", (msg) => {
    createDirectMessage(msg.content, msg.sender_id, msg.conversation_id);
    socket.to(msg.user2).emit("directMessage", msg);
  });

  socket.on("userOnlineDM", ({ userId, conversationId }) => {
    socket.join(conversationId);
    socket.to(conversationId).emit("userGotOnlineDM", {
      userId,
      conversationId,
      username: socket.username,
    });
    const onlineUsersSockets = io.sockets.adapter.rooms.get(conversationId);
    const onlineUsers = Array.from(onlineUsersSockets || []).map((socketId) => {
      const sock = io.sockets.sockets.get(socketId); // socket instance
      if (sock && sock.userId) {
        return {
          userId: sock.userId,
          username: sock.username,
          serverIds: Array.from(sock.rooms),
          channelId: sock.channel,
        };
      }
    });
    socket.emit(
      "previousOnlineUsers",
      onlineUsers.filter((u) => u?.userId !== socket.userId)
    );
  });

  socket.on("userGotOnlineDM", ({ userId, conversationId }) => {
    socket.to(conversationId).emit("userGotOnlineDM", {
      userId,
      conversationId,
      username: socket.username,
    });
  });

  socket.on("userGotOfflineDM", ({ userId, conversationId }) => {
    socket
      .to(conversationId)
      .emit("userGotOfflineDM", { userId, conversationId });
  });

  socket.on("userOnline", ({ channelId, serverId }) => {
    socket.channel = channelId;
    socket.to(serverId).emit("userGotOnline", {
      channelId,
      userId: socket.userId,
      serverId,
      username: socket.username,
    });
    const onlineUsersSockets = io.sockets.adapter.rooms.get(serverId);
    const onlineUsers = Array.from(onlineUsersSockets || []).map((socketId) => {
      const sock = io.sockets.sockets.get(socketId); // socket instance
      if (sock && sock.userId) {
        return {
          userId: sock.userId,
          username: sock.username,
          serverIds: Array.from(sock.rooms),
          channelId: sock.channel,
        };
      }
    });
    console.log("Previous online users:", socket.userId);
    socket.emit(
      "previousOnlineUsers",
      onlineUsers.filter((u) => u?.userId !== socket.userId)
    );
  });

  socket.on("disconnect", () => {
    handleChannelChange(null);
  });

  socket.on("ChannelChanged", handleChannelChange);

  socket.on("typing", ({ channelId, username, serverId }) => {
    socket.to(serverId).emit("user_typing", { username, channelId });
  });

  socket.on("stop_typing", ({ channelId, username, serverId }) => {
    socket.to(serverId).emit("user_stop_typing", { username, channelId });
  });

  socket.on("listRooms", async (roomNames: string[]) => {
    const rooms = await videocall.listRooms();
    console.log(rooms);
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
    videocall.deleteRoom(roomName);
  });

  socket.on("deleteMessage", ({ messageId, serverId, streamId }) => {
    socket.to(serverId).emit("deleteMessage", { messageId, streamId });
  });

  socket.on("updateMessage", ({ messageId, content, serverId, streamId }) => {
    socket
      .to(serverId)
      .emit("updateMessage", { messageId, content, streamId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/channels", verifyUserJWT, channelRouter);
app.use("/api/v1/servers", verifyUserJWT, serverRouter);
app.use("/api/v1/messages", verifyUserJWT, messageRouter);
app.use("/api/v1/videocall", verifyUserJWT, videocallRoute);
app.use("/api/v1/dms", verifyUserJWT, dmsRouter);

export default server;
