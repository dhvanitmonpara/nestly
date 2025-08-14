interface IDirectMessage {
  id: string;
  content: string;
  conversation_id: string;
  sender_id: number;
  createdAt?: string;
  updatedAt?: string;
}

export type { IDirectMessage };
