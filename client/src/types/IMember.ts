export interface IncomingMemberType {
  userId: number;
  serverId: number;
  user: {
    username: string;
    displayName: string;
    accentColor: string;
  };
  isOnline?: boolean;
  isOwner?: boolean;
}
