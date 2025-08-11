import type { IChannel } from "./IChannel";

interface IServer {
  id: number;
  name: string;
  owner_id: string;
  channels?: IChannel[]
}

export type { IServer };