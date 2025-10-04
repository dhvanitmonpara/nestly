interface IDirectMessage {
  id: string;
  content: string;
  conversationId: string;
  senderId: number;
  createdAt?: string;
  updatedAt?: string;
}

export type { IDirectMessage };
