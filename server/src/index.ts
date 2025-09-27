import server from "./app";
import { env } from "./conf/env";
import type {} from './types/express';

server.listen(env.PORT, () => {
  console.log(`Server is listening to port ${env.PORT}`);
})