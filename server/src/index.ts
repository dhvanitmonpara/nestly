import server from "./app";
import { env } from "./conf/env";
import { connectDB } from "./db/connect";
import { dbInit } from "./models";
import type {} from './types/express';

server.listen(env.PORT, () => {
  console.log(`Server is listening to port ${env.PORT}`);

  (async () => {
    await connectDB()
    await dbInit()
  })()
})