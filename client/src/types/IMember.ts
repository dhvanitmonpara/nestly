export interface IncomingMemberType {
  user_id: number;
  server_id: number;
  user: {
    username: string;
    display_name: string;
    accent_color: string;
  };
  isOnline?: boolean;
  isOwner?: boolean;
}
