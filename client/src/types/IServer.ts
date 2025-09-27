import type { IChannel } from "./IChannel";

interface IServer {
  id: number;
  name: string;
  ownerId: string;
  channels?: IChannel[]
}

export type { IServer };