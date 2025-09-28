import server from "./app";
import { env } from "./conf/env";
import type {} from './types/express';

server.listen(env.PORT, () => {
  console.log(`Server is listening to port ${env.PORT}`);
})

setInterval(() => {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`Heap: ${Math.round(used * 100) / 100} MB`);
}, 5000);
