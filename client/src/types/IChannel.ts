import type { IMessage } from "./IMessage";

interface IChannel {
    id: number;
    name: string;
    messages: IMessage[];
};

export type { IChannel }