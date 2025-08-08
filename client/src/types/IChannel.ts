import type { IUser } from "./IUser";

interface IChannel {
  id: number;
  name: string;
  owner_id: string
}

type IChannelWithMessage = IChannel & {
  messages: {
    id: string
    content: string
    user: IUser
  }[]
}

export type { IChannel, IChannelWithMessage };
