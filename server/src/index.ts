import { env } from "./conf/env";
import server from "./app";
import type {} from './types/express';

// Cloud Run sets PORT env variable automatically
// Use Cloud Run's PORT if available, otherwise use env.PORT
const PORT = process.env.PORT || env.PORT || 8000;
const HOST = env.HOST || "localhost";

server.listen({ port: PORT, host: HOST }, () => {
  console.log(`Server is listening to port ${PORT}`);
})