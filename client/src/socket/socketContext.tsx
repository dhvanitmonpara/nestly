import { createContext, useEffect, useState, type ReactNode } from "react";
import io, { Socket } from "socket.io-client";
import useUserStore from "../store/userStore";
import env from "../conf/env";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

interface SocketProviderProps {
  children: ReactNode;
}

const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const user = useUserStore((state) => state.user);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const newSocket = io(env.SERVER_URI, {
      transports: ["websocket"],
      auth: {
        userId: user.id,
        username: user.username,
        accent_color: user.accent_color,
        display_name: user.display_name,
      },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setConnected(false);
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider }