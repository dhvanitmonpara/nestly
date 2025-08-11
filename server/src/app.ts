import express from 'express';
import { env } from './conf/env';
import { createMessage } from './services/message.service';
import { Server } from 'socket.io';
import cors, { CorsOptions } from "cors";
import http from 'http';
import healthRouter from "./routes/health.route"
import messageRouter from "./routes/message.route"
import cookieParser from 'cookie-parser'
import userRouter from "./routes/user.route"
import channelRouter from "./routes/channel.route"
import serverRouter from "./routes/server.route"
import { verifyUserJWT } from './middlewares/auth.middleware';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.ACCESS_CONTROL_ORIGIN,
    methods: ["GET", "POST"],
  },
  transports: ["websocket"]
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

io.on('connection', (socket) => {
  // Join channel-specific room
  socket.on('joinServer', (server_ids) => {
    socket.join(server_ids);
    console.log(`User ${socket.id} joined server ${server_ids}`);
    socket.emit('serverJoined', server_ids); // Notify client
  });

  socket.on('message', (msg) => {
    createMessage(msg.content, msg.user.id, msg.channel_id);
    console.log(msg)

    // Emit to everyone in the room except sender
    socket.to(msg.serverId).emit('message', msg);
  });

  socket.on("typing", ({ channelId, username, serverId }) => {
    socket.to(serverId).emit("user_typing", { username, channelId })
  })

  socket.on("stop_typing", ({ channelId, username, serverId }) => {
    socket.to(serverId).emit("user_stop_typing", { username, channelId })
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use("/api/v1/health", healthRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/channels", verifyUserJWT, channelRouter)
app.use("/api/v1/servers", verifyUserJWT, serverRouter)
app.use("/api/v1/messages", verifyUserJWT, messageRouter)

export default server;