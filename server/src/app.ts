import { env } from "./conf/env";
import express from "express";
import { createDirectMessage, createMessage } from "./services/message.service";
import { Server } from "socket.io";
import helmet from "helmet"
import cors, { CorsOptions } from "cors";
import http from "http";

// Extend Socket type to include userId
declare module "socket.io" {
  interface Socket {
    userId?: string;
    username?: string;
    accentColor?: string;
    displayName?: string;
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
import videocallService from "./services/videocall.service";
import errorMiddleware from "./middlewares/error.middleware";
import { socketService } from "./services/socket.service";

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
  origin: env.ACCESS_CONTROL_ORIGIN as string,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cookieParser());
app.use(helmet())
app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

io.on('connection', (socket) => {
  socketService.listenSocket(socket, io);
});

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/channels", verifyUserJWT, channelRouter);
app.use("/api/v1/servers", verifyUserJWT, serverRouter);
app.use("/api/v1/messages", verifyUserJWT, messageRouter);
app.use("/api/v1/videocall", verifyUserJWT, videocallRoute);
app.use("/api/v1/dms", verifyUserJWT, dmsRouter);

app.use(errorMiddleware.notFoundErrorHandler);
app.use(errorMiddleware.generalErrorHandler);

export default server;
